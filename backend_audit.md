# Stride Backend Audit

## Overview

| Area | Count | Status |
|------|-------|--------|
| **Models** | 6 | All defined ✅ |
| **Controllers** | 6 | Partially implemented ⚠️ |
| **Route files** | 6 | All wired ✅ |
| **Seed script** | 1 | Complete ✅ |
| **Server entry** | 1 | Working ✅ |

**Stack**: Express 5 + Mongoose 9 + MongoDB + JWT + bcryptjs + Stripe + Piston API

---

## ✅ What IS Done

### 1. Models — All 6 are fully defined

| Model | File | Key Fields |
|-------|------|------------|
| [User.js](file:///e:/project/stride/server/models/User.js) | `User` | name, email, password, role, xp, level, bio, title, enrolledCourses |
| [Course.js](file:///e:/project/stride/server/models/Course.js) | `Course` | title, price, instructor (ref), category, status, seats, rating, tags |
| [Enrollment.js](file:///e:/project/stride/server/models/Enrollment.js) | `Enrollment` | userId, courseId, progress, grade, completedLessons, status |
| [CourseContent.js](file:///e:/project/stride/server/models/CourseContent.js) | `CourseContent` | courseId, sections → lessons (article/video/quiz/coding) |
| [Assessment.js](file:///e:/project/stride/server/models/Assessment.js) | `Assessment` | courseId, topics → questions (mcq/fill_blank/matching/true_false) |
| [StudentMetric.js](file:///e:/project/stride/server/models/StudentMetric.js) | `StudentMetric` | 16 ML features, engagement score calc, risk flag logic |

### 2. Auth System

| Endpoint | Method | Status |
|----------|--------|--------|
| `POST /api/auth/register` | Register with bcrypt hash + JWT | ✅ Working |
| `POST /api/auth/login` | Login with password compare + JWT | ✅ Working |

> [!NOTE]
> Frontend `AuthProvider.jsx` uses these endpoints with localStorage-based token management.

### 3. User Management

| Endpoint | Method | Status |
|----------|--------|--------|
| `POST /api/register-user` | Register/update user (Firebase compat) | ✅ Working |
| `GET /api/users` | Get all users | ✅ Working |
| `GET /api/users/:id` | Get user by ID | ✅ Working |
| `PUT /api/users/profile` | Update profile (by email) | ✅ Working |
| `PATCH /api/users/:id/role` | Update user role | ✅ Working |
| `DELETE /api/users/:id` | Delete user | ✅ Working |

### 4. Course CRUD

| Endpoint | Method | Status |
|----------|--------|--------|
| `GET /api/courses` | All active courses (with instructor populate) | ✅ Working |
| `GET /api/courses/:id` | Single course (with ObjectId validation) | ✅ Working |
| `POST /api/courses` | Create course (looks up instructor by email) | ✅ Working |
| `PUT /api/courses/:id` | Update course | ✅ Working |
| `DELETE /api/courses/:id` | Delete course | ✅ Working |
| `GET /api/courses/category/:category` | Filter by category | ✅ Working |

### 5. Enrollments

| Endpoint | Method | Status |
|----------|--------|--------|
| `POST /api/enrollments` | Enroll (with duplicate check, updates count) | ✅ Working |
| `GET /api/enrollments/my-enrollments` | Get user's enrollments | ✅ Working |
| `GET /api/my-enrollments` | Same (compat route in index.js) | ✅ Working |
| `PATCH /api/enrollments/:id/progress` | Update progress/grade | ✅ Working |

### 6. Instructor Dashboard

| Endpoint | Method | Status |
|----------|--------|--------|
| `GET /api/instructor/stats` | Total courses, students, revenue, rating | ✅ Working |
| `GET /api/instructor/courses` | Instructor's courses | ✅ Working |
| `GET /api/instructor/students` | Unique students with avg progress | ✅ Working |
| `GET /api/instructor/at-risk-students` | Students inactive >7 days or grade <60 | ✅ Working |
| `GET /api/instructor/course-stats` | Per-course enrollment + revenue | ✅ Working |
| `GET /api/instructor/student-analytics` | Grade distribution chart data | ✅ Working |

### 7. Admin Dashboard

| Endpoint | Method | Status |
|----------|--------|--------|
| `GET /api/admin/stats` | Total users, courses, enrollments, revenue | ✅ Working |
| `GET /api/admin/recent-users` | Last 10 users | ✅ Working |
| `GET /api/admin/recent-courses` | Last 10 courses | ✅ Working |
| `GET /api/admin/instructors` | All instructors with stats | ✅ Working |

### 8. Other Integrations

| Feature | Status |
|---------|--------|
| Piston code execution (`POST /api/execute`) | ✅ Working (proxies to emkc.org) |
| Stripe payment intent (`POST /api/create-payment-intent`) | ✅ Working (with mock fallback) |
| Seed script (`npm run seed`) | ✅ Complete — creates users, courses, enrollments, metrics |
| Request logging middleware | ✅ Working |
| Global error handler | ✅ Working |
| CORS | ✅ Enabled (open) |

---

## ❌ What is NOT Done / Broken

### 1. 🔴 No Auth Middleware (JWT Verification)

> [!CAUTION]
> **Every single API endpoint is completely unprotected.** The backend issues JWTs on login/register but **never verifies them**. There is no `verifyToken` middleware anywhere. Any unauthenticated request can access all data, modify users, delete courses, etc.

**Missing:**
- `server/middleware/auth.js` — JWT verification middleware
- Role-based access control (admin-only, instructor-only routes)
- Token extraction from `Authorization: Bearer <token>` header

### 2. 🔴 Models Exist But Have No Routes/Controllers

These 3 models are defined and seeded but have **zero API endpoints**:

| Model | What's Missing |
|-------|----------------|
| **CourseContent** | No CRUD routes. Frontend `CourseContent.jsx` uses hardcoded data instead. |
| **Assessment** | No CRUD routes. Assessment data is never served from the backend. |
| **StudentMetric** | No routes. 16 ML features are seeded but never exposed via API. |

### 3. 🔴 Frontend Calls Routes That Don't Exist

| Frontend Service | Calls | Backend Status |
|-----------------|-------|----------------|
| [adminService.js](file:///e:/project/stride/src/services/adminService.js) | `GET /admin/at-risk-students` | ❌ **Route does not exist** in admin routes |
| [adminService.js](file:///e:/project/stride/src/services/adminService.js) | `POST /admin/send-reminder/:id` | ❌ **Route does not exist** |
| [adminService.js](file:///e:/project/stride/src/services/adminService.js) | `POST /admin/send-bulk-reminder` | ❌ **Route does not exist** |
| [adminService.js](file:///e:/project/stride/src/services/adminService.js) | `GET /admin/student-activity` | ❌ **Route does not exist** |
| [adminService.js](file:///e:/project/stride/src/services/adminService.js) | `GET /admin/retention-metrics` | ❌ **Route does not exist** |
| [Leaderboard.jsx](file:///e:/project/stride/src/components/common/Leaderboard.jsx) | Vercel deployed API `/api/leaderboard` | ❌ **Points to old production server** |
| [Badges.jsx](file:///e:/project/stride/src/components/common/Badges.jsx) | Vercel deployed API `/api/student/badges` | ❌ **Points to old production server** |
| [StripeContainer.jsx](file:///e:/project/stride/src/components/payment/StripeContainer.jsx) | `POST http://localhost:5000/create-payment-intent` | ❌ **Wrong URL** — missing `/api` prefix |

### 4. 🟡 Stub/Mock Endpoints (Return Hardcoded Responses)

These endpoints exist but do **nothing real**:

| Endpoint | What it does |
|----------|-------------|
| `POST /api/admin/users/:id/:action` | Returns `"User {action}ed successfully"` — no actual logic |
| `POST /api/admin/courses/:id/:action` | Returns `"Course {action}ed successfully"` — no actual logic |
| `POST /api/admin/instructors/:id/:action` | Returns `"Instructor {action}ed successfully"` — no actual logic |
| `POST /api/instructor/send-reminder/:id` | Returns `"Reminder sent successfully"` — no email integration |
| `POST /api/instructor/send-bulk-reminder` | Returns `"Bulk reminders sent successfully"` — no email integration |

### 5. 🟡 Missing Backend Features

| Feature | Details |
|---------|---------|
| **Course approval workflow** | Admin can't actually approve/reject courses. Stub only. |
| **User ban/suspend** | Admin action stub only. No actual user status field. |
| **File/Image upload** | No multer or cloud storage. Course images are just URL strings. |
| **Search & Filtering** | No search endpoint for courses (text search, price range, level, etc.) |
| **Pagination** | No pagination on any list endpoint (`getAllCourses`, `getAllUsers`, etc.) |
| **Rate limiting** | No rate limiting on any endpoint |
| **Input validation** | No express-validator or joi. Only ObjectId validation exists. |
| **Password reset** | No forgot/reset password flow |
| **Google OAuth** | `googleSignIn()` in AuthProvider logs a warning — not implemented |
| **Email notifications** | Reminder endpoints are stubs |
| **Leaderboard API** | No `/api/leaderboard` endpoint |
| **Badges/Achievements API** | No `/api/student/badges` endpoint |
| **Course content API** | No endpoints to serve/manage course content |
| **Assessment submission API** | No endpoints to submit/grade assessments |
| **Student progress tracking** | XP/level updates are not automated |
| **Course reviews/ratings** | No review model or endpoints |

### 6. 🟡 Architectural Issues

| Issue | Details |
|-------|---------|
| **Duplicate axios configs** | Both `api.js` and `axiosSecure.js` exist with same base URL. Some components use `fetch()` directly, others use `api`, others use `axiosSecure`. |
| **`registerUser` duplication** | The route exists at both `POST /api/register-user` (index.js) and `POST /api/users/register-user` (userRoutes). |
| **No `.env` for secrets** | `ACCESS_TOKEN_SECRET` defaults to `'secret'`. No `STRIPE_SECRET_KEY` in `.env`. |
| **`password` required in User model** | But `registerUser` in userController doesn't set a password — will fail for Firebase-migrated users. |
| **Enrollment misses `studentEmail`** | Frontend `courseService.enrollInCourse()` sends `{ courseId }` but backend `enrollInCourse` expects `{ courseId, studentEmail }`. |

---

## Summary Scorecard

| Category | Done | Not Done | Score |
|----------|------|----------|-------|
| Models | 6/6 defined | 3/6 have no API routes | 50% |
| Auth (register/login) | ✅ | No JWT verification middleware | 40% |
| User CRUD | ✅ Full | — | 100% |
| Course CRUD | ✅ Full | No search/pagination | 80% |
| Enrollments | ✅ Basic | Frontend/backend param mismatch | 70% |
| Instructor dashboard | ✅ Good | Reminders are stubs | 80% |
| Admin dashboard | ✅ Stats only | 5 frontend endpoints missing | 40% |
| Course Content API | ❌ | No routes at all | 0% |
| Assessment API | ❌ | No routes at all | 0% |
| Student Metrics API | ❌ | No routes at all | 0% |
| Security | ❌ | No auth middleware, no validation | 0% |
| **Overall** | | | **~45%** |
