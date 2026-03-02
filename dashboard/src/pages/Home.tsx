import { Globe, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-white select-none overflow-hidden">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Willkommen im <span className="text-blue-500">ProPerform</span>{" "}
          <span className="text-blue-400">
            <br />
            Admin-Dashboard
          </span>
        </h1>

        <p className="text-gray-400 max-w-xl mx-auto text-lg">
          Dieses Admin-Dashboard ermöglicht es dir, Owner und Trainer zu
          verwalten, Benutzer und Trainer einzusehen, Statistiken auszuwerten
          sowie den aktuellen Systemstatus zu überwachen.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <a
            href="https://properform.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-all duration-300 hover:scale-110 hover:-rotate-2 cursor-pointer"
          >
            <Globe size={18} />
            Website
          </a>
          <a
            href="https://github.com/b-bastian/ProPerform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 hover:scale-110 hover:rotate-2 cursor-pointer"
          >
            <Github size={18} />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
