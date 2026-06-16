# Stride - Project Architecture & Academic Review Guide

This guide is a comprehensive overview of Stride's system architecture, features, database models, AI pipelines, and security mechanisms, designed to prepare you for your academic review.

---

## 1. Frontend

### Feature Overview
* **Student Dashboard**: Displays overall course progress meters, completed lessons checklists, levels, and total XP. Includes quick-resume buttons.
* **Course Catalog**: Supports list filtering by category, search queries, and levels (Beginner, Intermediate, Advanced).
* **Interactive Content Viewer**: Renders split-screen course panels. Left side shows section and lesson checklists. Right panel mounts dynamic renderers: video players, clean text readers, quiz managers, PDF viewers, or coding editors.
* **Instructor Dashboard**: Enables building course contents, adding sections, designing code exercise templates, configuring quiz correct answers, and managing student enrollment stats.
* **Gamified Feedback Elements**: Leverages Level-Up modals, XP gauges, and dynamic animations.

### Architecture & Design Choices
* **Single-Page Application (SPA)**: React.js structured with Vite.
* **State Management**: React Context (`AuthProvider.jsx`) maintaining student auth states, session tokens, and profile statistics globally.
* **Transitions**: Framer Motion providing fluid layout entries and button micro-interactions.
* **IDE Embed**: Monaco Editor (`@monaco-editor/react`) for full syntax formatting and autocompletions in-browser.

### Professor Q&A
* **Q: Why did you choose Vite over Create React App (CRA)?**
  * *Answer*: CRA uses Webpack, which bundles the entire application before starting the dev server, resulting in slow startup times. Vite utilizes ES Modules (ESM) to load files on-demand in the browser and pre-bundles dependencies with Esbuild (written in Go), providing fast start times and Hot Module Replacement (HMR).

---

## 2. Backend

### Feature Overview
* **Stateless API Gateway**: Express.js server routes handling request formatting, JSON parsers, and custom rate limits.
* **Authentication Service**: Registers users, handles login validation, and issues signed token blocks.
* **Enrollment & Payments**: Validates course seats, checks user enrollment status, and integrates Stripe checkouts.
* **Secure Gamification Verification**: Manages user completions and calculates/applies XP additions.
* **Cloud Upload Service**: Routes incoming multimedia assets (videos/images/documents) to Cloudinary.

### Exhaustive Architectural Detail
* **Model-View-Controller (MVC) Routing**: Express serves JSON endpoints split into clean modular routes (under `/server/routes/`):
  - `authRoutes.js`: Login (`/api/auth/login`), registration (`/api/register-user`), profile updates.
  - `courseRoutes.js`: CRUD courses, enrollment checks, instructor assignments.
  - `contentRoutes.js`: Content loads (`/api/courses/:courseId/content`) and content edits.
  - `enrollmentRoutes.js`: Course signups, unenrollments, and progress updates (`/api/enrollments/:id/progress`).
* **JWT Token Verification Pipeline**:
  ```
  Client Request ──> Header: "Authorization: Bearer <token>"
                        │
                        ▼
               verifyToken Middleware
                        │
                  Check Signature 
             (jwt.verify using JWT_SECRET)
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
       Valid                        Invalid
  Attach req.user = decoded       Return HTTP 401
  Call next()                     Unauthorized
  ```
* **In-Memory Sliding Window Rate Limiting**:
  - The middleware `codeExecutionLimiter` prevents API abuse on compute-heavy routes (like running code).
  - It maintains a `Map` of client identifiers (user IDs or IPs) mapped to arrays of timestamp numbers.
  - Upon request, the backend drops timestamps older than 60 seconds. If the remaining array length is $\ge 10$, it blocks the request with HTTP `429 Too Many Requests`.

### Professor Q&A
* **Q: Why are Express serverless routes stateless?**
  * *Answer*: Express routes do not hold session configurations in server RAM. Any container can verify client tokens using a shared cryptography secret key, allowing automatic horizontal scaling.
* **Q: How does the backend process file uploads?**
  * *Answer*: It utilizes **Multer** middleware to capture multipart form data. The file stream is passed directly to the Cloudinary API, returning a secure URL and public ID which are saved to the MongoDB course document.

---

## 3. Database

### Document Schema Specifications (MongoDB & Mongoose)

1. **`User`** (`models/User.js`):
   - Fields: `name` (string), `email` (string, unique, indexed), `password` (hashed), `role` (`student`, `instructor`, `admin`), `xp` (integer), `level` (integer).
2. **`Course`** (`models/Course.js`):
   - Fields: `title` (string), `short_description` (string), `price` (number in cents), `instructorId` (ObjectId ref User), `topics` (array of strings), `seats` (integer).
3. **`CourseContent`** (`models/CourseContent.js`):
   - Fields: `courseId` (ObjectId ref Course, unique index), `sections` (array of section schemas).
   - *Section Schema*: `title` (string), `lessons` (array of `Mongoose.Schema.Types.Mixed` subdocuments).
4. **`Enrollment`** (`models/Enrollment.js`):
   - Fields: `userId` (ObjectId ref User), `courseId` (ObjectId ref Course), `progress` (0–100), `completedLessons` (array of strings).
5. **`MLFeature`** (`models/MLFeature.js`):
   - Fields: `studentId` (ref User), `courseId` (ref Course), `login_count` (number), `total_session_time_minutes` (number), `lessons_completed` (number), `avg_assessment_score` (number), `risk_level` (`low`, `medium`, `high`).

### polymorphic Content modeling
The `lessons` array is set to Mongoose `Mixed` type. This allows each lesson document to morph structure based on its type:
- *video*: `{ id, title, type: "video", content: "url" }`
- *article*: `{ id, title, type: "article", content: "plain text" }`
- *quiz*: `{ id, title, type: "quiz", questions: [{ question, options, correctAnswers }] }`
- *coding*: `{ id, title, type: "coding", exercise: { description, starterCode, testCases: [{ input, expectedOutput }] } }`

### Professor Q&A
* **Q: How are index lookups optimized in your schemas?**
  * *Answer*: Highly queried fields are indexed (e.g. `email` on User, `courseId` on CourseContent). Compound indexes are applied on User/Course references in `Enrollment` to optimize student dashboard lookups.

---

## 4. AI

### A. Student Attrition Predictor (`dropout_service`)
* **Algorithm**: **Random Forest Classifier** (optimized via `GridSearchCV` on F1-score).
* **Pipeline Flow**:
  1. **Data Collection**: Reads daily log aggregates (`StudentMetric`, `Enrollment`, `User`).
  2. **programmatic Label Correction (`fix_obvious_mislabels`)**: Cleans training datasets by filtering out mislabeled entries. Programmatically forces labels:
     - Active (0): If study time $\ge 250$ mins or logins $\ge 8$, and progress matches high grades.
     - At-Risk (1): If logins $\le 3$, and zero lessons or quizzes are completed.
  3. **Feature Vectors**: Computes density averages (`login_count` / `days_active`), lesson completion percentages, quiz scores, and study time durations.

### B. Hybrid Course Recommender (`recommender_service`)
The system computes personalized course suggestions through a strict **4-layer pipeline**:

```
[User ID / Completed Courses] 
      │
      ▼
┌──────────────────────────────────────────────┐
│ Layer 1: Content-Based Filtering             │
│ (TF-IDF Vectorizer & Cosine Similarity)      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Layer 2: Collaborative Filtering             │
│ (User-Course Matrix & Jaccard Similarity)    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Layer 3: Rule-Based Filtering                │
│ (Prerequisites & Difficulty Progression)      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Layer 4: Ranking & Hybrid Fusion             │
│ (Score Weighting, Freshness, Explanations)   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
             [Top Recommendations]
```

1. **Layer 1 (Content-Based)**: Compiles text metadata (title, category, tags) of courses. Evaluates a **TF-IDF Vectorizer** to represent descriptions. Computes a **Cosine Similarity Matrix** against the student's taken courses, returning similarity scores.
2. **Layer 2 (Collaborative)**: Constructs a binary User-Course matrix. Calculates peer similarities using **Jaccard Similarity** (intersection over union of taken courses). Scores target candidate courses based on neighbor student enrollment densities.
3. **Layer 3 (Rule-Based)**: Checks prerequisites. Filters out courses if the student has not completed required classes. Checks level progressions (filters advanced courses if student has no prior beginner/intermediate experience in that category).
4. **Layer 4 (Ranking & Fusion)**: Integrates scores from Layer 1 (weight: 30%), Layer 2 (weight: 40%), course popularity (weight: 20%), and course freshness (weight: 10%). Generates natural language explanations (e.g. *"Similar to HTML foundations"*).

### Professor Q&A
* **Q: Why Jaccard Similarity instead of Cosine Similarity for Collaborative Filtering?**
  * *Answer*: Cosine similarity is usually applied to continuous ratings (e.g. 1-5 stars) where user magnitudes can vary. Stride's enrollment interactions are binary (enrolled or not). Jaccard is mathematically designed for binary set overlaps:
    $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
    making it faster and more suitable for binary interaction matrices.

---

## 5. Coding Editor

### Execution Pipeline
* **Code Submission**: The client submits user code to the Express API backend, routing it to the execution helper (`localRunner.js`).
* **Sandbox Execution**:
  1. Spawns an isolated microVM sandbox container via `@vercel/sandbox`.
  2. Writes the student's code to the microVM workspace.
  3. Launches compilers/interpreters (`python3`, `node`) inside the microVM.
  4. Manages runtime parameters and streams output buffers asynchronously.
  5. If run in local development environments, it falls back to spawning subprocesses of the local operating system runtime.

### LeetCode-Style wrapping
- **Function Extractor**: Regex filters scan the exercise's starter template (e.g. `def add(a, b)`) to parse the function name.
- **Type-Casting Wrapper**: Appends wrapper code to the user submission. The wrapper reads stdin lines, parses inputs using JSON loaders (casting integers, floats, booleans, arrays, and dictionaries), invokes the user function with these arguments, and prints the result to stdout.

### Professor Q&A
* **Q: How are inputs safely parsed inside the Python runner?**
  * *Answer*: Stdin lines are parsed using a parser. It checks boolean matches (`True`/`False`) and evaluates strings with a JSON loader. If JSON loading succeeds, it automatically converts parameters to standard data types (lists, dicts, numbers). Otherwise, it defaults to raw strings.

---

## 6. Deployment

### Infrastructure Overview
* **Client Hosting**: compiled Vite static assets served globally via Vercel Edge CDNs.
* **Serverless backend**: Express server endpoints compiled as stateless serverless function handlers.
* **Database Host**: Cloud MongoDB Atlas.

### Serverless Architecture Patterns
* **Connection Reuse**: Serverless containers are stateless and scale horizontally. To prevent overloading MongoDB Atlas with open sockets, we inspect connection states (`mongoose.connection.readyState === 1`) to reuse existing open sockets.
* **Git-Driven CI/CD**: Pushing changes to `main` triggers automated build pipelines on Vercel. Sensitive credentials (like MongoDB connection strings or Stripe keys) are stored as encrypted environment variables in the dashboard.

---

## 7. Security

Stride implements a defense-in-depth security model:

```
[Client Request] ──> [CORS Whitelisting] ──> [JWT Token Signature Validation] 
                                                         │
[MongoDB Database] <── [Mongoose ODM Sanitization] <─────┘
                                                         │
[Firecracker VM] <── [10s Sandbox Timeout Limit] <───────┘
```

1. **API Authorization (JWT)**: Ensures user requests are authenticated. Signed cryptographically with a secret key, protecting user details from forgery.
2. **Password Cryptography**: Hashes passwords using **bcryptjs** with salt rounds before storing, protecting credentials from database leaks.
3. **Execution Sandboxing (Firecracker)**: Untrusted student code is isolated inside separate cgroups/chroot microVM sandboxes, preventing students from executing host shell commands or inspecting the database network.
4. **Compute Resource Protection (Timeout)**: Enforces a strict **10-second runtime limit** on the sandbox, terminating infinite loops (`while True: pass`) to prevent CPU exhaustion.
5. **NoSQL Injection Mitigation**: Uses Mongoose schemas to sanitize incoming JSON parameters. Mongoose validates types and queries, preventing parameter injection attacks (e.g. using query objects like `{ "$gt": "" }` to bypass login checks).
6. **Secure Gamification (Backend Validation)**: Gamification XP and progress are evaluated and awarded on the backend, preventing client-side API spoofing.
7. **CORS Restrictions**: Express server whitelists only trusted origins (`localhost` and `*.vercel.app`), blocking malicious cross-origin requests.
8. **Cross-Site Scripting (XSS) Prevention**: Replaced dynamic HTML binding (`dangerouslySetInnerHTML`) in course content cards with standard plain text rendering and `whitespace-pre-wrap` styles, preventing HTML injection.
