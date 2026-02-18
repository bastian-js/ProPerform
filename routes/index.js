import publicUserRoutes from "./UserRoutes/publicUserRoutes.js";
import protectedUserRoutes from "./UserRoutes/protected/index.js";
import publicSystemRoutes from "./SystemRoutes/publicSystemRoutes.js";
import protectedSystemRoutes from "./SystemRoutes/ProtectedSystemRoutes.js";
import publicTrainerRoutes from "./TrainerRoutes/publicTrainerRoutes.js";
import privateTrainerRoutes from "./TrainerRoutes/private/index.js";
import authRoutes from "./AuthRoutes/index.js";
import weightLogRoutes from "./UserRoutes/weightLogRoutes.js";
import protectedExerciseRoutes from "./ExerciseRoutes/protected/index.js";
import publicExercisesRoutes from "./ExerciseRoutes/publicExerciseRoutes.js";
import protectedMediaRoutes from "./MediaRoutes/protected/index.js";

const routeRouters = {
  publicUserRoutes,
  protectedUserRoutes,
  publicSystemRoutes,
  protectedSystemRoutes,
  publicTrainerRoutes,
  privateTrainerRoutes,
  authRoutes,
  weightLogRoutes,
  protectedExerciseRoutes,
  publicExercisesRoutes,
  protectedMediaRoutes,
};

const mountRoutes = (app) => {
  // Public routes
  app.use("/users", publicUserRoutes);
  app.use("/trainers", publicTrainerRoutes);
  app.use("/auth", authRoutes);
  app.use("/system", publicSystemRoutes);
  app.use("/exercises", publicExercisesRoutes);

  // Protected routes
  app.use("/users", protectedUserRoutes);
  app.use("/system", protectedSystemRoutes);
  app.use("/trainers", privateTrainerRoutes);
  app.use("/logs", weightLogRoutes);
  app.use("/admin", protectedExerciseRoutes);
  app.use("/media", protectedMediaRoutes);
};

export { routeRouters, mountRoutes };
