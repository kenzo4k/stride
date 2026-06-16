# STRIDE: EXPANDED PRESENTATION SLIDES OUTLINE & CONTENT (17 SLIDES)

This document contains the slide contents and corresponding speaker notes for the Stride Project Presentation. Each topic has been expanded to take exactly two slides.

---

## Slide 1: Title Slide
*   **Slide Title**: **STRIDE**
*   **Subtitle**: A Gamified Course Management Platform with Predictive Student Analytics and Vercel Sandbox Code Execution
*   **Visual Suggestion**: Modern dark background with deep purple gradients (matching the mid-year theme), featuring the Stride logo or an abstract learning path icon.
*   **Content**:
    *   **Project**: Stride Platform
    *   **Scope**: Full-Stack Educational Ecosystem
    *   **Presenters**: [Your Name / Team Names]
    *   **Academic Term**: [Term, e.g., Spring 2026]

> **Speaker Notes**:
> *"Good morning/afternoon everyone. Today, I am excited to present Stride, a next-generation course management platform. Stride isn't just another Learning Management System; it is a full-stack, gamified ecosystem built to enhance student engagement, automate technical grading, and offer predictive analytics to help instructors identify at-risk students before they fall behind."*

---

## TOPIC 1: PROBLEM DEFINITION (2 SLIDES)

### Slide 2: Problem Definition - Part 1: The Engagement & Fragmentation Gap
*   **Slide Title**: **The Problem (1/2): Fragmented & Passive Learning**
*   **Content**:
    *   **Volatile Dropout Rates**: Traditional e-learning platforms suffer from massive student dropout rates due to low motivation and passive text/video consumption.
    *   **Fragmented Student Journey**: Students have to jump between a video player, an external coding program, a PDF reader, and a quiz website, losing context along the way.
    *   **The Personalization Gap**: Static, non-adaptive learning pathways force all students through the same static sequence, regardless of their background knowledge.
    *   **Baseline Blindspot**: Platforms fail to capture a student's prior baseline knowledge upon enrollment, making it impossible to measure actual learning growth.

> **Speaker Notes**:
> *"Online education has grown massively, but it faces a core problem: student disengagement. First, traditional platforms act as passive video-and-text repositories, leading to extremely low completion rates. Second, the student journey is highly fragmented. A student must stream a video on one tab, read documentation on another, and open a separate text editor to write code. Finally, there's no adaptive guidance. Every student gets the same content, and we have no baseline data to measure how much they've actually learned upon starting a course."*

---

### Slide 3: Problem Definition - Part 2: Code Execution & Analytics Barriers
*   **Slide Title**: **The Problem (2/2): Technical & Analytics Hurdles**
*   **Content**:
    *   **Local Setup Friction**: Technical courses require students to configure compilers, runtimes (Python/Node), and databases locally, creating a massive barrier to entry.
    *   **Lack of Instant Grading**: Homework assignments are graded manually or with huge delays, robbing students of immediate feedback cycles.
    *   **Instructor Data Blindspot**: Instructors receive aggregate course completion rates *after* a course ends, but have zero visibility into real-time student struggle.
    *   **No Early Warning Signals**: No automated systems exist to analyze week-to-week behavioral drop-offs and flag struggling students while there is still time to intervene.

> **Speaker Notes**:
> *"For technical and programming courses, the barriers are even higher. Students spend their first week just trying to install Python or Node.js, and if they run into compiler errors, they lose motivation. They also suffer from a lack of instant feedback. On the instructor's side, there is a total data blindspot. Instructors only know who failed after the course is over. They have no early warning system tracking weekly behaviors like active minutes, failed quiz retries, and login drops to alert them of at-risk students."*

---

## TOPIC 2: SOLUTION (2 SLIDES)

### Slide 4: Proposed Solution - Part 1: Gamified Learning & In-Browser IDE
*   **Slide Title**: **The Solution (1/2): Interactive & Gamified Learning**
*   **Content**:
    *   **Unified Content Player**: An all-in-one sidebar-driven interface containing video streams, article notes, quizzes, and coding sandboxes.
    *   **Monaco Coding Sandbox**: Integrated in-browser IDE (the editor powering VS Code) with real-time test execution.
    *   **Gamified Loop**: Experience Points (XP) earned for lessons, level-ups, learning streaks, achievements, and badges.
    *   **Social & Engagement Panels**: Global leaderboards to encourage friendly competition, complete with privacy toggles for profile visibility.

> **Speaker Notes**:
> *"Stride addresses these issues directly. For the student, we provide an all-in-one interactive content player. If they are learning to code, they don't need to install anything; they use our integrated Monaco Sandbox directly in the browser. To keep motivation high, we've designed a gamified loop. Students earn XP for completing tasks, build streaks, level up, unlock achievements, and climb a global leaderboard."*

---

### Slide 5: Proposed Solution - Part 2: Assessment Engines & Instructor Insights
*   **Slide Title**: **The Solution (2/2): Assessment & Predictive Analytics**
*   **Content**:
    *   **Dual Assessment Engine**: Enforces a mandatory Pre-Assessment (to establish a student's baseline knowledge) and a Final Exam to calculate knowledge growth.
    *   **Instructor CMS Suite**: Comprehensive course building tools where instructors can manage modules, set up coding challenges, and specify test cases.
    *   **Student Risk Dashboard**: Analytics dashboard displaying enrollment metrics, revenue projections, and completion rates.
    *   **Predictive Retention Flags**: Automated alerts flagging at-risk students, coupled with AI-suggested interventions.

> **Speaker Notes**:
> *"Beyond gamification, Stride implements a dual assessment engine. Students take a mandatory pre-assessment at enrollment and a final exam at the end, allowing us to calculate knowledge acquisition. For instructors, we built a Content Management System to define coding challenges and test cases, alongside an analytics dashboard. This dashboard displays enrollment trends, financial projections, and most importantly, predictive student risk flags so instructors can proactively reach out to struggling learners."*

---

## TOPIC 3: FRAMEWORKS & TECH STACK (2 SLIDES)

### Slide 6: Frameworks & Tech Stack - Part 1: Presentation & Gateway Layers
*   **Slide Title**: **Tech Stack (1/2): Frontend & Express API Gateway**
*   **Content**:
    *   **React 18 SPA (Vite)**: Clean, modular component-based client interface using React Router 7 for secure client-side navigation.
    *   **Tailwind CSS 4 & DaisyUI 5**: Premium styled interface with dark/light themes, smooth transitions, and glassmorphism layouts.
    *   **Node.js & Express 5 Backend**: The primary API Gateway. Coordinates authentication, routes billing, and orchestrates requests.
    *   **Monaco Editor Integration**: Embedded editor providing syntax highlighting, autocomplete, and code formatting in the student playground.

> **Speaker Notes**:
> *"Let's talk technology. The presentation layer is a React 18 Single Page Application compiled with Vite. We utilize Tailwind CSS 4 and DaisyUI 5 for a responsive, modern interface. The gateway layer is powered by Node.js and Express 5. This handles incoming requests, manages user sessions, and communicates with MongoDB. For the editor itself, we embedded the Monaco Editor, bringing full VS-Code-like syntax highlighting and autocompletion right into the web browser."*

---

### Slide 7: Frameworks & Tech Stack - Part 2: AI Services & Execution Sandboxes
*   **Slide Title**: **Tech Stack (2/2): Python Microservices & Runtimes**
*   **Content**:
    *   **FastAPI & Uvicorn**: Independent, asynchronous Python microservices chosen for high performance in data processing and machine learning inference.
    *   **Vercel Sandbox**: Production sandboxing package (`@vercel/sandbox`) that provisions Firecracker micro-VMs to execute code in isolated runtimes.
    *   **Local Python Subprocess Fallback**: Dev environment runner spawning piped processes on local machines.
    *   **Piston API (Secondary Fallback)**: Multi-language public execution engine used as a production failover.
    *   **Data Science Stack**: Scikit-Learn, Pandas, NumPy, and Joblib for predictive model serving.

> **Speaker Notes**:
> *"On the backend, our AI and machine learning features run on two independent Python FastAPI microservices, chosen for their speed and async capabilities. When students submit code, we execute it in a highly secure environment. In production, we run the code inside Vercel Sandbox Firecracker microVMs. If running locally in development, we run it using a piped subprocess fallback, and we have integrated the Piston API as a final failover layer in case the primary sandboxes hit service limits."*

---

## TOPIC 4: DATABASE (2 SLIDES)

### Slide 8: Database Architecture - Part 1: Schema Structure
*   **Slide Title**: **Database (1/2): Document-Oriented Schema Design**
*   **Content**:
    *   **MongoDB Atlas**: Distributed cloud database offering replica sets, scalability, and native NoSQL query execution.
    *   **Mongoose ODM**: Enforces strict schema validations and casting, bridging JavaScript objects to MongoDB.
    *   **Flexibility & Nested Structure**: JSON-like documents natively handle multi-module course structures, nested lessons, and variable quiz structures.
    *   **Session Tracking Collections**: Implements specialized collections like `TimeTracking` to capture student session start, end, and duration logs.

> **Speaker Notes**:
> *"For data persistence, we selected MongoDB Atlas managed through Mongoose. A document-oriented database is perfect for education because curriculums are naturally nested. Courses contain modules, modules contain lessons, and lessons contain quizzes or code challenges. Traditional SQL databases would require complex, slow multi-table joins. In MongoDB, we store this in rich JSON-like documents. We also track learning behaviors using a dedicated TimeTracking collection that captures session durations."*

---

### Slide 9: Database Architecture - Part 2: Collections & ERD
*   **Slide Title**: **Database (2/2): Entity Relationship Diagram (ERD)**
*   **Content**:
    *   **`User` Schema**: Holds authentication hashes, profile details, roles (Student, Instructor, Admin), XP, levels, and streaks.
    *   **`Course` & `CourseContent`**: Main catalogs mapping titles, tags, and array-based syllabus sections.
    *   **`Enrollment`**: Tracks user-to-course relationships, overall progress, quiz grades, and completed lesson IDs.
    *   **`MLFeature`**: Aggregates 12 weekly behavioral metrics per student to feed the dropout engine.
    *   **`Assessment`**: Stores Course Pre-Assessments and Final Exams, separating them via enum types.

> **Speaker Notes**:
> *"This slide maps out our data schema relationships. The User collection links to Enrollments, which map progress (0 to 100%) and grades. Courses are tied to a CourseContent document representing the syllabus. Each Course has Assessments—specifically one pre-assessment and one final exam. To power our machine learning predictions, the MLFeature collection links Users and Courses, acting as a data warehouse that aggregates rolling 7-day behavior metrics."*

---

## TOPIC 5: ARTIFICIAL INTELLIGENCE (2 SLIDES)

### Slide 10: AI Services - Part 1: Hybrid Recommender System
*   **Slide Title**: **AI (1/2): 4-Layer Hybrid Recommender (Port 8000)**
*   **Content**:
    *   **Layer 1: TF-IDF Content Similarity**: Calculates cosine similarity on course description metadata to find similar subjects.
    *   **Layer 2: Collaborative Filtering (Jaccard Index)**: Identifies user-to-user similarity graphs based on mutual enrollments.
    *   **Layer 3: Knowledge/Rule-Based Engine**: Enforces prerequisites and logical progression rules while protecting against deadlocks.
    *   **Layer 4: Hybrid Re-ranking & Explainable AI (XAI)**: Blends scores, popularity, and freshness decay, generating user explanations:
        *   *“Similar to HTML & CSS Foundations”*
        *   *“Building on your study of Introduction to Javascript”*
        *   *“Highly rated by students with similar profiles”*

> **Speaker Notes**:
> *"Our first AI microservice is a Course Recommender operating on port 8000. It uses a hybrid 4-layer architecture. Layer 1 uses TF-IDF to find courses with similar text profiles. Layer 2 uses Jaccard similarities on peer enrollments to see what similar students took. Layer 3 applies knowledge rules, ensuring students don't skip prerequisites. Finally, Layer 4 ranks the candidates and outputs Explainable AI explanations in the UI, telling students exactly *why* a course is suggested."*

---

### Slide 11: AI Services - Part 2: Student Dropout Predictor
*   **Slide Title**: **AI (2/2): Student Retention ML Engine (Port 8001)**
*   **Content**:
    *   **12-Feature Behavior Aggregator**: Tracks logins, active days, session times, lesson completions, quiz attempts, and failures.
    *   **Machine Learning Model**: Python Scikit-Learn Random Forest pipeline.
    *   **Early Detection Threshold**: Predicts dropout risk; scores $> 0.7$ flag the student as **"High Risk"** (`dropout_prediction: true`).
    *   **Instructor Intervention Panel**: Highlights at-risk students on the analytics page, enabling instructors to launch manual email outreach.

> **Speaker Notes**:
> *"Our second AI service is a Student Dropout Predictor running on port 8001. Rather than looking at grades alone, it aggregates 12 behavioral features over a rolling 7-day window—such as session duration, days active, and quiz retries. These features feed into a Random Forest machine learning pipeline. If a student's dropout probability crosses 70%, they are flagged as 'High Risk'. Instructors see this immediately on their dashboards, allowing them to intervene and support the student before they drop out."*

---

## TOPIC 6: SECURITY & ISOLATION (2 SLIDES)

### Slide 12: Security - Part 1: Authentication & Access Control
*   **Slide Title**: **Security (1/2): Auth, Tokens, & Middleware Guards**
*   **Content**:
    *   **Custom Credentials Auth**: Secure backend registration and login routes. User passwords are encrypted using bcrypt hashing before storage.
    *   **JSON Web Tokens (JWT)**: Generates signed JWT session tokens upon login, passed securely via HTTP headers.
    *   **Role-Based Access Control (RBAC)**: Backend router protects administrative and instructor routes using a middleware chain.
    *   **Access Control Middleware**:
        *   `verifyToken`: Validates token signatures.
        *   `requireRole`: Restricts endpoints to authorized roles (e.g. blocking students from calling administrative APIs).

> **Speaker Notes**:
> *"Security in Stride is built from the ground up using a defense-in-depth model. On this first security slide, we focus on access control. User passwords are encrypted using bcrypt with a secure salt factor. Once logged in, the server generates a signed JSON Web Token. Every API request passes this token in the headers, where our Express middleware pipeline verifies the token and checks the user's role—Student, Instructor, or Admin—blocking unauthorized access at the route level."*

---

### Slide 13: Security - Part 2: Code Execution Sandboxing & DDoS
*   **Slide Title**: **Security (2/2): Sandbox Isolation & DDoS Defenses**
*   **Content**:
    *   **Vercel Sandbox Isolation**: Runs student code in containerized Firecracker microVMs. Restricts access to host file structures and networks.
    *   **Resource Limits**: Strict 30s timeout on microVMs and 10s timeout on commands to prevent infinite loop exploits.
    *   **NoSQL Injection Prevention**: Mongoose strictly validates schemas, casting ObjectIds and stripping unexpected operators (e.g. `$ne`), mitigating parameter manipulation.
    *   **DDoS Mitigation**: CDN and reverse proxy layers filter volumetric DDoS. Express body payload sizes are capped at 50MB, and API execution calls are rate-limited.

> **Speaker Notes**:
> *"Our second security slide covers runtime execution and data protection. Running user-submitted code is a major vulnerability, so we isolate code execution. In production, we run it inside Vercel Sandbox Firecracker microVMs, which enforce strict RAM, CPU, and execution timeout limits. To prevent database injection, we use NoSQL schemas in Mongoose that sanitize parameters and strip illegal operators. Finally, we cap Express payload sizes and enforce API-level rate limits to protect against Denial of Service attacks."*

---

## TOPIC 7: SYSTEM VERIFICATION & TESTING (2 SLIDES)

### Slide 14: System Verification - Part 1: Backend Controller Tests
*   **Slide Title**: **Testing (1/2): Node.js Controller Tests**
*   **Content**:
    *   **Native Node.js Test Runner**: Built using the native v24 test framework (`node:test`) and assertion library (`node:assert`).
    *   **In-Memory Database Stubs**: Models are mocked in-memory, allowing the backend test suite to run in isolation without database dependencies.
    *   **Test Cases Covered**:
        *   `authController`: Checks bcrypt registration, payload validation, and JWT generation.
        *   `courseController`: Checks active catalog queries, badge checks, and instructor editing constraints.
        *   `assessmentController`: Validates quiz sanitization (stripping correct answers) and grading.

> **Speaker Notes**:
> *"To verify that Stride is robust, we built a comprehensive automated testing suite. On this first testing slide, we focus on the Express backend. We write our test suite using the native Node.js test runner. The tests execute in full isolation by stubbing Mongoose database methods in memory. This test suite validates registration payloads, course catalog queries, course ownership logic, and the quiz auto-grading engines."*

---

### Slide 15: System Verification - Part 2: AI Microservice Tests
*   **Slide Title**: **Testing (2/2): Python ML Service Tests**
*   **Content**:
    *   **Python Unittest Suite**: Standard Python `unittest` library tests recommender logic and dropout prediction service parameters.
    *   **Tested Components**:
        *   `recommender_logic`: Tests Cosine similarities, Jaccard matrices, prerequisite checks, and progression deadlocks.
        *   `dropout_service`: Tests weekly behavior feature scaling and predictor threshold classifications.
    *   **Overall Test Results**:
        *   **Total Tests**: 22 Cases.
        *   **Pass Rate**: **100% Success Rate (22/22 passed)**.

> **Speaker Notes**:
> *"On the second testing slide, we detail our Python testing. We use the standard Python 'unittest' library to validate our FastAPI services. We test TF-IDF metadata calculations, collaborative filtering math, and category-level progression locks. We also test that our Random Forest feature scaling handles anomalous values. In total, Stride features 22 automated test cases spanning JavaScript and Python, achieving a perfect 100% success rate."*

---

## TOPIC 8: DEPLOYMENT & PIPELINE (2 SLIDES)

### Slide 16: Deployment - Part 1: Production Cloud Architecture
*   **Slide Title**: **Deployment (1/2): Cloud Architecture**
*   **Content**:
    *   **Frontend SPA (Vercel)**: Deployed to Vercel CDN networks, utilizing edge routing and serverless redirects via `vercel.json`.
    *   **Backend REST API (Vercel Serverless)**: Deployed to Vercel Serverless Functions, automatically scaling execution instances.
    *   **Database (MongoDB Atlas)**: Deployed to a cloud-managed cluster with automated backups and replica sets.
    *   **AI Microservices**: Packaged and hosted on containerized PaaS platforms (e.g. Render, Railway, or VPS) with Uvicorn servers.

> **Speaker Notes**:
> *"Our deployment architecture leverages serverless and container clouds. The React frontend is deployed to Vercel's global CDN networks. The Node.js backend is hosted as Serverless Functions on Vercel, scaling automatically with student traffic. The database is hosted on MongoDB Atlas, ensuring redundancy with automatic replica set backups. Finally, our Python FastAPI microservices are hosted on containerized PaaS services, running under high-performance Uvicorn servers."*

---

### Slide 17: Deployment - Part 2: Production Hardening & Sandbox Failover
*   **Slide Title**: **Deployment (2/2): Hardening & Sandbox Pipeline**
*   **Content**:
    *   **Production Hardening Checklist**:
        *   **Local Subprocess Disable**: Must block local subprocess runner in production to prevent un-sandboxed execution.
        *   **JWT Enforce**: HALT application startup if `ACCESS_TOKEN_SECRET` is missing or set to the default developer secret.
        *   **Billing Validation**: Disable mock Stripe payment hooks and require live webhook secrets.
    *   **Code Sandbox Failover Pipeline**:
        ```text
        [Submission] ---> (1. Vercel Sandbox Firecracker MicroVMs)
                               |  (If Offline / Limit Reached)
                               v
                          (2. Piston API Public Engine Fallback)
                               |  (Local Dev Only)
                               v
                          (3. Piped Subprocess Run on Dev Machine)
        ```

> **Speaker Notes**:
> *"Our final slide outlines our production hardening steps and sandbox failover pipeline. Before launching Stride in production, we disable our local python subprocess runner to make sure no user code runs directly on the host machine. We also crash the server if default JWT developer secrets are left in. For code execution, we implement a robust failover pipeline. Code submissions are routed to Vercel Sandbox microVMs. If the microVM limit is reached, the server transparently falls back to the public Piston API. Local subprocess execution is restricted strictly to local developer environments."*
