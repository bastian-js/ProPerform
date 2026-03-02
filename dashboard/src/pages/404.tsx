import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-white select-none overflow-hidden">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Die Seite die du suchst, existiert nicht.
        </h1>

        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Bitte überprüfe die URL oder kehre zur Startseite zurück.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
          >
            <Globe size={20} />
            Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
