# Stride - Course Management System

A modern, full-stack web application designed to provide a seamless learning experience for students and instructors. Users can browse courses, enroll with a single click, and manage their learning journey. Instructors can add, update, and manage their own courses through a secure dashboard.

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite 6 | Build tool and dev server |
| Tailwind CSS 4 + DaisyUI 5 | Styling |
| React Router v7 | Client-side routing |
| Firebase Auth | Authentication (email/password + Google OAuth) |
| Stripe | Payment processing |
| Piston API | Code execution for coding exercises |
| Framer Motion | Animations |
| React Hook Form | Form handling |

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js 5 | REST API framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication tokens |
| Stripe | Payment processing |
| BcryptJS | Password hashing |
| Axios | HTTP client for external APIs |

## ML Features

The platform includes ML-ready data collection for advanced analytics:

### Student Engagement Metrics
- **Engagement Score**: Calculated from lesson progress (30%), quiz scores (25%), assignment scores (25%), and activity (20%)
- **Login Count**: Track student logins within configurable time windows
- **Session Duration**: Average time spent per session
- **Streak Tracking**: Daily login streaks to encourage consistency

### Learning Activity Tracking
- **Lessons Completed**: Progress through course content
- **Quiz Performance**: Average quiz scores (0-100)
- **Assignment Scores**: Average assignment grades (0-100)
- **Video Watch Time**: Total minutes of video content watched
- **Articles Read**: Number of article lessons completed
- **Coding Exercises**: Programming exercise completion count

### At-Risk Student Detection
The `StudentMetric` model includes a risk flag system to identify students who may need intervention:

| Risk Level | Conditions |
|------------|------------|
| **High** | Engagement score < 30, quiz average < 50, inactive for 7+ days, or no login streak |
| **Medium** | Engagement score < 60, quiz average < 70, or inactive for 3+ days |
| **Low** | All metrics healthy |

### Dropout Prediction
The system tracks `dropout_next_7_days` as a target variable for ML models, enabling:
- Early warning systems for at-risk students
- Intervention recommendations
- Retention analytics

## Prerequisites

- **Node.js** v18+ 
- **MongoDB** running locally or a MongoDB Atlas connection string
- **npm** or **yarn**

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/3mad18/Stride.git
cd Stride
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/stride
PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

> **Note**: If `STRIPE_SECRET_KEY` is not provided, payment features will return mock responses.

Start the backend:

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal and navigate to the project root:

```bash
npm install
```

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_APIKEY=your_firebase_api_key
VITE_AUTHDOMAIN=your_project.firebaseapp.com
VITE_PROJECTID=your_project_id
VITE_STORAGEBUCKET=your_project.firebasestorage.app
VITE_MESSAGINGSENDERID=your_sender_id
VITE_APPID=your_app_id
```

> **Note**: The provided `.env` file contains a shared Firebase project configuration for development.

Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 4. Seed the Database (Optional)

Seed the database with test data including users, courses, enrollments, and student metrics:

```bash
cd server
npm run seed
```

## Test Accounts

After running the seed script, use these credentials to log in:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@stride.com | 123456 | Full platform access, user management |
| **Instructor** | instructor@stride.com | 123456 | Sarah Johnson - Web Development courses |
| **Instructor** | michael@stride.com | 123456 | Michael Chen - Data Science/ML courses |
| **Student** | student@stride.com | 123456 | Default student account |
| **Student** | alice@student.com | 123456 | High performer (Level 12) |
| **Student** | bob@student.com | 123456 | Average performer (Level 9) |
| **Student** | frank@student.com | 123456 | At-risk student (Level 2) |
| **Student** | grace@student.com | 123456 | New student (Level 1) |

### Role Permissions

- **Admin**: Platform statistics, course approvals, user management
- **Instructor**: Create/manage courses, view student analytics, track at-risk students
- **Student**: Enroll in courses, track progress, earn XP/levels, earn achievements

## Available Scripts

### Backend (`/server`)
```bash
npm start        # Start production server
npm run dev      # Start development server with auto-reload
npm run seed     # Populate database with test data
```

### Frontend (`/`)
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth` | POST | User authentication |
| `/api/users` | GET, PUT | User profile management |
| `/api/courses` | GET, POST | Course listing and creation |
| `/api/enrollments` | GET, POST | Enrollment management |
| `/api/instructor/*` | Various | Instructor dashboard APIs |
| `/api/admin/*` | Various | Admin dashboard APIs |
| `/api/execute` | POST | Code execution (Piston API) |
| `/api/create-payment-intent` | POST | Stripe payment processing |

## Project Structure

```
Stride/
├── server/                 # Express.js backend
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── index.js            # Server entry point
│   └── seed.js             # Database seeder
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Authentication
│   │   ├── courses/        # Course management
│   │   ├── dashboard/      # Dashboard views
│   │   └── users/          # User management
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   └── firebase/           # Firebase configuration
├── public/                 # Static assets
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
└── package.json           # Frontend dependencies
```

## Features

- **Course Management**: Full CRUD operations for courses with rich content
- **User Authentication**: Email/password and Google OAuth via Firebase
- **Role-based Dashboards**: Admin, Instructor, and Student views
- **Course Enrollment & Payment**: Stripe-powered checkout
- **Interactive Content**: Lessons with articles, videos, quizzes, and coding exercises
- **Assessment System**: Multiple question types (MCQ, fill-in-blank, true/false, matching, coding)
- **Gamification**: XP/Level system, achievements, badges, leaderboard
- **Code Execution**: In-browser code execution using Piston API
- **At-Risk Student Tracking**: ML-ready metrics for identifying struggling students
- **Student Analytics**: Engagement scores, progress tracking, performance metrics

## License

ISC

## Repository

- GitHub: https://github.com/3mad18/Stride
- Report issues: https://github.com/3mad18/Stride/issues
