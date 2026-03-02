import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, X, FileIcon } from "lucide-react";
import authFetch from "../../functions/authFetch";

const BASE_URL = "https://api.properform.app";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<{
    message: string;
    filename: string;
    url: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
      setUploadError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFilename("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setUploadError("Bitte wähle eine Datei aus");
      return;
    }

    if (file.size > 75 * 1024 * 1024) {
      setUploadError("Datei ist zu groß (max. 75MB)");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setShowSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      let uploadUrl = `${BASE_URL}/media`;
      if (filename.trim()) {
        uploadUrl += `?filename=${encodeURIComponent(filename.trim())}`;
      }

      const response = await authFetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Upload fehlgeschlagen (${response.status})`,
        );
      }

      const responseData = await response.json();
      setUploadResponse(responseData);
      setShowSuccess(true);
      setFile(null);
      setFilename("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        setShowSuccess(false);
      }, 8000);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center w-full mt-20">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <h1 className="text-3xl font-bold text-blue-400 mb-8 text-center">
          Datei hochladen
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 transition-all duration-300 cursor-pointer relative ${
              isDragging
                ? "border-blue-400 bg-blue-500/10"
                : "border-gray-600 hover:border-blue-400"
            }`}
          >
            {/* X Button oben rechts */}
            {file && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-all cursor-pointer hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div
                className={`p-4 rounded-lg transition-all duration-300 ${
                  isDragging ? "bg-blue-500/20" : "bg-gray-700"
                }`}
              >
                <Upload
                  className={`w-8 h-8 transition-colors ${
                    isDragging ? "text-blue-400" : "text-gray-400"
                  }`}
                />
              </div>

              {file ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FileIcon className="w-4 h-4 text-blue-400" />
                    <p className="font-semibold text-gray-100">{file.name}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-200 font-semibold mb-1">
                    Datei auswählen oder ablegen
                  </p>
                  <p className="text-sm text-gray-400">
                    Klick oder Drag & Drop
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Filename Input */}
          <div className="flex flex-col">
            <label className="text-sm mb-2 text-gray-300 tracking-wide font-semibold">
              Optionaler Dateiname
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg placeholder-gray-500 transition"
              placeholder="z.B. mein-upload.pdf"
            />
          </div>

          {/* Upload Button */}
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Wird hochgeladen...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Hochladen</span>
              </>
            )}
          </button>
        </form>

        {/* Success Message */}
        {showSuccess && uploadResponse && (
          <div className="mt-6 bg-green-500/20 border border-green-500 text-green-200 p-6 rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0 text-green-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-green-300 mb-2">
                  {uploadResponse.message}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-green-200">
                    <span className="font-semibold">Dateiname:</span>{" "}
                    {uploadResponse.filename}
                  </p>
                  <p className="text-green-200 break-all">
                    <span className="font-semibold">URL:</span>{" "}
                    <code className="bg-green-900/30 px-2 py-1 rounded text-xs">
                      {uploadResponse.url}
                    </code>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open(uploadResponse.url, "_blank")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:scale-98 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              Datei öffnen
            </button>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mt-6 bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-300 hover:text-red-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
