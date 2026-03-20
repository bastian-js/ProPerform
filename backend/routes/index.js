import publicUserRoutes from "./UserRoutes/publicUserRoutes.js";
import protectedUserRoutes from "./UserRoutes/protected/index.js";
import publicSystemRoutes from "./SystemRoutes/publicSystemRoutes.js";
import protectedSystemRoutes from "./SystemRoutes/ProtectedSystemRoutes.js";
import publicTrainerRoutes from "./TrainerRoutes/publicTrainerRoutes.js";
import privateTrainerRoutes from "./TrainerRoutes/private/index.js";
import authRoutes from "./AuthRoutes/index.js";
import weightLogRoutes from "./UserRoutes/weightLogRoutes.js";
import protectedExerciseRoutes from "./ExerciseRoutes/protected/index.js";
import listExerciseAll from "./ExerciseRoutes/protected/listExercisesAll.js";
import protectedMediaRoutes from "./MediaRoutes/protected/index.js";
import protectedAuthRoutes from "./AuthRoutes/protectedAuthRoutes.js";

import notificationRoutes from "./AdminRoutes/protected/notificationRoutes.js";
import notificationsMe from "./UserRoutes/Notifications/notificationsMe.js";

const routeMounts = [
  { router: publicUserRoutes, path: "/users", protected: false },
  { router: publicTrainerRoutes, path: "/trainers", protected: false },
  { router: authRoutes, path: "/auth", protected: false },
  { router: publicSystemRoutes, path: "/system", protected: false },
  { router: listExerciseAll, path: "/exercises", protected: true },
  { router: protectedUserRoutes, path: "/users", protected: true },
  { router: protectedSystemRoutes, path: "/system", protected: true },
  { router: privateTrainerRoutes, path: "/trainers", protected: true },
  { router: weightLogRoutes, path: "/logs", protected: true },
  { router: protectedExerciseRoutes, path: "/admin", protected: true },
  { router: protectedMediaRoutes, path: "/media", protected: true },
  { router: protectedAuthRoutes, path: "/auth", protected: true },
  { router: notificationRoutes, path: "/admin", protected: true },
  { router: notificationsMe, path: "/notifications", protected: true },
];

const mountRoutes = (app) => {
  routeMounts.forEach(({ router, path }) => {
    app.use(path, router);
  });
};

export { routeMounts, mountRoutes };
