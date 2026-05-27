# Stride Platform — Audit of Missing & Broken Features

This document outlines the architectural gaps, security vulnerabilities, implementation bugs, and missing features discovered during the comprehensive audit of the Stride platform.

---

## 🎨 1. Frontend Gaps & Issues

### 🔴 Critical Security & Integration Gaps
1. **Broken Admin Dashboard Authentication (JWT Key Mismatch)**:
   * **Problem**: In `Admin.jsx`, the dashboard attempts to retrieve the JWT token from local storage using `localStorage.getItem('token')`. However, `AuthProvider.jsx` stores the token under the key `'access-token'`.
   * **Impact**: The request header is sent as `Authorization: Bearer null`. The Express server rejects these requests with `401 Unauthorized`, and the dashboard permanently displays stale mock/sample data.
2. **Unauthenticated Instructor Dashboard API Calls**:
   * **Problem**: In `Instructor.jsx`, data fetching is done using the global native `fetch()` API without providing the `Authorization` header.
   * **Impact**: Since the server protects all instructor routes with `verifyToken`, these native fetch calls fail with `401 Unauthorized`. The dashboard is broken in a live database setup.
3. **Bypassed Enrollment API (Client-Side Only Enrollment)**:
   * **Problem**: `Payment.jsx` handles course enrollment entirely client-side using `localStorage` keys (`enrolledCourses` and `userEnrollments`). It simulates payment success but never executes a POST request to `/api/enrollments`.
   * **Impact**: The database is never updated when a user purchases a course. As a result:
     - The enrollment count on the course does not increment in MongoDB.
     - The student's enrolled courses list returned by the server is empty (`[]`).
     - Telemetry tracking and course progression are broken because no `enrollmentId` exists in the database to bind progress records.
4. **Missing Recommendation Service API Integration**:
   * **Problem**: The frontend `RecommendedCourses.jsx` component calls synchronous mockup methods (`recommendationService.getSampleRecommendations()`) that return hardcoded client-side course arrays. It never hits the backend `/api/recommendations` endpoint.
   * **Impact**: The Python-based FastAPI course recommender microservice is completely unused in the frontend interface.

### 🟡 Functional & UI Gaps
5. **Static Course Details Loading on Edit Course Page**:
   * **Problem**: `EditCourse.jsx` imports `public/courses.json` directly and tries to load the course matching the ID from this static array instead of fetching it via `/api/courses/:id`.
   * **Impact**: Any newly created courses or edits saved to MongoDB are not visible when reloading the Edit Course page.
6. **Bypassed Code Execution Proxy**:
   * **Problem**: `CodingExerciseEditor.jsx` directly requests the external Piston API at `https://emkc.org/api/v2/piston/execute`.
   * **Impact**: It bypasses the Express backend's proxy route (`/api/execute`), increasing CORS risks and leaking key execution details to the browser.
7. **Broken Badge Rendering**:
   * **Problem**: `Badges.jsx` attempts to render badges by putting the badge's `iconUrl` in an `<img>` tag: `<img src={badge.iconUrl} />`. However, the backend returns emojis (e.g., `'🎯'`, `'🏆'`) as the icon identifier.
   * **Impact**: The browser attempts to load the emoji as an image file path (resulting in `404 Not Found`), showing broken image boxes in the user's achievements tab.
8. **Duplicate HTTP Clients**:
   * **Problem**: The project has duplicate Axios client services: `src/services/api.js` and `src/services/axiosSecure.js`. Both do identical header injection and redirection handling.

---

## ⚙️ 2. Backend Gaps & Issues

### 🔴 Critical Security Vulnerabilities
1. **Broken Auth Checks via Query Parameter Injection**:
   * **Problem**: Many protected instructor endpoints (e.g., `/api/instructor/stats`, `/api/instructor/courses`, `/api/instructor/students`, `/api/instructor/at-risk-students`) retrieve the active user using `req.query.email`.
   * **Impact**: Even though the route is protected by `verifyToken` (which places the authenticated user in `req.user`), the controller ignores `req.user` and relies on query parameters. This forces the client to pass emails in the URL and allows spoofing risks if verification policies change.
2. **Insecure Profile Updates**:
   * **Problem**: In `userController.js`, `updateProfile` looks up the target user profile using `req.body.email`:
     ```javascript
     const user = await User.findOneAndUpdate(
       { email: req.body.email },
       { name, photoURL, bio, title },
       { new: true }
     );
     ```
   * **Impact**: Any logged-in user can submit an HTTP PUT request to `/api/users/profile` and modify the name, bio, and credentials of *any other user* on the platform simply by putting their email in the request body.
3. **Enrollment Spoofing Vulnerability**:
   * **Problem**: The `/api/enrollments` endpoint takes `studentEmail` from the request body to execute enrollment:
     ```javascript
     const student = await User.findOne({ email: studentEmail });
     ```
   * **Impact**: Allows a malicious user to enroll any other user in arbitrary courses, creating data integrity issues.

### 🟡 Database & Architectural Gaps
4. **Duplicate Metrics Collections & Outdated Queries**:
   * **Problem**: The backend declares two distinct metrics collections: `StudentMetric` and `MLFeature`. The telemetry tracker (`mlMetricsService.js`) updates `MLFeature`, but the metrics endpoints (`/api/metrics/at-risk`, `/api/metrics/student/:id`) query `StudentMetric`.
   * **Impact**: Analytics queried from `/api/metrics/*` return empty or outdated telemetry because the live telemetry recording writes exclusively to `mlfeatures`.
5. **Hardcoded ML Recommender URL**:
   * **Problem**: `recommenderController.js` has the FastAPI recommender service URL hardcoded directly as `http://localhost:8000/api/recommendations/`.
   * **Impact**: Bypasses the environment configurations, making containerization and production deployments rigid.

---

## 🤖 3. Machine Learning Services Gaps & Issues

### 🟡 Optimization & Reliability Gaps
1. **Lack of Automated Telemetry Prediction Triggers**:
   * **Problem**: The ML dropout prediction engine relies on manual invocation of `/api/predict-all` (triggered via the instructor dashboard button) to recalculate risk scores.
   * **Impact**: Risk levels and dropout flags in the database become stale if the instructor does not manually press the button. There is no background cron job or celery task scheduling these predictions.
2. **Inefficient Real-time Collaborative Filtering**:
   * **Problem**: The course recommender service performs TF-IDF vectorization, Cosine Similarity, Jaccard Jaccard calculation, and rule validation on every single request.
   * **Impact**: If the number of courses or enrollments grows to thousands, execution time will increase exponentially. The recommender lacks caching (e.g., Redis) or offline matrix pre-computation.
3. **Missing Python Typing Validations**:
   * **Problem**: The Recommender Service does not validate input schemas using Pydantic models (unlike the Dropout Service which declares `PredictionRequest`).
   * **Impact**: API requests with missing or corrupt user data will result in unhandled internal python exceptions (returning `500 Internal Server Error`).
