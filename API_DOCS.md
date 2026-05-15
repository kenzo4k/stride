# Stride Platform API Documentation

## Base URL
`/api`

## Authentication
All protected routes require a JWT token passed in the Authorization header.
**Header Format:** `Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication (`/api/auth`)

### Register User
**POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student" // 'student' or 'instructor'
  }
  ```
- **Response (201):** User object + JWT Token

### Login User
**POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (200):** User object + JWT Token

---

## 2. User Management (`/api/users`)

### Get Current User Profile (Protected)
**GET** `/api/users/me`
- **Description:** Returns the logged-in user's profile, including XP, level, streak, and privacy settings.
- **Response (200):** User object

### Update Settings (Protected)
**PATCH** `/api/users/settings`
- **Body:**
  ```json
  {
    "isPublic": false
  }
  ```
- **Response (200):** Updated User object

### Award XP (Protected)
**POST** `/api/users/award-xp`
- **Body:**
  ```json
  {
    "amount": 25,
    "reason": "Completed Lesson 1"
  }
  ```
- **Response (200):** `{ xp: 25, level: 1 }`

---

## 3. Courses (`/api/courses`)

### Get All Courses
**GET** `/api/courses`
- **Response (200):** Array of Course objects

### Get Course by ID
**GET** `/api/courses/:id`
- **Response (200):** Course object

### Create Course (Protected, Instructor/Admin Only)
**POST** `/api/courses`
- **Body:** FormData containing title, description, price, category, difficulty, tags, sections (JSON string), and image (file).
- **Response (201):** Created Course object

---

## 4. Enrollments (`/api/enrollments`)

### Enroll in Course (Protected)
**POST** `/api/enrollments`
- **Body:**
  ```json
  {
    "courseId": "651a...cdef"
  }
  ```
- **Response (201):** Enrollment object

### Get My Enrollments (Protected)
**GET** `/api/enrollments/my-enrollments`
- **Response (200):** Array of Enrollment objects populated with Course details.

### Update Course Progress (Protected)
**PATCH** `/api/enrollments/:id/progress`
- **Body:**
  ```json
  {
    "progress": 50,
    "completedLessons": ["lesson1_id", "lesson2_id"]
  }
  ```
- **Response (200):** Updated Enrollment object

---

## 5. Gamification (`/api/gamification`)

### Get Global Leaderboard
**GET** `/api/gamification/leaderboard`
- **Description:** Returns the top 100 students ranked by XP. Users with `isPublic: false` are excluded.
- **Response (200):** Array of Leaderboard entries `{ id, name, xp, level }`

### Get Student Badges (Protected)
**GET** `/api/student/badges`
- **Description:** Returns the current logged-in user's unlocked badges based on XP milestones.
- **Response (200):** Array of Badge objects
