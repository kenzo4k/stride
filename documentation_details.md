# Stride: Technical Database, API, & Code-Level Specification

This document provides a comprehensive technical reference for the **Stride** learning platform. It details the Mongoose schemas, REST API endpoints, and core code-level implementation logic.

---

## 1. Database Schema & Mongoose Models

Stride uses a hybrid database setup where structured student enrollment data is kept in PostgreSQL (conceptually aligned in midyear reports) and the main content, quiz, code exercises, and ML features are stored as document collections in **MongoDB** via Mongoose.

### 1.1 `User` Schema
Represents all roles on the platform (Students, Instructors, and Admins).

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required | Display name of the user. |
| `email` | String | Required, Unique, Lowercase | Unique identifier for authentication. |
| `password` | String | Required | Bcrypt-hashed password. |
| `photoURL` | String | Optional | URL to the user profile picture. |
| `role` | String | Enum: `['student', 'instructor', 'admin']` | Role defining system permissions. Default: `'student'`. |
| `xp` | Number | Default: `0` | Experience points accumulated by learning. |
| `level` | Number | Default: `1` | Gamified level (calculated as `Math.floor(xp / 100) + 1`). |
| `bio` | String | Optional | Instructor bio or user description. |
| `title` | String | Optional | Headline for profiles (e.g. "Senior Python Lead"). |
| `lastLogin` | Date | Default: `Date.now` | Tracked session date. |
| `status` | String | Enum: `['active', 'banned', 'suspended']` | Status restriction flag. Default: `'active'`. |
| `isPublic` | Boolean | Default: `true` | Privacy flag for leaderboards. |
| `streakDays`| Number | Default: `0` | Consecutive active learning days. |

*   **Pre-save Hook**: Automatically hashes `password` with `bcryptjs` (salt factor 10) if modified.

---

### 1.2 `Course` Schema
Stores metadata for courses created by instructors and published by administrators.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required | Course name. |
| `short_description` | String | Optional | Short card-level summary. |
| `detailed_description` | String | Optional | Full page-level rich text description. |
| `price` | Number | Required | Price in USD. |
| `discount_price` | Number | Optional | Discounted pricing. |
| `instructor` | Object | Required nested properties | Sub-document containing `name`, `email`, `bio`, `qualification`, `photoURL`. |
| `instructorId` | ObjectId | Ref: `'User'` | Link to instructor account. |
| `category` | String | Required | Academic segment (e.g., "Python", "Data Science"). |
| `image` | String | Optional | Image cover asset URL. |
| `enrollmentCount` | Number | Default: `0` | Active enrollment metrics. |
| `seats` | Number | Required | Total enrollment cap. |
| `rating` | Number | Default: `0` | Average star rating. |
| `level` | String | Enum: `['Beginner', 'Intermediate', 'Advanced']` | Course difficulty baseline. Default: `'Beginner'`. |
| `prerequisites` | [String] | Array of Strings | Prerequisites checked by the recommender system. |
| `status` | String | Enum: `['active', 'pending', 'rejected', 'draft', 'published', 'archived']` | Workflow status. Default: `'pending'`. |

*   **Indexes**: `{ status: 1 }`, `{ category: 1, status: 1 }`, `{ instructorId: 1 }`.

---

### 1.3 `CourseContent` Schema
Contains curriculum chapters and lesson structures mapped to individual courses.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | ObjectId | Ref: `'Course'`, Required, Unique | Parent course reference. |
| `sections` | [Section] | Array of Section objects | Ordered chapters container. |

*   **Section Sub-Schema**:
    *   `title`: String (Required)
    *   `lessons`: Array of `Mixed` (supports text articles, video links, quizzes, and coding sandbox schema structures).

---

### 1.4 `Enrollment` Schema
Maps students to courses and tracks active study progression.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId | Ref: `'User'`, Required | Enrolled Student reference. |
| `courseId` | ObjectId | Ref: `'Course'`, Required | Targeted Course reference. |
| `progress` | Number | Default: `0`, Range: `0-100` | Percentage of lessons completed. |
| `grade` | Number | Default: `0`, Range: `0-100` | Highest score achieved on final examinations. |
| `completedLessons` | [String] | Array of String IDs | List of finished lesson UUIDs. |
| `status` | String | Enum: `['active', 'completed', 'cancelled']` | Course enrollment status. Default: `'active'`. |
| `refundStatus` | String | Enum: `['none', 'requested', 'approved', 'denied']` | Refund state tracking. Default: `'none'`. |

*   **Indexes**: Compound unique index `{ userId: 1, courseId: 1 }` to block double enrollment.

---

### 1.5 `Assessment` Schema
Represents quizzes and final exams containing interactive, structured question models.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `courseId` | ObjectId | Ref: `'Course'`, Required | Target course link. |
| `type` | String | Enum: `['pre-assessment', 'final-exam']` | Assessment category. Default: `'final-exam'`. |
| `topics` | [Topic] | Array of Topic objects | List of evaluated knowledge tracks. |

*   **Topic Sub-Schema**:
    *   `name`: String (Required)
    *   `questions`: Array of Question sub-schemas.
*   **Question Sub-Schema**:
    *   `type`: Enum: `['mcq', 'fill_blank', 'matching', 'true_false']` (Required)
    *   `question`: String (Required)
    *   `options`: [String] (MCQ choice labels)
    *   `correctAnswer`: Mixed (Number index for MCQ, Boolean for true/false)
    *   `answer`: String (text matching answer for fill-in-the-blank)
    *   `pairs`: Array of matching pairs: `[{ left: String, right: String, correct: Boolean }]`
    *   `points`: Number (Default: `1`)

*   **Indexes**: Unique compound index `{ courseId: 1, type: 1 }`.

---

### 1.6 `MLFeature` Schema
Gathers weekly behavioral features per student per course to perform ML dropout prediction.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `studentId` | ObjectId (Ref: `'User'`) | Required | Evaluated student link. |
| `courseId` | ObjectId (Ref: `'Course'`) | Required | Target course monitored. |
| `window_start` | Date | Required | Start of 7-day window. |
| `window_end` | Date | Required | End of 7-day window. |
| `login_count` | Number | `0` | Number of logins in 7 days. |
| `days_active` | Number | `0` | Number of unique days active. |
| `total_session_time_minutes` | Number | `0` | Total learning minutes. |
| `avg_session_time_minutes` | Number | `0` | Average session length. |
| `median_session_time_minutes` | Number | `0` | Median session length. |
| `lessons_started` | Number | `0` | Lessons opened in the window. |
| `lessons_completed` | Number | `0` | Lessons marked complete. |
| `assessments_attempted` | Number | `0` | Tests/quizzes submitted. |
| `avg_assessment_score` | Number | `0` | Average score across attempts. |
| `num_failed_attempts` | Number | `0` | Attempts scoring `< 60%`. |
| `num_repeated_attempts` | Number | `0` | Assessment re-takes. |
| `no_improvement_attempts` | Number | `0` | Retries with zero score gain. |
| `dropout_risk_score` | Number | `null` | Predicted probability (0.0 to 1.0) from ML model. |
| `dropout_prediction` | Boolean | `null` | ML Binary output flag (true if score > 0.7). |
| `risk_level` | String | `null` | Enum: `['low', 'medium', 'high', null]`. |

*   **Indexes**: Compound unique index `{ studentId: 1, courseId: 1, window_start: 1 }`.

---

### 1.7 `StudentMetric` Schema
Internal historical tracking table for tracking general student analytics.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `studentId` | ObjectId (Ref: `'User'`) | Required | Student link. |
| `courseId` | ObjectId (Ref: `'Course'`) | Required | Course link. |
| `window_start` | Date | `Date.now` | Tracking start point. |
| `dropout_next_7_days` | Boolean | `false` | True target flag (for ML training). |
| `engagement_score` | Number | `0` | Core engagement index (0-100). |
| `risk_flag` | String | `'low'` | Enum: `['low', 'medium', 'high']`. |

---

### 1.8 `TimeTracking` Schema
Logs exact study sessions by day to generate dashboard learning charts.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `studentId` | ObjectId (Ref: `'User'`) | Required | Active student. |
| `courseId` | ObjectId (Ref: `'Course'`) | Required | Course targeted. |
| `date` | String | Required | YYYY-MM-DD string key. |
| `minutes` | Number | Default: `0` | Minutes spent studying. |
| `sessions` | Number | Default: `1` | Session login triggers. |

*   **Indexes**: Unique compound index `{ studentId: 1, courseId: 1, date: 1 }`.

---

## 2. API Contracts & Endpoint Matrix

The main server routes are exposed under `/api` and gated using token-based middleware.

### 2.1 Middleware Authorization Rules
*   **`verifyToken`**: Reads and decodes JWT from the header `Authorization: Bearer <token>`. Adds the decoded user to `req.user`.
*   **`requireRole(roles...)`**: Restricts access to specific role enums. Rejects unauthorized accounts with `403 Forbidden`.

---

### 2.2 Endpoint Registry

#### Authentication (`/api/auth`)
*   **`POST /register`**
    *   **Access**: Public
    *   **Body**: `{ email, password, name }` (email must be valid, password >= 6 chars)
    *   **Response**: `200 OK` `{ token: String, user: { id, email, role, name } }`
*   **`POST /login`**
    *   **Access**: Public
    *   **Body**: `{ email, password }`
    *   **Response**: `200 OK` `{ token: String, user: { id, email, role, name, xp, level } }`

#### User Actions (`/api/users`)
*   **`GET /me`**
    *   **Access**: Enrolled Student / Instructor / Admin (verifyToken)
    *   **Response**: `200 OK` Detailed user profile object (excluding password hash).
*   **`PUT /profile`**
    *   **Access**: Enrolled Student / Instructor / Admin
    *   **Body**: `{ name, photoURL, bio, title }`
    *   **Response**: `200 OK` Updated profile object.
*   **`PATCH /settings`**
    *   **Access**: Authenticated User
    *   **Body**: `{ isPublic }`
    *   **Response**: `200 OK` `{ message: 'Settings updated successfully', user }`
*   **`GET /`**
    *   **Access**: Admin Only (`requireRole('admin')`)
    *   **Response**: `200 OK` Array of all users registered on the platform.
*   **`PATCH /:id/role`**
    *   **Access**: Admin Only
    *   **Body**: `{ role }`
    *   **Response**: `200 OK` Updated user object.

#### Course Catalog & CMS (`/api/courses`)
*   **`GET /`**
    *   **Access**: Public
    *   **Response**: `200 OK` List of all published courses.
*   **`GET /:id`**
    *   **Access**: Public
    *   **Response**: `200 OK` Detailed course object with instructor specifications.
*   **`POST /`**
    *   **Access**: Instructor / Admin (`requireRole('instructor', 'admin')`)
    *   **Body**: Course Schema Payload (e.g. `{ title, price, seats, category, level, prerequisites }`)
    *   **Response**: `201 Created` Created course object.
*   **`PUT /:id`**
    *   **Access**: Instructor (must be course owner) / Admin
    *   **Body**: Updated course parameters
    *   **Response**: `200 OK` Updated course object.
*   **`DELETE /:id`**
    *   **Access**: Instructor / Admin
    *   **Response**: `200 OK` `{ message: 'Course deleted successfully' }`

#### Course Content Delivery (`/api/courses`)
*   **`GET /:courseId/content`**
    *   **Access**: Student (must be enrolled) / Instructor / Admin
    *   **Response**: `200 OK` Content structure including chapters, lesson ids, titles, and exercise specs.
*   **`PUT /:courseId/content`**
    *   **Access**: Instructor / Admin
    *   **Body**: `{ sections: [...] }`
    *   **Response**: `200 OK` Updated content structure.

#### Interactive Assessments (`/api/courses`)
*   **`GET /:courseId/assessment/:type`**
    *   **Access**: Student (must be enrolled) / Instructor / Admin
    *   **Notes**: **Sanitizes output** if requester is a student—automatically strips `correctAnswer`, `answer`, and `pairs[i].correct` keys to protect exam integrity.
    *   **Response**: `200 OK` Sanitized assessment questions layout.
*   **`POST /:courseId/assessment/:type/submit`**
    *   **Access**: Student
    *   **Body**: `{ answers: [{ questionId: String, answer: Mixed }] }`
    *   **Response**: `200 OK` `{ score: Number, passed: Boolean, xpAwarded: Number, newXP: Number, newLevel: Number }`

#### Course Enrollments (`/api/enrollments`)
*   **`POST /`**
    *   **Access**: Student
    *   **Body**: `{ courseId }`
    *   **Response**: `201 Created` `{ message: 'Enrolled successfully', enrollment }`
*   **`PATCH /:id/progress`**
    *   **Access**: Student
    *   **Body**: `{ progress: Number, completedLessons: [String] }`
    *   **Response**: `200 OK` Updated enrollment record.

#### Code execution endpoints
*   **`POST /api/execute`**
    *   **Access**: Student / Instructor / Admin (Rate-limited to 10 requests/min)
    *   **Body**: `{ code: String, language: String, version: String, stdin: String, courseId: String, lessonId: String }`
    *   **Response**: `200 OK` JSON wrapper containing stdout, stderr, compile stderr, and exit codes.
*   **`POST /api/execute-tests`**
    *   **Access**: Student / Instructor / Admin
    *   **Body**: `{ courseId: String, lessonId: String, code: String, language: 'python' }`
    *   **Response**: `200 OK` `{ passed: Boolean, xpAwarded: Number, results: [...] }`

#### Dropout Prediction & Analytics (`/api/dropout`)
*   **`GET /predictions`**
    *   **Access**: Instructor Only
    *   **Response**: `200 OK` List of at-risk student records containing features and risk values.
*   **`POST /run-predictions`**
    *   **Access**: Instructor Only
    *   **Response**: `200 OK` `{ message: 'Predictions generated successfully' }`

---

## 3. Code-Level Implementation Logic

This section breaks down the core backend algorithms that control key features of the platform.

### 3.1 Monaco IDE Sandboxed Code Evaluation Flow
When a student submits code in a coding exercise, `evaluateCodeSubmission` handles code wrapping, executing test cases, evaluating results, and awarding XP.

```
   Student Submission (code, courseId, lessonId)
                         │
                         ▼
             Query CourseContent lessons
                         │
                         ▼
        Does starterCode have a Python function?
           ├── Yes ──> Extract name (Regex) & wrap with sys.stdin loop
           └── No  ──> Run code raw
                         │
                         ▼
       Map testCases ──> executeCodeLocally()
                         │
                         ▼
             Check passed criteria:
             stdout matches expected AND exitCode === 0
             AND stderr is empty AND compileStderr is empty
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   ALL Passed?                        Any Fail?
  (passedAll = true)                 (passedAll = false)
        │                                 │
        ▼                                 ▼
 Award XP to User                        Return:
 Add lesson to completedLessons          `passed: false` and test details
 Update Enrollment progress %
        │
        ▼
 Return: `passed: true`, `xpAwarded`
```

#### Code Wrapping Logic:
1. **FunctionName Extraction**: A regular expression scans the starter code to detect if a Python function is defined (`def function_name(...)`). If matched, the function name is captured.
2. **Wrapper Composition**: If a function name is found, a Python script is appended to the user's code submission. This wrapper reads line-delimited inputs from standard input (`sys.stdin`), parses each line using a JSON loader utility, passes those values as arguments into the student's function, and outputs the result.
3. **Execution**: The wrapped code is sent to the local subprocess execution runner (or public Vercel sandbox API). Test assertion checks require that the returned standard output equals the expected output value, no standard errors exist, and the exit status code is zero.

---

### 3.2 Automated Assessment Grading Logic
Assessments auto-calculate final scores and support multiple types: Multiple Choice (MCQ), True/False, Fill in the Blank, and List Matching.

#### MCQ, True/False & Fill-in-the-Blank Checking:
*   **MCQ & True/False**: Evaluates the student's answer against the stored correct answer using standard value equality.
*   **Fill in the Blank**: Strips all leading and trailing whitespace from both values and converts them to lowercase before checking for exact string matches.

#### List Matching Evaluation Algorithm:
*   **Standardization**: Converts the student's submitted pairs (whether formatted as an array of matching components or a JSON object containing key-value configurations) into a structured list of left-to-right connections.
*   **Verification**: Normalizes both left and right strings (trimming whitespace and converting to lowercase) and compares each student-provided link against the correct database mapping.
*   **Final Grading**: The question is marked correct if and only if:
    1. The number of student-defined pairs matches the total number of correct database pairs.
    2. Every single student-defined pair is successfully verified against the database configuration.

---

### 3.3 Hybrid Recommender Microservice Architecture
The Python microservice calculates personalized recommendations using a four-layered pipeline:

#### 1. Content-Based Similarity
Computes TF-IDF (Term Frequency-Inverse Document Frequency) matrices derived from all course titles, tag matrices, and descriptions, ignoring English stop-words. It then calculates a cosine similarity matrix between the vector space representation of the course catalog and the user's enrolled/completed courses to score matching course topics.

#### 2. Collaborative Neighborhoods
Builds user-to-peer enrollment matrices and computes Jaccard similarity indices between users. If high similarity exists between the current student and neighbors, the neighbor's completed courses (which the current user has not enrolled in) are selected as recommendation candidates.

#### 3. Knowledge-Based Sequence Gate
Examines course prerequisites and progression orders. Prerequisite verification is case-insensitive and ignores surrounding whitespace. Additionally, it checks if a beginner-level course exists in the database for the given category before applying advanced level filters, preventing potential recommendation deadlocks for custom categories.

#### 4. Ranking & Explainable AI (XAI)
Consolidates candidates and ranks them by scaling relevance scores with course popularity and exponential recency decay. It then assigns a UI reason string to explain the choice:
*   *Content Match*: `"Similar to [Course title]"`
*   *Collaborative Match*: `"Highly rated by students with similar profiles"`
*   *Knowledge Match*: `"Building on your study of [Prerequisite course]"`

---

### 3.4 Student Retention Metric Aggregation Logic
Every Sunday, the system compiles student activities over the prior 7 days to compile a feature vector for ML inference.

The metrics aggregation combines tracking schemas into `MLFeature` records:
*   **`login_count`**: Aggregates login timestamps in the database logs.
*   **`days_active`**: Counts unique ISO date strings (`YYYY-MM-DD`) logged inside a distinct tracking array.
*   **`total_session_time_minutes`**: Summarizes cumulative time spent by adding up all daily `TimeTracking` durations inside the 7-day window.
*   **`avg_session_time_minutes` & `median_session_time_minutes`**: Computes standard mean and median formulas over the tracked session durations list.
*   **`assessments_attempted` & `avg_assessment_score`**: Collects assessment event documents to count total attempts and calculate the mean grade.
*   **`num_failed_attempts`**: Filters attempts scoring below the 60% threshold.
*   **`num_repeated_attempts`**: Counts re-submissions of identical assessment IDs.
*   **`no_improvement_attempts`**: Tracks occurrences where a repeated assessment attempt failed to score higher than a previous attempt.
