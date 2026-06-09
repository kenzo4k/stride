# STRIDE: MIDYEAR SHORT DOCUMENTATION

## 1. ABSTRACT

Stride is a modern, full-stack course management and learning platform designed to bridge the gap between instructors and students in digital education. The platform addresses the lack of unified, interactive learning experiences by providing a comprehensive ecosystem where students can discover, enroll in, and complete courses while instructors can create and manage course content efficiently. Our motivation stems from the increasing demand for accessible online learning tools that combine flexibility with structured educational delivery. Stride leverages a modern technology stack including React 18 for responsive user interfaces, a REST API backend for scalable data management, Firebase for secure authentication, and MongoDB for flexible document-oriented data storage. The platform implements role-based access control, interactive course content with quizzes and coding exercises, progress tracking, and personalized course recommendations, making it a complete solution for online education delivery.

## 2. BACKGROUND

### 2.1 Introduction to Online Learning Platforms

Online learning has become an essential component of modern education. Traditional educational systems face challenges in scalability, accessibility, and student engagement. Digital learning platforms provide solutions by offering flexibility, personalized learning paths, and on-demand access to educational content.

### 2.2 Motivation

The primary motivation for developing Stride is to create a unified platform that:
- Provides seamless course discovery and enrollment experiences
- Empowers instructors with tools to create and manage courses effectively
- Tracks student progress and learning outcomes
- Delivers interactive, engaging educational content
- Supports multiple user roles with appropriate access levels

### 2.3 Beneficiaries

- **Students**: Access to diverse courses, structured learning paths, progress tracking, and personalized recommendations
- **Instructors**: Tools to manage courses, view student progress, and create interactive content
- **Administrators**: System oversight, user management, and platform analytics
- **Educational Institutions**: Scalable infrastructure for digital education delivery

### 2.4 Main Techniques & Features

- **Authentication & Security**: Firebase Authentication with JWT token management
- **Interactive Content**: Article lessons, video tutorials, quizzes, and coding exercises
- **Progress Tracking**: XP-based progression system and course completion metrics
- **Recommendation Engine**: Hybrid 4-layer recommendation system (content-based, collaborative, rule-based, and ranking) with dynamic explainability reasons (XAI)
- **Role-Based Access Control**: Distinct interfaces and functionality for students, instructors, and admins

### 2.5 Main Applications

- Online course delivery for educational institutions
- Professional skill development platforms
- Coding bootcamps and technical training programs
- Self-paced learning systems

## 3. PROBLEM DEFINITION

### 3.1 Current Challenges

1. **Fragmented Learning Experience**: Existing solutions lack integrated platforms that combine course content, assessment, and progress tracking
2. **Limited Instructor Tools**: Instructors require simplified interfaces for course creation and management without technical complexity
3. **Student Engagement**: Traditional online courses fail to maintain student motivation and engagement
4. **Scalability Issues**: Legacy systems cannot efficiently handle growing numbers of users and courses
5. **Personalization Gap**: Most platforms lack personalized learning recommendations based on student progress and interests

### 3.2 Research Question

How can we design and implement a unified, interactive course management platform that enhances both teaching and learning experience through intelligent content organization, interactive assessments, and personalized recommendations?

### 3.3 Specific Problems We Address

- Unified course discovery with multi-criteria filtering
- Role-based access control and user management
- Interactive lesson delivery with multiple content types
- Progress tracking with XP-based gamification
- Seamless integration of quizzes and coding exercises
- Personalized course recommendations

## 4. RELATED WORK

### 4.1 Existing Similar Implementations

| Platform | Key Features |
|----------|---------------|
| Udemy | Large course catalog, instructor dashboards, student progress tracking, certificates |
| Coursera | Structured learning paths, university-backed courses, certificates, specializations |
| Udacity | Nanodegree programs, project-based learning, mentorship, industry partnerships |

### 4.2 Main Differences from Stride

| Feature | Udemy | Coursera | Udacity | Stride |
|---------|-------|----------|---------|--------|
| Interactive Code Execution | None | Limited/External | Separate environments | Web-based IDE with real-time code execution |
| Pre-Assessment Quizzes | None | Some courses have initial assessments | Limited | Mandatory pre-assessment to gauge baseline |
| Gamification Features | Basic progress bars, instructor badges | Course completion certificates | Nanodegree badges, certifications | XP system, achievement badges, levels, leaderboards |
| Recommendation System | Popularity-based, category browsing | Playlist personalization (ML) | Manual course sequencing | Hybrid 4-layer (content-based + collaborative + rule-based + ranking) |
| Student Dropout Prediction | None | None | None | ML model identifies at-risk students |
| At-Risk Student Alerts | None | None | None | Real-time instructor notifications |
| Intervention Recommendations | Instructor discretion only | Limited | Mentorship focus | AI-suggested actions for at-risk students |
| Performance Analytics | Basic (completion %, average scores) | Moderate (by module) | Limited (project-focused) | Comprehensive (engagement + performance + risk + trends) |

### 4.3 Innovation in Stride

- Integrated Coding Environment
- AI-suggested actions for at-risk students
- Mandatory pre-assessment to gauge baseline

## 5. PROJECT SPECIFICATIONS

### 5.1 System Architecture

**Architecture Overview:**
- **Frontend**: React 18 SPA with Vite bundler, Tailwind CSS + Daisy UI for styling
- **Backend**: REST API (Node.js/Express)
- **Authentication**: Firebase Auth + JWT tokens
- **Database**: MongoDB (document-oriented database storing courses, content, users, enrollments, assessments, and metrics)
- **External Services**: Judge0 API (sandboxed code execution / automated grading with local Python subprocess fallback), YouTube (video content)

**Key Architectural Layers:**
1. **Presentation Layer**: React components organized by features (auth, courses, dashboard, users, assessment)
2. **API Layer**: Axios interceptors for secure requests, centralized service layer
3. **Business Logic**: Hooks for reusable logic, context API for state management
4. **Data Layer**: Firebase for auth, MongoDB for persistence

### 5.2 Stakeholders

| Stakeholder | Role | Interests |
|-------------|------|-----------|
| Students | End users | Access to quality courses, progress tracking, certifications |
| Instructors | Content creators | Course management tools, student analytics, income/recognition |
| Admins | System administrators | User management, content moderation, platform analytics |

### 5.3 Functional Requirements

#### FR 2.1. User Management and Authentication

| ID | Requirement Description | Actor |
|----|------------------------|-------|
| FR-2.1.1 | The system must allow users to register and log in via secure credentials (email/password). | Student, Instructor, Admin |
| FR-2.1.2 | The system must implement role-based access control (RBAC) for three roles: Student, Instructor, and Admin. | System |
| FR-2.1.3 | The system must maintain a secure session for authenticated users (using JWT or similar). | System |
| FR-2.1.4 | The system must provide a central Course Dashboard displaying enrolled courses and overall progress. | Student |

#### FR 2.2. AI Recommendation & Dropout Prediction Engine

| ID | Requirement Description | Actor |
|----|------------------------|-------|
| FR-2.2.1 | The system must administer a pre-assessment quiz to gauge the student's initial knowledge level upon course enrollment. | Student |
| FR-2.2.2 | The system must execute a hybrid 4-layer recommendation engine (content-based, collaborative, rule-based, ranking) to offer personalized suggestions. | System |
| FR-2.2.3 | The system must display dynamic, human-readable explanations (e.g., "Similar to HTML & CSS Foundations") for recommendations. | System |
| FR-2.2.4 | The system must analyze weekly behavioral data (logins, progress, active time) using an ML model to flag at-risk students for instructors. | System |

#### FR 2.3. Interactive Content Players

| ID | Requirement Description | Actor |
|----|------------------------|-------|
| FR-2.3.1 | The Quiz Player must support multiple question types (MCQ, fill-in-the-blank, matching). | Student |
| FR-2.3.2 | The Quiz Player must provide instant feedback upon submission (correct/incorrect). | Student |
| FR-2.3.3 | The Coding Playground must provide a web-based IDE for users to write and execute code. | Student |
| FR-2.3.4 | The Coding Playground must integrate with an external API (e.g., Judge0) to run code against defined test cases and return real-time feedback. | System |

#### FR 2.4. Gamification Engine

| ID | Requirement Description | Actor |
|----|------------------------|-------|
| FR-2.4.1 | The system must award Experience Points (XP) for completing modules, quizzes, and coding challenges. | System |
| FR-2.4.2 | The system must award Achievement Badges upon meeting specific, pre-defined criteria (e.g., perfect scores). | System |
| FR-2.4.3 | The system must display a visual progress bar showing XP gained and progress toward the next level/milestone. | Student |
| FR-2.4.4 | The system must render a Leaderboard displaying student rankings, with optional privacy settings. | Student |

#### FR 2.5. Content Management System (CMS)

| ID | Requirement Description | Actor |
|----|------------------------|-------|
| FR-2.5.1 | The CMS must allow Instructors/Admins to create and structure new courses, modules, and lessons. | Instructor, Admin |
| FR-2.5.2 | The CMS must provide a user-friendly interface to create, edit, and publish interactive quiz questions. | Instructor, Admin |
| FR-2.5.3 | The CMS must provide tools to define coding exercise test cases and expected outputs for automated grading. | Instructor, Admin |
| FR-2.5.4 | The CMS must include an Analytics Dashboard to view aggregated student performance data (e.g., average scores, completion rates). | Instructor, Admin |

### 5.4 Non-Functional Requirements (NFR)

#### NFR 3.1. Performance

| ID | Requirement Description | Priority |
|----|------------------------|----------|
| NFR-3.1.1 | The system must load all key dashboard and course pages in acceptable time | High |
| NFR-3.1.2 | The real-time code execution and feedback (via Judge0) must return results | High |
| NFR-3.1.3 | The Hybrid Recommendation Engine must generate personalized course suggestions within acceptable time limits | High |

#### NFR 3.2. Security

| ID | Requirement Description | Priority |
|----|------------------------|----------|
| NFR-3.2.1 | All user passwords must be securely stored | Critical |
| NFR-3.2.2 | The Coding Sandbox must be meticulously isolated (e.g., using Docker containerization) to prevent security breaches and code injection. | Critical |
| NFR-3.2.3 | All data transmission between the client and server must be encrypted via HTTPS/TLS. | High |

#### NFR 3.3. Usability and Accessibility (UI/UX)

| ID | Requirement Description | Priority |
|----|------------------------|----------|
| NFR-3.3.1 | The frontend must be fully responsive | High |
| NFR-3.3.2 | The platform must maintain a consistent, intuitive design language across all modules. | High |

#### NFR 3.4. Scalability and Maintainability

| ID | Requirement Description | Priority |
|----|------------------------|----------|
| NFR-3.4.1 | The system architecture (Node.js/Express/MongoDB) must be able to support 10,000 concurrent active student sessions. | High |
| NFR-3.4.2 | The codebase must use modular, component-based architecture (React) to facilitate easy maintenance and feature expansion. | High |
| NFR-3.4.3 | The system must be deployable via Docker containers | High |

### 5.5 Use Case Diagram

*(Diagram placeholder)*

### 5.6 Class Diagram

*(Diagram placeholder)*

### 5.7 Sequence Diagram

- **ADD Course Sequence Diagram**: *(placeholder)*
- **Enroll in Course Sequence Diagram**: *(placeholder)*
- **Coding Exercise Sequence Diagram**: *(placeholder)*

### 5.8 Activity Diagram

*(Diagram placeholder)*

### 5.9 Entity Relationship Diagram (ERD)

*(Diagram placeholder)*

## 6. AI PLAN

### 6.1 RECOMMENDER SYSTEM: DETAILED DESIGN

#### 6.1.1 Overview

The recommender system employs a hybrid layered approach to ensure robust and personalized discovery, effectively handling "cold start" scenarios for new users and courses.

#### 6.1.2 Architecture Layers

1. **Layer 1: Content-Based Filtering**: Represents courses as vectors derived from metadata using TF-IDF. We calculate cosine similarity between these vectors to find courses similar to those a user has already enrolled in.

2. **Layer 2: Collaborative Filtering**: Identifies "neighbor" users with similar tastes and enrollment histories to recommend courses that the current user hasn't seen yet.

3. **Layer 3: Knowledge-Based / Rule-Based**: Encodes explicit logic such as prerequisite checking and difficulty progression (e.g., don't suggest Advanced Python to a user who hasn't completed Intro to Python).

4. **Layer 4: Hybrid Model & Ranking**: Gathers a broad pool of candidates from all layers and re-ranks them using a weighted formula that considers popularity, freshness, and relevance.

#### 6.1.3 Recent Enhancements: Robustness & Explainable AI (XAI)

To prepare Stride for reliable, human-centric evaluation, several updates were implemented across the recommendation service:

- **Robust Level Progression & Prerequisites**: Prerequisite validation was upgraded to perform case-insensitive, whitespace-trimmed title comparisons. Furthermore, difficulty progression rules were refactored to check if lower-level courses actually exist in the database for a given category.

- **Explainable AI (XAI) Reasons**: The hybrid ranking pipeline now dynamically computes a human-readable explanation (reason) for each recommended course. Examples include: "Similar to [Completed Course Title]", "Building on your study of [Prerequisite Course Title]", or "Highly rated by students with similar profiles".

- **Consistent Fallback Explanations**: The Express API gateway fallback logic was aligned to attach category-based labels (e.g., "Similar course in [Category]") for course-to-course detail recommendations.

### 6.2 STUDENT RETENTION: DROPOUT PREDICTION MODEL

#### 6.2.1 Overview

To improve student retention, Stride incorporates an ML model that provides "Early Warnings" by analyzing behavioral data from the previous 7 days to predict dropout probability in the upcoming week.

#### 6.2.2 Logic

- **Data Points**: Weekly login frequency, lesson completion rate, assessment/quiz performance, average engagement time, and interaction recency.
- **Implementation**:
  1. Data Aggregation: Backend aggregates logs every Sunday.
  2. Inference: Data is processed by the ML service to generate a Risk Score (0.0 to 1.0).
  3. Classification: Students with a score > 0.7 are flagged as "At-Risk."
  4. Intervention: These students are highlighted on the Instructor Dashboard for proactive outreach.

#### 6.2.3 Feature List

The student retention ML model utilizes **12 raw behavioral features** aggregated over a rolling 7-day window:

1.  **`login_count`**: Frequency of user logins during the week.
2.  **`days_active`**: Total unique days of active platform engagement.
3.  **`total_session_time_minutes`**: Cumulative learning session duration.
4.  **`avg_session_time_minutes`**: Mean session length per login.
5.  **`median_session_time_minutes`**: Median session length.
6.  **`lessons_started`**: Total lessons opened.
7.  **`lessons_completed`**: Total lessons completed.
8.  **`assessments_attempted`**: Total quiz and exam submissions.
9.  **`avg_assessment_score`**: Average grading score achieved on assessments.
10. **`num_failed_attempts`**: Count of attempts scoring below passing threshold (60%).
11. **`num_repeated_attempts`**: Count of assessment retries.
12. **`no_improvement_attempts`**: Count of retries showing no score gain.

### 6.3 SYSTEM VERIFICATION & TESTING SUITE

To verify the correct operational logic of all Stride services, a comprehensive testing suite was built covering Express API handlers, the recommender system, and the dropout prediction microservice.

#### 6.3.1 Testing Scope & Frameworks
1. **Node.js Express Backend**: Evaluated using the Node.js v24 native Test Runner (`node:test`) and assertion library (`node:assert`). Mongoose collection methods are stubbed in-memory to execute tests without requiring active database connections. Covered controllers:
   - `authController`: Registers users, generates JWT tokens, and handles validation rules.
   - `courseController`: Queries active courses, parses route IDs, and enforces ownership authorization.
   - `assessmentController`: Sanitizes assessments, auto-grades MCQ/matching answers, and awards progress XP.
   - `codeEvaluationController`: Wraps Python coding exercises and mocks sandboxed Judge0 batch execution.
2. **Python Recommender Service**: Evaluated using standard Python `unittest`. Covers TF-IDF content calculations, collaborative filtering Jaccard overlaps, case-insensitive prerequisite checks, and deadlock-free difficulty progression.
3. **Python Dropout Prediction Service**: Evaluated using standard Python `unittest`. Validates the metric normalization pipeline and risk level classification thresholds.

#### 6.3.2 Execution Results
All test cases run and pass successfully:
- **Express Backend API**: 15 / 15 tests passed.
- **Python Recommender**: 6 / 6 tests passed.
- **Python Dropout Predictor**: 1 / 1 test passed.

## 7. WORK PLAN

### 7.1 Project Timeline & Task Breakdown

| Task # | Task Title | Description | Status | Timeline |
|--------|------------|-------------|--------|----------|
| 1 | Project Kickoff & Requirements Gathering | Define project scope, stakeholders, and initial requirements | Completed | Week 1 |
| 2 | Technology Stack Selection | Evaluate and select React, Firebase, and MongoDB | Completed | Week 2 |
| 3 | System Architecture Design | Design overall system architecture and component structure | Completed | Week 2-3 |
| 4 | Authentication Module | Firebase Auth integration, login/register pages | Completed | Week 3 |
| 5 | Home page | Landing page with latest courses and footer | Completed | Week 4 |
| 6 | Navbar & Navigation | Responsive navbar with role-based menus | Completed | Week 4-5 |
| 7 | Course Catalog Page | Course listing with search, filter, and sorting | Completed | Week 6 |
| 8 | Course Detail Page | Individual course page with metadata and enrollment | Completed | Week 6-7 |
| 9 | Lesson Content Delivery | Article, video, quiz, and coding lesson components | Completed | Week 8 |
| 10 | Quiz System | Interactive quiz component with multiple question types | Completed | Week 9 |
| 11 | Student Dashboard | Progress overview, enrolled courses, recommendations | Completed | Week 10 |
| 12 | Instructor Dashboard | Course management, student analytics | Completed | Week 10 |
| 13 | Admin Dashboard | User management, course oversight | Completed | Week 11 |
| 14 | Coding Exercise Component | Monaco Editor integration for code lessons | Completed | Week 12 |
| 15 | Database Schema Design | Design ERD and database schemas | Completed | Week 13 |
| 16 | Machine learning model | Build an ML model to predict drop-out students | Completed | Week 14 |
| 17 | Recommendation Engine | Hybrid 4-layer recommendation service | Completed | Week 15 |
| 18 | Backend Architecture Setup | Node.js/Express project initialization | Completed | Week 16-17 |
| 19 | Database Setup | MongoDB configuration and connection | Completed | Week 18 |
| 20 | Authentication API | JWT token generation, auth middleware | Completed | Week 19 |
| 21 | User Management API | User CRUD operations and profile management | Completed | Week 20-21 |
| 22 | Course Management API | Course CRUD, sections, lessons endpoints | Completed | Week 21-22 |
| 23 | Enrollment API | Enrollment tracking and student course linking | Completed | Week 22 |
| 24 | Quiz/Assessment API | Quiz submission, answer validation, score calculation | Completed | Week 23 |
| 25 | Progress Tracking API | XP system, level progression, course completion | Completed | Week 23-24 |
| 26 | Recommendation API | Backend recommendation logic implementation | Completed | Week 24 |
| 27 | Unit Testing | Component and function unit tests | Completed | Week 25 |
| 28 | Integration Testing | API and feature integration tests | Completed | Week 25-26 |
| 29 | User Acceptance Testing (UAT) | End-to-end testing with stakeholders | Planned | Week 26 |
| 30 | Deployment | Deploy frontend and backend to cloud | Planned | Week 27-28 |
| 31 | Documentation | Setup guides, architecture docs | Completed | Week 28 |
| 32 | Final Project Report | Comprehensive project documentation | Completed | Week 28 |

### 7.2 Technologies Learned/To Learn

| Technology | Purpose | Status | Timeline |
|------------|---------|--------|----------|
| React 18 | Frontend framework | Learned | Week 1-4 |
| Vite | Build tool | Learned | Week 4 |
| Tailwind CSS 4 | Styling | Learned | Week 4 |
| DaisyUI | UI Component library | Learned | Week 4-5 |
| Python – scikit-learn | ML model – Recommender system | Learned | Week 5 |
| React Router | Client-side routing | Learned | Week 5 |
| Firebase | Authentication & Hosting | Learned | Week 16 |
| Axios | HTTP client | Learned | Week 16 |