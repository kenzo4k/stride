import React, { useState } from "react";

const defaultQuestion = {
  type: "mcq",
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  score: 1,
};

const QuizEditor = ({ quiz, onChange }) => {
  const [questions, setQuestions] = useState(quiz || [defaultQuestion]);

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
    onChange && onChange(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
    onChange && onChange(updated);
  };

  const handleMatchingPairChange = (qIdx, pairIdx, field, value) => {
    const updated = [...questions];
    if (!updated[qIdx].pairs) {
      updated[qIdx].pairs = [];
    }
    if (!updated[qIdx].pairs[pairIdx]) {
      updated[qIdx].pairs[pairIdx] = { left: "", right: "" };
    }
    updated[qIdx].pairs[pairIdx][field] = value;
    setQuestions(updated);
    onChange && onChange(updated);
  };

  const addMatchingPair = (qIdx) => {
    const updated = [...questions];
    if (!updated[qIdx].pairs) {
      updated[qIdx].pairs = [];
    }
    updated[qIdx].pairs.push({ left: "", right: "" });
    setQuestions(updated);
    onChange && onChange(updated);
  };

  const removeMatchingPair = (qIdx, pairIdx) => {
    const updated = [...questions];
    updated[qIdx].pairs = updated[qIdx].pairs.filter((_, idx) => idx !== pairIdx);
    setQuestions(updated);
    onChange && onChange(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...defaultQuestion }]);
  };

  const removeQuestion = (idx) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    onChange && onChange(updated);
  };

  const changeQuestionType = (idx, newType) => {
    const updated = [...questions];
    updated[idx].type = newType;

    // Reset fields based on type
    switch (newType) {
      case "mcq":
        updated[idx].options = ["", "", "", ""];
        updated[idx].answer = 0;
        break;
      case "fill_blank":
        updated[idx].answer = "";
        delete updated[idx].options;
        delete updated[idx].pairs;
        break;
      case "matching":
        updated[idx].pairs = [{ left: "", right: "" }];
        delete updated[idx].options;
        delete updated[idx].answer;
        break;
      case "true_false":
        updated[idx].answer = true;
        delete updated[idx].options;
        delete updated[idx].pairs;
        break;
    }

    setQuestions(updated);
    onChange && onChange(updated);
  };

  return (
    <div className="space-y-8">
      {questions.map((q, idx) => (
        <div key={idx} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-600 transition">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-white text-lg">Question {idx + 1}</div>
            <button
              className="btn bg-red-600 hover:bg-red-700 text-white border-none btn-sm"
              onClick={() => removeQuestion(idx)}
            >
              Remove Question
            </button>
          </div>

          {/* Question Type Selector */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Question Type:</label>
            <select
              className="select select-bordered w-full bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-cyan-500"
              value={q.type || "mcq"}
              onChange={(e) => changeQuestionType(idx, e.target.value)}
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="matching">Matching</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <input
              type="text"
              className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              placeholder="Question text"
              value={q.question}
              onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
            />
          </div>

          {/* MCQ Options */}
          {q.type === "mcq" && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Options:</label>
              <div className="space-y-2">
                {q.options.map((opt, oidx) => (
                  <input
                    key={oidx}
                    type="text"
                    className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    placeholder={`Option ${oidx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, oidx, e.target.value)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <label className="text-gray-300">Correct Answer:</label>
                <select
                  className="select select-bordered bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-cyan-500"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(idx, "answer", Number(e.target.value))}
                >
                  {q.options.map((opt, oidx) => (
                    <option key={oidx} value={oidx}>{`Option ${oidx + 1}`}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Fill in the Blank */}
          {q.type === "fill_blank" && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Correct Answer:</label>
              <input
                type="text"
                className="input input-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                placeholder="Enter the correct answer"
                value={q.answer || ""}
                onChange={(e) => handleQuestionChange(idx, "answer", e.target.value)}
              />
            </div>
          )}

          {/* Matching */}
          {q.type === "matching" && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Matching Pairs:</label>
              <div className="space-y-3">
                {q.pairs && q.pairs.map((pair, pairIdx) => (
                  <div key={pairIdx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="input input-bordered flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                      placeholder="Left item"
                      value={pair.left}
                      onChange={(e) => handleMatchingPairChange(idx, pairIdx, "left", e.target.value)}
                    />
                    <span className="text-gray-400">↔</span>
                    <input
                      type="text"
                      className="input input-bordered flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                      placeholder="Right item"
                      value={pair.right}
                      onChange={(e) => handleMatchingPairChange(idx, pairIdx, "right", e.target.value)}
                    />
                    <button
                      className="btn bg-red-600 hover:bg-red-700 text-white border-none btn-sm"
                      onClick={() => removeMatchingPair(idx, pairIdx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn bg-gray-700 hover:bg-gray-600 text-white border-none btn-sm mt-3"
                onClick={() => addMatchingPair(idx)}
              >
                + Add Pair
              </button>
            </div>
          )}

          {/* True/False */}
          {q.type === "true_false" && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Correct Answer:</label>
              <div className="flex gap-4">
                <button
                  className={`flex-1 p-4 rounded-lg border-2 font-bold transition-all ${
                    q.answer === true
                      ? "border-green-500 bg-green-900/30 text-green-400"
                      : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-gray-300"
                  }`}
                  onClick={() => handleQuestionChange(idx, "answer", true)}
                >
                  True
                </button>
                <button
                  className={`flex-1 p-4 rounded-lg border-2 font-bold transition-all ${
                    q.answer === false
                      ? "border-red-500 bg-red-900/30 text-red-400"
                      : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-gray-300"
                  }`}
                  onClick={() => handleQuestionChange(idx, "answer", false)}
                >
                  False
                </button>
              </div>
            </div>
          )}

          {/* Score */}
          <div className="flex items-center gap-4">
            <label className="text-gray-300">Score:</label>
            <input
              type="number"
              min={1}
              className="input input-bordered w-24 bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-cyan-500"
              value={q.score}
              onChange={(e) => handleQuestionChange(idx, "score", Number(e.target.value))}
            />
          </div>
        </div>
      ))}
      <button 
        className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none" 
        onClick={addQuestion}
      >
        Add Question
      </button>
    </div>
  );
};

export default QuizEditor;
