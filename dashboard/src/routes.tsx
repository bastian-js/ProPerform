import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Stats from "./pages/Stats";
import Login from "./pages/Login";
import CreateTrainer from "./pages/CreateTrainer";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateOwner from "./pages/CreateOwner";
import SystemStatus from "./pages/System";
import NotFound from "./pages/404";
import AddExercise from "./pages/exercises/AddExercise";
import ExerciseList from "./pages/exercises/List";
import FileUpload from "./pages/media/Upload";
import FileList from "./pages/media/List";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <Stats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-trainer"
        element={
          <ProtectedRoute>
            <CreateTrainer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-owner"
        element={
          <ProtectedRoute>
            <CreateOwner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system"
        element={
          <ProtectedRoute>
            <SystemStatus />
          </ProtectedRoute>
        }
      />

      <Route path="/exercises/create" element={<AddExercise />} />
      <Route path="/exercises/list" element={<ExerciseList />} />

      <Route path="/login" element={<Login />} />

      <Route path="/media/upload" element={<FileUpload />} />
      <Route path="/media/list" element={<FileList />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
