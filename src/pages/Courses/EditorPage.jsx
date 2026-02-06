import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

// Piston requires specific runtime versions
const LANGUAGE_CONFIG = {
  javascript: { version: "18.15.0", label: "JavaScript", monaco: "javascript" },
  python: { version: "3.10.0", label: "Python 3", monaco: "python" },
  cpp: { version: "10.2.0", label: "C++ (GCC)", monaco: "cpp" },
  java: { version: "15.0.2", label: "Java", monaco: "java" },
};

const EditorPage = () => {
  const [code, setCode] = useState("// Write your solution here...");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const runCode = async () => {
    setIsLoading(true);
    setOutput("Executing...");

    try {
      const response = await axios.post("http://localhost:5000/api/execute", {
        code,
        language: language,
        version: LANGUAGE_CONFIG[language].version,
      });

      // Piston returns { stdout, stderr, output, code, signal } in response.data
      const { stdout, stderr } = response.data;

      if (stderr) {
        setOutput(stderr); // Show errors in red or terminal
      } else {
        setOutput(stdout || "Code executed successfully (no output).");
      }
    } catch (err) {
      console.error(err);
      setOutput("Error: Unable to reach the execution server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-[#0d1117] text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold italic text-blue-400">
            Stride IDE
          </h1>
          <p className="text-gray-400">Powered by Piston Engine</p>
        </div>
        <div className="flex gap-4">
          <select
            className="bg-[#161b22] border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-blue-500"
            onChange={(e) => setLanguage(e.target.value)}
            value={language}
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          <button
            onClick={runCode}
            disabled={isLoading}
            className="px-8 py-2 rounded-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-all disabled:opacity-50"
          >
            {isLoading ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        <div className="lg:col-span-2 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <Editor
            height="100%"
            theme="vs-dark"
            language={LANGUAGE_CONFIG[language].monaco}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 font-mono text-sm overflow-auto shadow-2xl">
          <h3 className="text-indigo-400 mb-4 uppercase tracking-widest font-bold border-b border-gray-700 pb-2">
            Terminal Output
          </h3>
          <pre
            className={`whitespace-pre-wrap leading-relaxed ${
              output.includes("Error") ? "text-red-400" : "text-gray-300"
            }`}
          >
            {output || "Click 'Run Code' to see results."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
