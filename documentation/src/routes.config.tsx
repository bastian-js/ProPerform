// admin
import GetExercisesEid from "./pages/api-reference/admin/get-exercise-eid";
import DeleteExercisesEid from "./pages/api-reference/admin/delete-exercise-eid";
import PostExercisesCreate from "./pages/api-reference/admin/post-exercise-create";
import PutExercisesEid from "./pages/api-reference/admin/put-exercise-eid";
import GetMuscleGroups from "./pages/api-reference/admin/get-exercises-muscle-groups";
import GetNotifications from "./pages/api-reference/admin/get-notifications";

// auth
import PostAdminLogin from "./pages/api-reference/auth/post-admin-login";
import PostAdminRegister from "./pages/api-reference/auth/post-admin-register";
import PostLogout from "./pages/api-reference/auth/post-logout";
import PostCheckVerificationCode from "./pages/api-reference/auth/post-check-verification-code";
import PostLogin from "./pages/api-reference/auth/post-login";
import PostRegister from "./pages/api-reference/auth/post-register";
import PostResendVerificationCode from "./pages/api-reference/auth/post-resend-verification-code";
import PostResetPassword from "./pages/api-reference/auth/post-reset-password";
import PostResetPasswordToken from "./pages/api-reference/auth/post-reset-password-token";
import PostAuthRefresh from "./pages/api-reference/auth/post-refresh";
import GetAuthVerifyToken from "./pages/api-reference/auth/get-auth-verify-token";
import PostLoginTrainer from "./pages/api-reference/auth/post-login-trainer";
import PostRegisterTrainer from "./pages/api-reference/auth/post-register-trainer";

// exercises
import GetExercises from "./pages/api-reference/exercises/get-exercises";

// media
import DeleteMediaMid from "./pages/api-reference/media/delete-media-mid";
import GetMedia from "./pages/api-reference/media/get-media";
import PostMedia from "./pages/api-reference/media/post-create-media";
import PutMediaMid from "./pages/api-reference/media/put-media-mid";
import GetMediaByMid from "./pages/api-reference/media/get-media-mid";

// system
import GetHealth from "./pages/api-reference/system/get-health";
import GetHealthcheck from "./pages/api-reference/system/get-healthcheck";
import PostSystemSaveLog from "./pages/api-reference/system/post-system-save-log";

// trainers
import DeleteTrainersTid from "./pages/api-reference/trainers/delete-trainer-tid";
import DisconnectTrainer from "./pages/api-reference/trainers/get-trainer-disconnect";
import GetTrainerAthletes from "./pages/api-reference/trainers/get-trainers-tid-athletes";
import GetMyTrainer from "./pages/api-reference/trainers/get-trainer-me";
import RegenerateTrainerCode from "./pages/api-reference/trainers/patch-trainers-regen-code";
import CheckInviteCode from "./pages/api-reference/trainers/post-trainer-check-inv-code";
import PostTrainersConnect from "./pages/api-reference/trainers/post-trainers-connect";

// users
import DeleteUsersUid from "./pages/api-reference/users/delete-users-uid";
import GetUsersMe from "./pages/api-reference/users/get-users-me";
import GetUsers from "./pages/api-reference/users/get-users";
import GetUsersRole from "./pages/api-reference/users/get-users-role";
import GetUsersStats from "./pages/api-reference/users/get-users-stats";
import GetUsersMeTrainer from "./pages/api-reference/users/get-users-me-trainer";
import PutUsersMe from "./pages/api-reference/users/put-users-me";
import PostStreakUpdate from "./pages/api-reference/users/post-streak-update";
import PostStreakType from "./pages/api-reference/users/post-streak-type";

// weight
import GetLogsWeight from "./pages/api-reference/weight/get-logs-weight";
import PostLogsWeight from "./pages/api-reference/weight/post-logs-weight";

// training plans
import GetTrainingPlans from "./pages/api-reference/training-plans/get-training-plans";
import PostTrainingPlans from "./pages/api-reference/training-plans/post-training-plans";
import GetTrainingPlanById from "./pages/api-reference/training-plans/get-training-plans-tpid";
import PutTrainingPlans from "./pages/api-reference/training-plans/put-training-plans-tpid";
import DeleteTrainingPlan from "./pages/api-reference/training-plans/delete-training-plans-tpid";
import GetTrainingPlanExercises from "./pages/api-reference/training-plans/get-training-plans-tpid-exercises";
import PostTrainingPlanExercises from "./pages/api-reference/training-plans/post-training-plans-tpid-exercises";
import PutTrainingPlanExercise from "./pages/api-reference/training-plans/put-training-plans-tpid-exercises-id";
import DeleteTrainingPlanExercise from "./pages/api-reference/training-plans/delete-training-plans-tpid-exercises-id";
import GetUserTrainingPlans from "./pages/api-reference/training-plans/get-users-training-plans";
import PostUserTrainingPlans from "./pages/api-reference/training-plans/post-users-training-plans";
import GetUserSelectedTrainingPlan from "./pages/api-reference/training-plans/get-users-training-plans-selected";
import GetCurrentTrainingWithExercises from "./pages/api-reference/training-plans/get-users-training-plans-start-current";
import GetUsersTrainingPlansTrainingToday from "./pages/api-reference/training-plans/get-users-training-plans-training-today";
import PatchSelectUserTrainingPlan from "./pages/api-reference/training-plans/patch-users-training-plans-id-select";
import DeleteUserTrainingPlan from "./pages/api-reference/training-plans/delete-users-training-plans-id";

import RequestBodys from "./pages/docs/request-bodys";
import ErrorResponses from "./pages/docs/error-responses";
import TestUsers from "./pages/docs/test-users";
import TrainingPlansImplementation from "./pages/docs/training-plans-implementation";

import Settings from "./pages/Settings";
import CheckToken from "./pages/docs/check-token";
import GetNotificationsMe from "./pages/api-reference/notifications/get-notifications-me";
import PostNotificationsSend from "./pages/api-reference/admin/post-notifications-send";
import PostAuthPushToken from "./pages/api-reference/auth/post-push-token";

export const apiRoutes = [
  // docs
  { path: "settings", element: <Settings /> },
  { path: "docs/request-bodys", element: <RequestBodys /> },
  { path: "docs/error-responses", element: <ErrorResponses /> },
  { path: "docs/test-users", element: <TestUsers /> },
  { path: "docs/verify-token", element: <CheckToken /> },
  {
    path: "docs/training-plans-implementation",
    element: <TrainingPlansImplementation />,
  },

  // auth
  { path: "api/auth/login", element: <PostLogin /> },
  { path: "api/auth/register", element: <PostRegister /> },
  { path: "api/auth/admin/login", element: <PostAdminLogin /> },
  { path: "api/auth/admin/register", element: <PostAdminRegister /> },
  { path: "api/auth/trainers/login", element: <PostLoginTrainer /> },
  { path: "api/auth/trainers/register", element: <PostRegisterTrainer /> },
  { path: "api/auth/push-token", element: <PostAuthPushToken /> },
  { path: "api/auth/refresh", element: <PostAuthRefresh /> },
  { path: "api/auth/verify-token", element: <GetAuthVerifyToken /> },
  {
    path: "api/auth/check-verification-code",
    element: <PostCheckVerificationCode />,
  },
  {
    path: "api/auth/resend-verification-code",
    element: <PostResendVerificationCode />,
  },
  { path: "api/auth/reset-password", element: <PostResetPassword /> },
  {
    path: "api/auth/reset-password/:token",
    element: <PostResetPasswordToken />,
  },
  { path: "api/auth/logout", element: <PostLogout /> },

  // users
  { path: "api/users", element: <GetUsers /> },
  { path: "api/users/:role", element: <GetUsersRole /> },
  { path: "api/users/me", element: <GetUsersMe /> },
  { path: "api/users/me/update", element: <PutUsersMe /> },
  { path: "api/users/me/trainer", element: <GetUsersMeTrainer /> },
  { path: "api/users/stats", element: <GetUsersStats /> },
  { path: "api/users/delete/:uid", element: <DeleteUsersUid /> },
  { path: "api/streak/update", element: <PostStreakUpdate /> },
  { path: "api/streak/:type", element: <PostStreakType /> },

  // weight
  { path: "api/logs/weight", element: <PostLogsWeight /> },
  { path: "api/logs/weight/all", element: <GetLogsWeight /> },

  // trainers
  { path: "api/trainers/:tid", element: <DeleteTrainersTid /> },
  {
    path: "api/trainers/:tid/regenerate-code",
    element: <RegenerateTrainerCode />,
  },
  {
    path: "api/trainers/check-invite-code",
    element: <CheckInviteCode />,
  },
  { path: "api/trainers/connect", element: <PostTrainersConnect /> },
  {
    path: "api/trainers/disconnect",
    element: <DisconnectTrainer />,
  },
  {
    path: "api/trainers/:tid/athletes",
    element: <GetTrainerAthletes />,
  },
  { path: "api/trainers/me", element: <GetMyTrainer /> },

  // exercises
  { path: "api/exercises", element: <GetExercises /> },
  { path: "api/admin/exercises/create", element: <PostExercisesCreate /> },
  { path: "api/admin/exercises/:eid", element: <GetExercisesEid /> },
  {
    path: "api/admin/exercises/:eid/delete",
    element: <DeleteExercisesEid />,
  },
  {
    path: "api/admin/exercises/:eid/update",
    element: <PutExercisesEid />,
  },
  {
    path: "api/admin/exercises/muscle-groups",
    element: <GetMuscleGroups />,
  },

  // media
  { path: "api/media", element: <PostMedia /> },
  { path: "api/media/list", element: <GetMedia /> },
  { path: "api/media/:mid", element: <GetMediaByMid /> },
  { path: "api/media/:mid/delete", element: <DeleteMediaMid /> },
  { path: "api/media/:mid/update", element: <PutMediaMid /> },

  // notifications
  { path: "api/notifications/me", element: <GetNotificationsMe /> },
  { path: "api/admin/notifications/send", element: <PostNotificationsSend /> },
  { path: "api/admin/notifications", element: <GetNotifications /> },

  // system
  { path: "api/system/health", element: <GetHealth /> },
  { path: "api/system/healthcheck", element: <GetHealthcheck /> },
  { path: "api/system/save-log", element: <PostSystemSaveLog /> },

  // training plans
  { path: "api/training-plans", element: <GetTrainingPlans /> },
  { path: "api/training-plans/create", element: <PostTrainingPlans /> },
  { path: "api/training-plans/:tpid", element: <GetTrainingPlanById /> },
  { path: "api/training-plans/:tpid/update", element: <PutTrainingPlans /> },
  { path: "api/training-plans/:tpid/delete", element: <DeleteTrainingPlan /> },
  {
    path: "api/training-plans/:tpid/exercises",
    element: <GetTrainingPlanExercises />,
  },
  {
    path: "api/training-plans/:tpid/exercises/add",
    element: <PostTrainingPlanExercises />,
  },
  {
    path: "api/training-plans/:tpid/exercises/:id/update",
    element: <PutTrainingPlanExercise />,
  },
  {
    path: "api/training-plans/:tpid/exercises/:id/delete",
    element: <DeleteTrainingPlanExercise />,
  },

  // user training plans
  { path: "api/users/training-plans", element: <GetUserTrainingPlans /> },
  {
    path: "api/users/training-plans/assign",
    element: <PostUserTrainingPlans />,
  },
  {
    path: "api/users/training-plans/selected",
    element: <GetUserSelectedTrainingPlan />,
  },
  {
    path: "api/users/training-plans/training/today",
    element: <GetUsersTrainingPlansTrainingToday />,
  },
  {
    path: "api/users/training-plans/start/current",
    element: <GetCurrentTrainingWithExercises />,
  },
  {
    path: "api/users/training-plans/:id/select",
    element: <PatchSelectUserTrainingPlan />,
  },
  {
    path: "api/users/training-plans/:id/delete",
    element: <DeleteUserTrainingPlan />,
  },
];
