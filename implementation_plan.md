# Fix Authentication, Navigation, Instructor Features, and Functional Bugs in Stride

This implementation plan outlines the steps required to resolve security issues, navigation crashes, route guard exposures, and functional errors in the Stride Course Management System frontend and backend. It also incorporates detailed updates for the instructor dashboard, database schemas, and telemetry widgets.

## User Review Required

> [!WARNING]
> **Authentication Security (Hashed Passwords):**
> Seeding is already hashed in `seed.js`, and login/register endpoints hash/compare correctly in `authController.js`. However, `userController.js`'s custom `registerUser` endpoint (used for admin/direct user creation) creates a user *without* hashing. We will update the `User.js` mongoose model schema to include a pre-save hook for password hashing, ensuring that passwords are automatically hashed regardless of which controller saves the user.

> [!IMPORTANT]
> **Course Curriculum Schema Addition:**
> The `curriculum` field is currently sent by the frontend `AddCourse` form but is silently discarded because it's missing from the MongoDB `Course` model schema. We will add `curriculum` as an array of `{ title: String, description: String }` objects to `Course.js`, update `AddCourse.jsx` to parse lines in a `Title: Description` format, and ensure it displays correctly in the `ManageCourses.jsx` details modal.

> [!IMPORTANT]
> **Password Change Endpoint:**
> We will add a dedicated `PUT /api/users/change-password` endpoint rather than overloading `PUT /api/users/profile`. This is cleaner and allows us to separately validate current and new password constraints.

## Proposed Changes

---

### Backend Components (Security & API Fixes)

#### [MODIFY] [User.js](file:///E:/project/stride/server/models/User.js)
- Add a pre-save hook to hash user passwords automatically using `bcrypt` if the password field is modified.

#### [MODIFY] [Course.js](file:///E:/project/stride/server/models/Course.js)
- Add the `curriculum` field to the Mongoose schema:
  `curriculum: [{ title: { type: String }, description: { type: String } }]`

#### [MODIFY] [userController.js](file:///E:/project/stride/server/controllers/userController.js)
- Add a new controller method `changePassword` that validates the current password (using `bcrypt.compare`) and updates to the new hashed password.
- Update `registerUser` to support saving the password (which will be automatically hashed by the pre-save hook).

#### [MODIFY] [userRoutes.js](file:///E:/project/stride/server/routes/userRoutes.js)
- Register `router.put('/change-password', verifyToken, changePassword)`.

#### [MODIFY] [instructorController.js](file:///E:/project/stride/server/controllers/instructorController.js)
- Update `getInstructorStudents` to:
  1. Populate both `userId` and `courseId` from the `Enrollment` model query.
  2. Map student enrollments to aggregate individual students, calculating each student's `avgGrade` from their completed/graded course enrollments.
  3. Include a list of each student's enrolled courses with titles and enrolment dates in the returned student payload, which will be used to construct the dynamic "Recent Activity" list on the frontend.
- Implement the stubbed `sendReminder` and `sendBulkReminder` endpoints. Rather than just returning success, log the reminders to a new collection or print them clearly to the console log with recipient metadata.

---

### Frontend Components (UI, Context & Routing)

#### [MODIFY] [AuthProvider.jsx](file:///E:/project/stride/src/context/AuthProvider.jsx)
- Ensure the user object saved to `localStorage` does not leak credentials. (Delete the `password` field from user JSON responses in both auth registration/login and user endpoints).

#### [MODIFY] [Navbar.jsx](file:///E:/project/stride/src/components/common/Navbar.jsx)
- Fix mobile logout crash by replacing `logout()` with `logOut()`.
- Fix desktop logout crash by removing the `.then()` chain from the synchronous `logOut()` function.
- Change `user?.displayName` to `user?.name || user?.displayName` to display the logged-in user's name correctly.
- Point the admin "Users" link to the existing `/admin` route instead of the non-existent `/admin/users` route.

#### [MODIFY] [Router.jsx](file:///E:/project/stride/src/routes/Router.jsx)
- Wrap `/course/:id/learn` and `/course/:id/assessment` in `<PrivateRoute>` to prevent unauthenticated users from hanging the app.
- Wrap `/manage-courses` and `/edit-course/:id` in `<InstructorRoute>` or `<PrivateRoute>` to ensure correct role permissions.
- Wrap `/add-course` and `/achievements` in their proper route guards.

#### [MODIFY] [Instructor.jsx](file:///E:/project/stride/src/features/users/Instructor.jsx)
- Update the Student Management tab to render the actual dynamic calculated average grade: replace `<td>-</td>` with `<td>{student.avgGrade ? `${student.avgGrade.toFixed(1)}%` : 'N/A'}</td>`.
- Replace the mock "Recent Activity" widget mapping: compile real activities dynamically by flattening each student's courses list and sorting them by `enrolledAt` to render the actual course titles and dates instead of hardcoded strings like `"their course"` and `"recently"`.

#### [MODIFY] [MyEnrolledCourses.jsx](file:///E:/project/stride/src/features/courses/MyEnrolledCourses.jsx)
- Update unenrollment flow to use the correct enrollment `_id` instead of the `courseId` when calling `api.post(`/enrollments/${enrollmentId}/unenroll`)`.

#### [MODIFY] [AddCourse.jsx](file:///E:/project/stride/src/features/courses/AddCourse.jsx)
- Correct the success validation to check for `response.data._id` instead of `response.data.insertedId` to match backend REST formats.
- Update `curriculum` mapping before submitting to backend: parse each line of curriculum text separated by a colon (`:`) into structured objects `{ title: String, description: String }` instead of plain strings.

#### [MODIFY] [Settings.jsx](file:///E:/project/stride/src/pages/Settings.jsx)
- Exclude the `account` settings block from the `localStorage` auto-save logic to prevent storing raw password text.
- Wire the "Update Password" button to hit the new backend `/api/users/change-password` endpoint.

#### [MODIFY] [CourseDetails.jsx](file:///E:/project/stride/src/features/courses/CourseDetails.jsx) & [Payment.jsx](file:///E:/project/stride/src/features/courses/Payment.jsx)
- Fix wrong login redirect path from `/login` to `/Auth/login`.
- Disable rating star inputs in `CourseDetails.jsx` so users cannot visually click and modify the displayed rating.

#### [MODIFY] [MainLayout.jsx](file:///E:/project/stride/src/layout/MainLayout.jsx) & [Footer.jsx](file:///E:/project/stride/src/components/common/Footer.jsx)
- Change footer omission paths in `MainLayout.jsx` to `/Auth/login` and `/Auth/register`.
- Replace or clean up 404 links in `Footer.jsx` (such as `/instructors`, `/blog`, etc.) with real routes or placeholders.

#### [DELETE] [checkout.jsx](file:///E:/project/stride/src/pages/checkout.jsx) & [CompletionPage.jsx](file:///E:/project/stride/src/pages/CompletionPage.jsx)
- Remove unused, dead files from the pages folder.

---

## Verification Plan

### Automated Verification
1. Run `npm run build` at the root and server to verify compilation is successful.
2. Run Vite dev server (`npm run dev`) and test authentication routes.

### Manual Verification
1. **Desktop/Mobile Logout**: Click logout on both viewports and confirm seamless redirect to login without ReferenceErrors or TypeErrors.
2. **Settings Auto-save**: Check DevTools -> Local Storage. Confirm that toggle updates are saved but password inputs are never stored in plaintext inside `userSettings`.
3. **Password Change**: Try changing password from Settings page. Verify validation alerts mismatching inputs, and verify successful update using new password to log in again.
4. **Unenrollment**: Unenroll from a course as a student, reload, and verify the course remains un-enrolled.
5. **Instructor Dynamic Metrics**: Add a course with `Module: Desc` curriculum, verify it saves in MongoDB and renders correctly in the details modal in Manage Courses. Confirm the student list shows actual student average grades, and recent activities populate dynamic courses and dates.
