# Verification Scenario Plan: Stride Course Management System (Vercel & MongoDB Atlas Edition)

Use this step-by-step manual test script to verify and validate that all bugs, security issues, and feature enhancements are working correctly on your Vercel deployments.

---

## 🚀 Environment Setup
Please replace the following placeholders with your actual Vercel URLs during testing:
- **Frontend App URL:** `https://your-stride-frontend.vercel.app` (referred to as **App URL**)
- **Backend API Logs:** Can be viewed on your Vercel Dashboard under **Project** -> **Deployments** -> **Logs** -> **Serverless Functions** (referred to as **Vercel Logs**).

Since your project is connected to a seeded MongoDB Atlas database, you can use your existing seeded user accounts to execute these tests.

---

## 🎓 Scenario 1: Student Role (Security, Telemetry & Gamification)

### Test 1: plain-text Password Leak Check
1. Open your browser, navigate to your **App URL** login page (`/Auth/login`), and log in as a student.
2. Right-click the page -> **Inspect** -> go to the **Application** (or **Storage**) tab -> **Local Storage** -> select your frontend Vercel domain.
3. Look at the `user` key value.
4. **Verification:** Inspect the JSON string. Confirm that the `password` field is **not** present in the user object.
5. Look at the `userSettings` key. Go to Settings (`/settings`), change a preference, and input a password in settings.
6. **Verification:** Confirm that toggles save but the `account` object containing plaintext passwords is **not** persisted to Local Storage.

### Test 2: Actual Password Update
1. Navigate to the `/settings` tab.
2. Scroll to the **Account Settings** / **Change Password** section.
3. Test validation errors:
   - Type mismatching new passwords and click save -> verify error toast.
   - Type a short password (< 8 chars) -> verify error toast.
4. Enter your current password and a new password, and click update.
5. **Verification:** Confirm the "Password updated successfully!" toast. Log out and confirm you can log in *only* using your new password.

### Test 3: Leaderboard & Level 1 Calculations
1. Log in as a student. Go to the Student Dashboard (`/student`).
2. Verify that your level is displayed as **Level 1** (assuming XP < 100).
3. **Verification:** Confirm the XP progress bar displays a valid progression ratio and that the level does **not** render as "Level 0" in achievements or dashboard widgets.
4. Click the newly exposed **Leaderboard** tab.
5. **Verification:** Confirm that the student leaderboard is rendered, displaying top students sorted by XP points.

### Test 4: Assessment submission & Matching Auto-grading
1. Enroll in a course and click **Take Quiz** or navigate to `/course/:id/assessment`.
2. Answer MCQ, True/False, and Fill in the Blank questions.
3. If matching questions are present, submit matches.
4. Submit the quiz.
5. **Verification:** Try submitting wrong matching answers and verify they are graded as incorrect. Confirm that correct matches are graded as correct and award appropriate XP.

### Test 5: Student Unenrollment
1. Navigate to the **My Courses** tab or `/my-courses`.
2. Find an enrolled course and click **Remove Course** / **Unenroll**.
3. Accept the confirmation dialog.
4. **Verification:** Verify the success modal triggers, the course disappears from the list, and stays unenrolled upon page refresh (no 404 parameter mismatches).

---

## 👨‍🏫 Scenario 2: Instructor Role (Course Creation & Dashboards)

### Test 6: Add Course Curriculum Structure
1. Log in as an instructor. Go to the **Add Course** page (`/add-course`).
2. Fill out details. In the **Curriculum** textbox, enter items using the `Module: Description` format, e.g.:
   - `Module 1: Introduction to React and State`
   - `Module 2: Mongoose Schemas and Models`
3. Submit the form.
4. **Verification:** Verify that the "Course Added!" success modal displays. Navigate to **Manage Courses** (`/manage-courses`), click on the details eye icon for your new course, and verify that the curriculum displays correctly with both the modules and descriptions rendered properly.

### Test 7: Assessment Lockout Fix (No 403 Forbidden)
1. Go to your course editor page (`/edit-course/:id`).
2. Navigate to the **Assessments** tab.
3. Modify a quiz or add a new question, and click **Save Assessment**.
4. **Verification:** Verify that the assessment saves successfully with a success toast, and does **not** lock you out with a 403 Forbidden error.

### Test 8: Telemetry Dashboard & Table Stats
1. Go to the **Instructor Dashboard** (`/instructor`).
2. Look at the **Student Management** tab.
3. **Verification:** Verify that the student list renders their calculated average grade (`student.avgGrade`) rather than a static dash (`-`).
4. Go to the dashboard **Overview** tab and look at the **Recent Activity** widget.
5. **Verification:** Verify that the course titles and timestamps are dynamically generated (e.g. "student enrolled in Introduction to Node.js on 04/06/2026") instead of saying `"their course"` and `"recently"`.

### Test 9: Reminders integration
1. On the Student Management or At-Risk Student list, click **Send Reminder** / **Contact**.
2. **Verification:** Open your Vercel Dashboard for the backend deployment, navigate to **Logs**, and verify that the reminder logs details to your Serverless Function log streams (e.g. `[Reminder Sent] To: student@stride.com, Course: React Basics, Msg: ...`) and returns a success message on the frontend.

---

## 👑 Scenario 3: Admin Role (Modifications & Approvals)

### Test 10: Create Course Redirection
1. Log in as an admin. Go to the Admin Dashboard (`/admin`).
2. Click the **Create Course** button in the header.
3. **Verification:** Verify that it redirects you successfully to the course creation form (`/add-course`) instead of throwing a 404 page.

### Test 11: Instructor Management Suspension Status
1. Go to the **Instructors** tab in the Admin Panel.
2. Select an instructor and click **Suspend Instructor** (the UserX button).
3. **Verification:** Verify the status in the table changes to `suspended` and remains suspended after reloading the page (confirming it is retrieved dynamically from the database).

### Test 12: Refund Denial Reason Prompt
1. Go to the **Refund Requests** tab.
2. Find a pending unenrollment/refund request and click **Deny**.
3. **Verification:** Confirm that a SweetAlert input modal appears asking for a denial reason. 
4. Type a reason (e.g., "Request past 14-day limit") and click confirm. Rejecting the dialog should abort the action. Submitting should process the denial, show a success toast, and remove it from the list.
