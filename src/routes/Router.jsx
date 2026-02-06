import React from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/public/Home";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import AddCourse from "../features/courses/AddCourse";
import CourseDetails from "../features/courses/CourseDetails";
import Payment from "../features/courses/Payment";
import ManageCourses from "../features/courses/ManageCourses";
import MyEnrolledCourses from "../features/courses/MyEnrolledCourses";
import EditCourse from "../features/courses/EditCourse";
import ErrorPage from "../pages/ErrorPage";
import AllCourses from "../features/courses/AllCourses";
import Dashboard from "../pages/public/DashBoard";
import Admin from "../features/users/Admin";
import Instructor from "../features/users/Instructor";
import Student from "../features/users/Student";
import AdminRoute from "./AdminRoute";
import InstructorRoute from "./InstructorRoute";
import StudentRoute from "./StudentRoute";
import PrivateRoute from "./PrivateRoute";
import CourseAssessment from "../features/assessment/CourseAssessment";
import CourseContent from "../features/courses/CourseContent";
import Achievements from "../pages/Achievements";
import Settings from "../pages/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      // --- Public Routes ---
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/Auth/login",
        element: <Login />,
      },
      {
        path: "/Auth/register",
        element: <Register />,
      },
      {
        path: "courses",
        element: <AllCourses />,
      },
      {
        path: "courses/category/:category",
        element: <AllCourses />,
      },
      {
        path: "/course/:id",
        element: <CourseDetails />,
      },
      {
        path: "/course/:id/payment",
        element: <Payment />,
      },
      {
        path: "/course/:id/learn",
        element: <CourseContent />,
      },
      {
        path: "/course/:id/assessment",
        element: <CourseAssessment />,
      },
      {
        path: "/manage-courses",
        element: <ManageCourses />,
      },
      {
        path: "/achievements",
        element: <Achievements />,
      },
      {
        path: "/settings",
        element: <PrivateRoute><Settings /></PrivateRoute>,
      },

      // --- Private Routes 
      {
        path: "/add-course",
        element: <AddCourse />,
      },
      {
        path: "/edit-course/:id",
        element: <PrivateRoute><EditCourse /></PrivateRoute>,
      },
      {
        path: "/my-courses",
        element: <PrivateRoute><MyEnrolledCourses /></PrivateRoute>,
      },
      {
        path: "dashboard",
        element: <PrivateRoute><Dashboard /></PrivateRoute>,
      },
      {
        path: "admin",
        element: <AdminRoute><Admin /></AdminRoute>,
      },
      {
        path: "instructor",
        element: <InstructorRoute><Instructor /></InstructorRoute>,
      },
      {
        path: "student",
        element: <StudentRoute><Student /></StudentRoute>,
      },
    ],
  },
]);

export default router;