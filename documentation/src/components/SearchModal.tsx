import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

import { searchIndex } from "../data/searchIndex";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SearchResult = {
  to: string;
  label: string;
  category: string;
  matchType: "page" | "content";
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const getSearchResults = (): {
    pageMatches: SearchResult[];
    contentMatches: SearchResult[];
  } => {
    if (!query.trim()) {
      return { pageMatches: [], contentMatches: [] };
    }

    const lowerQuery = query.toLowerCase();
    const pageMatches: SearchResult[] = [];
    const contentMatches: SearchResult[] = [];

    searchIndex.forEach((item) => {
      const labelMatch = item.label.toLowerCase().includes(lowerQuery);
      const categoryMatch = item.category.toLowerCase().includes(lowerQuery);
      const contentMatch = item.content.toLowerCase().includes(lowerQuery);

      if (labelMatch || categoryMatch) {
        pageMatches.push({
          to: item.to,
          label: item.label,
          category: item.category,
          matchType: "page",
        });
      } else if (contentMatch) {
        contentMatches.push({
          to: item.to,
          label: item.label,
          category: item.category,
          matchType: "content",
        });
      }
    });

    return { pageMatches, contentMatches };
  };

  const { pageMatches, contentMatches } = getSearchResults();
  const hasPageMatches = pageMatches.length > 0;
  const hasContentMatches = contentMatches.length > 0;
  const showDivider = hasPageMatches && hasContentMatches;

  const handleSelect = (to: string) => {
    navigate(to);
    onClose();
    setQuery("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setQuery("");
      }
    };

    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
            autoFocus
          />

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {query.trim() && (
          <div className="max-h-96 overflow-y-auto">
            {hasPageMatches || hasContentMatches ? (
              <div className="py-2">
                {hasPageMatches && (
                  <div>
                    {pageMatches.map((res, index) => (
                      <button
                        key={`page-${index}`}
                        onClick={() => handleSelect(res.to)}
                        className="w-full px-4 py-3 hover:bg-blue-900 transition-colors text-left flex flex-col gap-1 cursor-pointer border-l-2 border-transparent hover:border-blue-500"
                      >
                        <span className="text-white font-medium">
                          {res.label}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {res.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {showDivider && (
                  <div className="my-2 px-4">
                    <div className="border-t border-gray-700"></div>
                    <p className="text-xs text-gray-500 mt-2 mb-1">
                      Content Matches
                    </p>
                  </div>
                )}

                {hasContentMatches && (
                  <div>
                    {contentMatches.map((res, index) => (
                      <button
                        key={`content-${index}`}
                        onClick={() => handleSelect(res.to)}
                        className="w-full px-4 py-3 hover:bg-blue-900/50 transition-colors text-left flex flex-col gap-1 cursor-pointer border-l-2 border-transparent hover:border-blue-500/50"
                      >
                        <span className="text-white font-medium">
                          {res.label}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {res.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="px-4 py-8 text-center text-gray-500">
            Type to start searching...
          </div>
        )}
      </div>
    </div>
  );
}
