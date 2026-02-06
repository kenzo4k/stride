import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { FaChevronDown, FaChevronUp, FaPlay, FaUndo } from "react-icons/fa";

const PISTON_ENDPOINT = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_OPTIONS = [
  {
    id: "javascript",
    label: "JavaScript",
    monacoLanguage: "javascript",
    pistonLanguage: "javascript",
    fileName: "solution.js",
  },
  {
    id: "python",
    label: "Python",
    monacoLanguage: "python",
    pistonLanguage: "python3",
    fileName: "solution.py",
  },
  {
    id: "java",
    label: "Java",
    monacoLanguage: "java",
    pistonLanguage: "java",
    fileName: "Main.java",
  },
  {
    id: "cpp",
    label: "C++",
    monacoLanguage: "cpp",
    pistonLanguage: "cpp",
    fileName: "solution.cpp",
  },
  {
    id: "sql",
    label: "SQL",
    monacoLanguage: "sql",
    pistonLanguage: "sqlite3",
    fileName: "solution.sql",
  },
];

const DEFAULT_STARTER_BY_LANGUAGE = {
  javascript: `console.log("Hello from Piston API!");\nconst sum = 5 + 3;\nconsole.log(sum);\n`,
  python: `print("Hello from Python!")\nfor i in range(5):\n    print(i)\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n        int sum = 5 + 3;\n        System.out.println(sum);\n    }\n}\n`,
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    int sum = 5 + 3;\n    std::cout << sum << std::endl;\n    return 0;\n}\n`,
  sql: `-- SQLite (via Piston)\n-- Note: This runtime may behave differently than a full SQL IDE.\n\nSELECT 'Hello from SQL!' AS message;\nSELECT 5 + 3 AS sum;\n`,
};

const normalizeLanguage = (value) => {
  const raw = (value || "").toString().toLowerCase().trim();
  if (["js", "node", "nodejs", "node-js"].includes(raw)) return "javascript";
  if (["py", "python3", "py3"].includes(raw)) return "python";
  if (["c++", "cpp", "g++", "c"].includes(raw)) return "cpp";
  if (["sqlite", "sqlite3", "sql"].includes(raw)) return "sql";
  return raw;
};

const buildStarterCodeMap = (exercise) => {
  const starter = exercise?.starterCode;

  if (starter && typeof starter === "object") {
    return LANGUAGE_OPTIONS.reduce((acc, lang) => {
      const key = lang.id;
      acc[key] =
        starter[key] ||
        starter[lang.pistonLanguage] ||
        starter[lang.monacoLanguage] ||
        "";
      return acc;
    }, {});
  }

  const shared = typeof starter === "string" ? starter : null;

  return LANGUAGE_OPTIONS.reduce((acc, lang) => {
    acc[lang.id] = shared ?? DEFAULT_STARTER_BY_LANGUAGE[lang.id] ?? "";
    return acc;
  }, {});
};

const formatSeconds = (value) => {
  if (value === null || value === undefined) return null;
  if (Number.isNaN(Number(value))) return null;
  const seconds = Number(value);
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(3)}s`;
};

const CodingExerciseEditor = ({ exercise, lesson }) => {
  const initialLanguage = useMemo(() => {
    const normalized = normalizeLanguage(exercise?.language);
    const found = LANGUAGE_OPTIONS.find((l) => l.id === normalized);
    return found?.id || "javascript";
  }, [exercise?.language]);

  const starterByLanguage = useMemo(
    () => buildStarterCodeMap(exercise),
    [exercise]
  );

  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [codeByLanguage, setCodeByLanguage] = useState(() => starterByLanguage);
  const [fontSize, setFontSize] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  useEffect(() => {
    setSelectedLanguage(initialLanguage);
    setCodeByLanguage(starterByLanguage);
    setHistory([]);
    setActiveHistoryId(null);
    setIsOutputOpen(true);
  }, [lesson?.id, initialLanguage, starterByLanguage]);

  const languageConfig =
    LANGUAGE_OPTIONS.find((l) => l.id === selectedLanguage) ||
    LANGUAGE_OPTIONS[0];

  const code = codeByLanguage[selectedLanguage] ?? "";

  const activeEntry = useMemo(() => {
    if (!history.length) return null;
    const byId = history.find((h) => h.id === activeHistoryId);
    return byId || history[0];
  }, [activeHistoryId, history]);

  const resetCode = () => {
    setCodeByLanguage((prev) => ({
      ...prev,
      [selectedLanguage]: starterByLanguage[selectedLanguage] ?? "",
    }));
    toast.success("Code reset to starter template");
  };

  const runCode = async () => {
    setIsOutputOpen(true);
    setIsRunning(true);

    const toastId = toast.loading("Running code…");

    try {
      const payload = {
        language: languageConfig.pistonLanguage,
        version: "*",
        files: [
          {
            name: languageConfig.fileName,
            content: code,
          },
        ],
      };

      const response = await fetch(PISTON_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Piston API error (HTTP ${response.status})`);
      }

      const data = await response.json();

      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        language: selectedLanguage,
        fileName: languageConfig.fileName,
        stdout: data?.run?.stdout || "",
        stderr: data?.run?.stderr || "",
        exitCode: data?.run?.code,
        time: data?.run?.time,
        compile: data?.compile || null,
      };

      setHistory((prev) => [entry, ...prev].slice(0, 5));
      setActiveHistoryId(entry.id);

      const hasErrors =
        (entry.compile && (entry.compile.stderr || entry.compile.code)) ||
        entry.stderr ||
        entry.exitCode;

      if (hasErrors) {
        toast.error("Execution finished with errors", { id: toastId });
      } else {
        toast.success("Execution completed", { id: toastId });
      }
    } catch (err) {
      toast.error(err?.message || "Failed to run code", { id: toastId });

      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        language: selectedLanguage,
        fileName: languageConfig.fileName,
        stdout: "",
        stderr: err?.message || "Failed to run code",
        exitCode: null,
        time: null,
        compile: null,
      };

      setHistory((prev) => [entry, ...prev].slice(0, 5));
      setActiveHistoryId(entry.id);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-gray-900/70 border border-gray-800 rounded-2xl px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Language
            </span>
            <select
              className="select select-sm bg-gray-950 border-gray-800 text-gray-200 focus:outline-none focus:border-cyan-500"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isRunning}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span className="opacity-60">File:</span>
            <span className="text-gray-300">{languageConfig.fileName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-950/60 border border-gray-800 rounded-xl px-3 py-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Font
            </span>
            <input
              type="range"
              min={12}
              max={20}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="range range-xs w-28"
              disabled={isRunning}
            />
            <span className="text-xs font-bold text-cyan-400 w-8 text-right">
              {fontSize}px
            </span>
          </div>

          <button
            type="button"
            onClick={resetCode}
            className="btn btn-sm bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl"
            disabled={isRunning}
          >
            <FaUndo className="mr-2" /> Reset Code
          </button>

          <button
            type="button"
            onClick={runCode}
            className="btn btn-sm bg-cyan-600 hover:bg-cyan-700 text-white border-none rounded-xl"
            disabled={isRunning}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Running…
              </span>
            ) : (
              <>
                <FaPlay className="mr-2" /> Run Code
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        <div className="lg:col-span-7 bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <span className="text-xs text-gray-400 font-mono ml-4">
                {languageConfig.fileName}
              </span>
            </div>
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
              Monaco IDE
            </span>
          </div>

          <div className="h-[420px] sm:h-[520px]">
            <Editor
              height="100%"
              language={languageConfig.monacoLanguage}
              value={code}
              theme="vs-dark"
              onChange={(value) =>
                setCodeByLanguage((prev) => ({
                  ...prev,
                  [selectedLanguage]: value ?? "",
                }))
              }
              options={{
                fontSize,
                minimap: { enabled: true },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
                padding: { top: 14, bottom: 14 },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-3 bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <button
            type="button"
            onClick={() => setIsOutputOpen((v) => !v)}
            className="w-full bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-300 uppercase tracking-widest">
                Output
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                Last 5 runs
              </span>
            </div>
            <span className="text-gray-400">
              {isOutputOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              isOutputOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 space-y-4">
              {!activeEntry ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-800 bg-gray-900/30 text-gray-400 text-sm">
                  Run your code to see output here.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-400 font-mono truncate">
                      {activeEntry.fileName}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400">
                        Exit: {activeEntry.exitCode ?? "—"}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-400">
                        Time: {formatSeconds(activeEntry.time) ?? "—"}
                      </span>
                    </div>
                  </div>

                  {activeEntry.compile && (activeEntry.compile.stderr || activeEntry.compile.stdout) && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Compile
                      </div>
                      <pre className="text-xs font-mono bg-gray-900/60 border border-gray-800 rounded-xl p-3 overflow-x-auto text-gray-200">
                        {activeEntry.compile.stderr || activeEntry.compile.stdout}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Stdout
                    </div>
                    <pre className="text-xs font-mono bg-gray-900/60 border border-gray-800 rounded-xl p-3 overflow-x-auto text-cyan-100 min-h-16">
                      {activeEntry.stdout || "(empty)"}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Stderr
                    </div>
                    <pre className="text-xs font-mono bg-gray-900/60 border border-gray-800 rounded-xl p-3 overflow-x-auto text-red-200 min-h-16">
                      {activeEntry.stderr || "(empty)"}
                    </pre>
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      History
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      Click to view
                    </span>
                  </div>

                  <div className="space-y-2">
                    {history.map((item, idx) => {
                      const isActive = item.id === (activeEntry?.id || "");
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setActiveHistoryId(item.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            isActive
                              ? "bg-purple-900/20 border-purple-500/30"
                              : "bg-gray-900/30 border-gray-800 hover:border-cyan-600/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-mono text-gray-300 truncate">
                              Run {idx + 1} · {item.language.toUpperCase()}
                            </div>
                            <div
                              className={`text-[10px] font-mono px-2 py-1 rounded-full border ${
                                item.exitCode === 0
                                  ? "text-green-300 border-green-500/20 bg-green-500/10"
                                  : "text-red-300 border-red-500/20 bg-red-500/10"
                              }`}
                            >
                              {item.exitCode === 0 ? "OK" : "ERR"}
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-1">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingExerciseEditor;
