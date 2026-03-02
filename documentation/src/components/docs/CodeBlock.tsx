import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
};

export default function CodeBlock({
  code,
  language = "text",
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const languageMap: { [key: string]: string } = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    yml: "yaml",
    txt: "text",
  };

  const displayLanguage = languageMap[language] || language;

  return (
    <div className="relative bg-gray-950 border border-gray-700 rounded-lg my-4 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between bg-gray-900 border-b border-gray-700 px-4 py-2">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
          {displayLanguage}
        </span>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer px-2 py-1 rounded hover:bg-gray-800"
        >
          {copied ? (
            <>
              <Check size={16} />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardCopy size={16} />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={displayLanguage}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
