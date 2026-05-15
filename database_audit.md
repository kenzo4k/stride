# Stride Database Audit

> Database: `stride` on `mongodb://localhost:27017` — **25.2 KB** data, **7 collections**, **14 indexes**

---

## Collections Overview

| Collection | Documents | Status |
|-----------|-----------|--------|
| `users` | 12 | ✅ Populated |
| `courses` | 5 | ✅ Populated |
| `enrollments` | 20 | ✅ Populated |
| `coursecontents` | 5 | ✅ Populated |
| `assessments` | 5 | ✅ Populated |
| `studentmetrics` | **0** | 🔴 **EMPTY** |
| `stride` | **0** | 🔴 **Ghost collection** |

---

## 👥 Users (12 total)

| Name | Email | Role | XP | Level |
|------|-------|------|----|-------|
| Platform Admin | admin@stride.com | admin | 5000 | 10 |
| Sarah Johnson | instructor@stride.com | instructor | 3500 | 8 |
| Michael Chen | michael@stride.com | instructor | 2800 | 7 |
| Alice Williams | alice@student.com | student | 4500 | 12 |
| Bob Martinez | bob@student.com | student | 3200 | 9 |
| Carol Davis | carol@student.com | student | 2800 | 8 |
| David Brown | david@student.com | student | 1500 | 5 |
| Emma Wilson | emma@student.com | student | 1200 | 4 |
| Student User | student@stride.com | student | 500 | 3 |
| Frank Lee | frank@student.com | student | 200 | 2 |
| Grace Taylor | grace@student.com | student | 150 | 1 |
| Henry Anderson | henry@student.com | student | 100 | 1 |

**Breakdown:** 1 admin, 2 instructors, 9 students — All have passwords ✅

---

## 📚 Courses (5 total)

| Course | Price | Category | Instructor | Status |
|--------|-------|----------|-----------|--------|
| Complete Web Development Bootcamp | $49.99 | Web Development | Sarah Johnson | active |
| Python for Data Science | $59.99 | Data Science | Michael Chen | active |
| Advanced JavaScript Concepts | $39.99 | Web Development | Sarah Johnson | active |
| Introduction to Machine Learning | $69.99 | Machine Learning | Michael Chen | active |
| React Native Mobile Development | $54.99 | Mobile Development | Sarah Johnson | active |

Each course has: 3 sections, 8 lessons, 2 assessment topics, 5 questions ✅

---

## 🔴 Critical Issues Found

### 1. StudentMetrics collection is EMPTY (0 documents)

> [!CAUTION]
> The seed script creates `StudentMetric` records (ML feature data), but the collection has **0 documents**. The seed either wasn't run, failed silently on this collection, or was run against a different DB. This means:
> - At-risk student detection has no data
> - ML features (engagement score, risk flags, dropout predictions) are non-functional
> - The 16 ML features designed in the model are useless right now

### 2. Ghost collection `stride`

An empty collection named `stride` exists (likely created by accident). Should be dropped.

### 3. All `enrollmentCount` fields are 0 (but enrollments exist!)

> [!WARNING]
> Every course shows `enrollmentCount: 0` even though there are actual enrollments:
> 
> | Course | Stored Count | Actual Enrollments | Mismatch |
> |--------|-------------|-------------------|----------|
> | Web Dev Bootcamp | 0 | 9 | ❌ |
> | Python for Data Science | 0 | 5 | ❌ |
> | Advanced JavaScript | 0 | 2 | ❌ |
> | Intro to ML | 0 | 4 | ❌ |
> | React Native | 0 | 0 | ✅ |
> 
> **Root cause:** The seed script creates enrollments via `Enrollment.create()` which bypasses the controller logic that increments `enrollmentCount`. The count field is never updated.

### 4. All `enrolledCourses` arrays on Users are empty

> [!WARNING]
> Every student's `enrolledCourses` array is `[]`, despite having active enrollments:
> 
> | Student | Stored Array | Actual Enrollments |
> |---------|-------------|-------------------|
> | Student User | 0 | 3 |
> | Alice Williams | 0 | 3 |
> | Bob Martinez | 0 | 3 |
> | Carol Davis | 0 | 3 |
> | David Brown | 0 | 3 |
> | Emma Wilson | 0 | 2 |
> | Frank Lee | 0 | 1 |
> | Grace Taylor | 0 | 1 |
> | Henry Anderson | 0 | 1 |
> 
> **Root cause:** Same as above — seed bypasses controller logic that pushes to `enrolledCourses`.

### 5. All grades are 0 (100% of enrollments)

> [!WARNING]
> All 20 enrollments have `grade: 0`. Since there are no assessment submission endpoints, grades can never be updated through normal usage either. The `progress` field has values (26%–87%), but `grade` is always 0.

---

## 📊 What This Means

### The database is in a **"demo-broken"** state:

1. **You can browse courses** — the 5 courses render correctly ✅
2. **You can register/login** — auth works, users exist with hashed passwords ✅
3. **Enrollment counts show wrong** — homepage/course cards will show "0 students" for every course ❌
4. **ML/Analytics features are dead** — StudentMetrics is empty, so at-risk detection, engagement scores, and dropout prediction have zero data ❌
5. **Grades don't work** — no way to submit assessments or update grades ❌
6. **Course content exists but isn't served** — content is in MongoDB but no API to retrieve it ❌

### Recommended Fixes (by priority):

| # | Fix | Effort |
|---|-----|--------|
| 1 | **Re-run seed** or fix seed script to also update `enrollmentCount` and `enrolledCourses` | 10 min |
| 2 | **Fix StudentMetrics seeding** — debug why it created 0 records | 15 min |
| 3 | **Drop the ghost `stride` collection** | 1 min |
| 4 | **Add CourseContent API routes** so the frontend can load content from DB | 30 min |
| 5 | **Add Assessment submission endpoint** so grades can be recorded | 30 min |
| 6 | **Add StudentMetrics API routes** to power analytics dashboards | 30 min |
