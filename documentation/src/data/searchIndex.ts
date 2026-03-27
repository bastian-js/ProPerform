export type SearchIndexItem = {
  to: string;
  label: string;
  category: string;
  content: string;
};

export const searchIndex: SearchIndexItem[] = [
  {
    to: "/",
    label: "Home",
    category: "General",
    content:
      "Welcome to ProPerform API Documentation. Getting started with the API, endpoints, authentication, and examples.",
  },
  {
    to: "/docs/test-users",
    label: "Test Users",
    category: "Documentation",
    content:
      "Register and login test users for testing purposes. Demo accounts, sample data, Testuser3934, Demo1234 password, test accounts, pre-registered users",
  },
  {
    to: "/docs/error-responses",
    label: "Error Responses",
    category: "Documentation",
    content:
      "API error responses, HTTP status codes, error handling, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 500 internal server error, error messages, error codes",
  },
  {
    to: "/api/auth/login",
    label: "POST /auth/login",
    category: "API Reference → Auth",
    content:
      "User login endpoint, authenticate user, login with email and password, get access token, JWT token, user authentication",
  },
  {
    to: "/api/auth/register",
    label: "POST /auth/register",
    category: "API Reference → Auth",
    content:
      "User registration endpoint, create new user account, sign up, register with email password firstname birthdate weight height gender fitness_level training_frequency primary_goal onboarding_completed",
  },
  {
    to: "/api/auth/admin/register",
    label: "POST /auth/admin/register",
    category: "API Reference → Auth",
    content:
      "Admin registration endpoint, create admin account, admin sign up, administrator registration",
  },
  {
    to: "/api/auth/admin/login",
    label: "POST /auth/admin/login",
    category: "API Reference → Auth",
    content:
      "Admin login endpoint, administrator authentication, admin access token",
  },
  {
    to: "/api/auth/check-verification-code",
    label: "POST /auth/check-verification-code",
    category: "API Reference → Auth",
    content:
      "Verify email verification code, check verification token, email confirmation, verify account",
  },
  {
    to: "/api/auth/resend-verification-code",
    label: "POST /auth/resend-verification-code",
    category: "API Reference → Auth",
    content:
      "Resend verification email, send new verification code, resend confirmation email",
  },
  {
    to: "/api/auth/reset-password",
    label: "POST /auth/reset-password",
    category: "API Reference → Auth",
    content:
      "Request password reset, forgot password, send password reset email, reset password link",
  },
  {
    to: "/api/auth/reset-password/:token",
    label: "POST /auth/reset-password/:token",
    category: "API Reference → Auth",
    content:
      "Reset password with token, change password, set new password, password recovery",
  },
  {
    to: "/api/users",
    label: "GET /users",
    category: "API Reference → Users",
    content: "Get all users, list users, fetch user list, user directory",
  },
  {
    to: "/api/users/:role",
    label: "GET /users/:role",
    category: "API Reference → Users",
    content:
      "Get users by role, filter users by role, admin users, trainer users, athlete users",
  },
  {
    to: "/api/users/me",
    label: "GET /users/me",
    category: "API Reference → Users",
    content:
      "Get current user profile, fetch my profile, user information, current user data, authenticated user details",
  },
  {
    to: "/api/users/me/update",
    label: "PUT /users/me",
    category: "API Reference → Users",
    content:
      "Update current user profile, edit my profile, update weight height fitness_level training_frequency primary_goal, authenticated user update",
  },
  {
    to: "/api/users/stats",
    label: "GET /users/stats",
    category: "API Reference → Users",
    content:
      "Get user statistics, user metrics, user analytics, user count, user data",
  },
  {
    to: "/api/users/delete/:uid",
    label: "DELETE /users/:uid",
    category: "API Reference → Users",
    content: "Delete user by ID, remove user account, delete user uid",
  },
  {
    to: "/api/streak/update",
    label: "POST /streak/update",
    category: "API Reference -> Users",
    content:
      "Update user streak, create daily streak log, streak update by type, current streak, longest streak, habit tracking",
  },
  {
    to: "/api/streak/:type",
    label: "POST /streak/:type",
    category: "API Reference -> Users",
    content:
      "Get streak by type, current streak value, longest streak value, last activity date, streak status for user",
  },
  {
    to: "/api/logs/weight",
    label: "POST /logs/weight",
    category: "API Reference → Weight Logs",
    content:
      "Create weight log entry, add weight measurement, log weight, record weight, track weight",
  },
  {
    to: "/api/logs/weight/all",
    label: "GET /logs/weight",
    category: "API Reference → Weight Logs",
    content:
      "Get all weight logs, fetch weight history, weight measurements, weight tracking data",
  },
  {
    to: "/api/exercises",
    label: "GET /exercises",
    category: "API Reference → Exercises",
    content:
      "Get all exercises, list exercises, exercise library, workout exercises, available exercises",
  },
  {
    to: "/api/admin/exercises/create",
    label: "POST /admin/exercises/create",
    category: "API Reference → Exercises",
    content:
      "Create new exercise, add exercise, admin create exercise, new workout exercise",
  },
  {
    to: "/api/admin/exercises/:eid",
    label: "GET /admin/exercises/:eid",
    category: "API Reference → Exercises",
    content:
      "Get exercise by ID, fetch exercise details, exercise information, get exercise eid",
  },
  {
    to: "/api/admin/exercises/update/:eid",
    label: "PUT /admin/exercises/:eid",
    category: "API Reference → Exercises",
    content:
      "Update exercise by ID, edit exercise, modify exercise, update exercise eid",
  },
  {
    to: "/api/admin/exercises/delete/:eid",
    label: "DELETE /admin/exercises/:eid",
    category: "API Reference → Exercises",
    content: "Delete exercise by ID, remove exercise, delete exercise eid",
  },
  {
    to: "/api/media",
    label: "GET /media",
    category: "API Reference → Media",
    content:
      "Get all media files, list media, media library, images videos files",
  },
  {
    to: "/api/media/create",
    label: "POST /media/create",
    category: "API Reference → Media",
    content:
      "Upload media file, create media, upload image, upload video, add media file",
  },
  {
    to: "/api/media/:mid",
    label: "PUT /media/:mid",
    category: "API Reference → Media",
    content: "Update media by ID, edit media, modify media, update media mid",
  },
  {
    to: "/api/media/delete/:mid",
    label: "DELETE /media/:mid",
    category: "API Reference → Media",
    content: "Delete media by ID, remove media, delete media mid, remove file",
  },
  {
    to: "/api/system/health",
    label: "GET /system/health",
    category: "API Reference → System",
    content:
      "System health check, API health status, server health, service status, health endpoint",
  },
  {
    to: "/api/system/healthcheck",
    label: "GET /system/healthcheck",
    category: "API Reference → System",
    content:
      "Deprecated health check endpoint, old health check, legacy healthcheck",
  },
  {
    to: "/api/trainers/me",
    label: "GET /trainers/me",
    category: "API Reference → Trainers",
    content:
      "Get current trainer profile, my trainer profile, trainer information, authenticated trainer",
  },
  {
    to: "/api/trainers/:tid/athletes",
    label: "GET /trainers/:tid/athletes",
    category: "API Reference → Trainers",
    content:
      "Get trainer's athletes, list athletes, trainer clients, connected athletes",
  },
  {
    to: "/api/trainers/connect",
    label: "GET /trainers/connect",
    category: "API Reference → Trainers",
    content:
      "Connect to trainer, join trainer, athlete connect trainer, trainer invitation",
  },
  {
    to: "/api/trainers/disconnect",
    label: "GET /trainers/disconnect",
    category: "API Reference → Trainers",
    content:
      "Disconnect from trainer, leave trainer, remove trainer connection",
  },
  {
    to: "/api/trainers/regen-code",
    label: "PATCH /trainers/regen-code",
    category: "API Reference → Trainers",
    content:
      "Regenerate trainer invitation code, new invite code, reset trainer code",
  },
  {
    to: "/api/trainers/check-inv-code",
    label: "POST /trainers/check-inv-code",
    category: "API Reference → Trainers",
    content:
      "Check trainer invitation code, verify invite code, validate trainer code",
  },
  {
    to: "/api/trainers/delete/:tid",
    label: "DELETE /trainers/:tid",
    category: "API Reference → Trainers",
    content: "Delete trainer by ID, remove trainer account, delete trainer tid",
  },
  {
    to: "/settings",
    label: "Settings",
    category: "General",
    content:
      "Application settings, preferences, configuration, sidebar settings, collapse sidebar, UI preferences",
  },
];
