import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, FileText, Video, FileCode, ListChecks, Play, Upload, File, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// ─── File Upload Helper ───────────────────────────────────────────────────────
const uploadFileToCloud = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data; // { url, publicId, resourceType, format, bytes, originalName }
};

// ─── Upload Progress UI ──────────────────────────────────────────────────────
const UploadProgress = ({ progress, fileName }) => (
  <div className="mt-2 space-y-1">
    <div className="flex items-center justify-between text-xs text-gray-400">
      <span className="flex items-center gap-1">
        <Loader2 size={12} className="animate-spin" />
        Uploading {fileName}...
      </span>
      <span>{progress}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// ─── Simple Code Editor (JS/Python) ─────────────────────────────────────────
const CodeExerciseEditor = ({ content, onUpdate }) => {
  const [output, setOutput] = useState('');
  const [pyodideReady, setPyodideReady] = useState(false);
  const pyodideRef = useRef(null);

  const title = content.title || '';
  const description = content.description || '';
  const language = content.language || 'javascript';
  const code = content.starterCode || '';
  const testCases = content.testCases || [];

  // Load pyodide when Python is selected
  useEffect(() => {
    if (language === 'python' && !pyodideReady) {
      const loadPyodide = async () => {
        if (!window.loadPyodide) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js';
          script.onload = async () => {
            const pyodide = await window.loadPyodide();
            pyodideRef.current = pyodide;
            setPyodideReady(true);
          };
          document.head.appendChild(script);
        } else {
          try {
            const pyodide = await window.loadPyodide();
            pyodideRef.current = pyodide;
            setPyodideReady(true);
          } catch (err) {
            console.error("Failed to load pyodide", err);
          }
        }
      };
      loadPyodide();
    }
  }, [language, pyodideReady]);

  const runCode = async () => {
    setOutput('');
    try {
      if (language === 'javascript') {
        const result = new Function(code)();
        setOutput(String(result));
      } else if (language === 'python') {
        if (!pyodideReady || !pyodideRef.current) {
          setOutput('Loading Python interpreter...');
          return;
        }
        const result = await pyodideRef.current.runPythonAsync(code);
        setOutput(String(result));
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleFieldChange = (key, value) => {
    onUpdate({
      ...content,
      [key]: value
    });
  };

  const addTestCase = () => {
    const newTestCases = [
      ...testCases,
      { input: '', expectedOutput: '', isHidden: false }
    ];
    handleFieldChange('testCases', newTestCases);
  };

  const updateTestCase = (index, updatedTc) => {
    const newTestCases = testCases.map((tc, idx) => 
      idx === index ? { ...tc, ...updatedTc } : tc
    );
    handleFieldChange('testCases', newTestCases);
  };

  const removeTestCase = (index) => {
    const newTestCases = testCases.filter((_, idx) => idx !== index);
    handleFieldChange('testCases', newTestCases);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">Exercise Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:border-blue-500"
            placeholder="e.g., Sum of Two Numbers"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">Problem Description</label>
          <textarea
            value={description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:outline-none focus:border-blue-500"
            rows={3}
            placeholder="Describe the challenge rules, function signature, parameters, and return value..."
          />
        </div>
      </div>

      <div className="flex gap-4 items-center pt-2">
        <div className="flex flex-col">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => handleFieldChange('language', e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <div className="flex items-end h-full pt-5">
          <button
            onClick={runCode}
            type="button"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 flex items-center space-x-1"
          >
            <Play className="w-4 h-4" />
            <span>Run Code</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wider">Starter Code</label>
        <textarea
          value={code}
          onChange={(e) => handleFieldChange('starterCode', e.target.value)}
          className="w-full h-40 bg-gray-900 border border-gray-600 rounded p-4 text-green-400 font-mono text-sm focus:outline-none focus:border-blue-500"
          placeholder="Write starter code/template here..."
        />
      </div>

      {output && (
        <div className="bg-gray-900 border border-gray-600 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Output:</h4>
          <pre className="text-blue-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Test Cases</h4>
            <p className="text-xs text-gray-400">Define expected outputs for standard inputs. Python functions are tested by running standard inputs into parameters or stdin.</p>
          </div>
          <button
            type="button"
            onClick={addTestCase}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center gap-1 text-xs font-medium transition-colors"
          >
            <Plus size={14} /> Add Test Case
          </button>
        </div>

        <div className="space-y-3">
          {testCases.map((tc, idx) => (
            <div key={idx} className="p-4 bg-gray-900/40 border border-gray-700 rounded-xl space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Test Case #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTestCase(idx)}
                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-800 transition-colors"
                  title="Remove test case"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Input (stdin)</label>
                  <textarea
                    value={tc.input || ''}
                    onChange={(e) => updateTestCase(idx, { input: e.target.value })}
                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 font-mono text-xs focus:outline-none focus:border-blue-500"
                    rows={2}
                    placeholder="e.g. 2\n3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expected Output (stdout)</label>
                  <textarea
                    value={tc.expectedOutput || ''}
                    onChange={(e) => updateTestCase(idx, { expectedOutput: e.target.value })}
                    className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 font-mono text-xs focus:outline-none focus:border-blue-500"
                    rows={2}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  id={`isHidden-${idx}`}
                  checked={tc.isHidden || false}
                  onChange={(e) => updateTestCase(idx, { isHidden: e.target.checked })}
                  className="checkbox checkbox-xs border-gray-600 rounded bg-gray-800"
                />
                <label htmlFor={`isHidden-${idx}`} className="cursor-pointer font-medium select-none">
                  Hidden Test Case (results are evaluated but hidden from students)
                </label>
              </div>
            </div>
          ))}

          {testCases.length === 0 && (
            <div className="text-center p-6 border border-dashed border-gray-700 rounded-xl bg-gray-900/10 text-gray-400 text-sm">
              No test cases defined. Click "Add Test Case" to add one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Content Item Renderer ────────────────────────────────────────────────────
const ContentItem = ({ type, content, onUpdate, onRemove }) => {
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const renderContentInput = () => {
    switch (type) {
      case 'text':
        return (
          <textarea
            value={content.content || ''}
            onChange={(e) => onUpdate({ ...content, content: e.target.value })}
            className="w-full p-2 border rounded bg-gray-800 text-white"
            rows={4}
            placeholder="Enter your text content here..."
          />
        );

      case 'video': {
        const handleVideoFileUpload = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          if (!file.type.startsWith('video/')) {
            toast.error('Please select a video file.');
            return;
          }

          if (file.size > 100 * 1024 * 1024) {
            toast.error('Video must be under 100MB.');
            return;
          }

          setIsUploading(true);
          setUploadProgress(0);

          try {
            const result = await uploadFileToCloud(file, (percent) => {
              setUploadProgress(percent);
            });

            onUpdate({
              ...content,
              url: result.url,
              videoData: '', // Clear any old base64 data
              videoInputType: 'file',
              cloudinaryPublicId: result.publicId,
              originalFileName: result.originalName,
            });

            toast.success('Video uploaded successfully!');
          } catch (error) {
            console.error('Video upload failed:', error);
            toast.error(error.response?.data?.message || 'Failed to upload video.');
          } finally {
            setIsUploading(false);
            setUploadProgress(null);
          }
        };

        const videoInputType = content.videoInputType || 'url';

        return (
          <div className="space-y-2">
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700"
              placeholder="Video Title"
            />
            <div className="flex space-x-4 mb-2">
              <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name={`video-type-${content.id}`}
                  checked={videoInputType === 'url'}
                  onChange={() => onUpdate({ ...content, videoInputType: 'url', videoData: '' })}
                  className="mr-2"
                />
                Video URL
              </label>
              <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name={`video-type-${content.id}`}
                  checked={videoInputType === 'file'}
                  onChange={() => onUpdate({ ...content, videoInputType: 'file' })}
                  className="mr-2"
                />
                Upload File
              </label>
            </div>
            {videoInputType === 'url' ? (
              <input
                type="url"
                value={content.url || ''}
                onChange={(e) => onUpdate({ ...content, url: e.target.value })}
                className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700"
                placeholder="Video URL (YouTube, Vimeo, etc.)"
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  disabled={isUploading}
                  className="w-full p-2 border rounded bg-gray-800 text-gray-300 border-gray-700 cursor-pointer disabled:opacity-50"
                />
                {isUploading && uploadProgress !== null && (
                  <UploadProgress progress={uploadProgress} fileName="video" />
                )}
                {content.url && !isUploading && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle size={14} />
                    <span>Video uploaded: <a href={content.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">{content.originalFileName || 'View video'}</a></span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Max upload size: 100MB. Videos are stored in the cloud.
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'document': {
        const handleDocumentUpload = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const allowed = ['application/pdf', 'text/plain'];
          if (!allowed.includes(file.type)) {
            toast.error('Only PDF and TXT files are supported.');
            return;
          }

          if (file.size > 10 * 1024 * 1024) {
            toast.error('Document must be under 10MB.');
            return;
          }

          setIsUploading(true);
          setUploadProgress(0);

          try {
            const result = await uploadFileToCloud(file, (percent) => {
              setUploadProgress(percent);
            });

            onUpdate({
              ...content,
              url: result.url,
              cloudinaryPublicId: result.publicId,
              originalFileName: result.originalName,
              fileFormat: result.format,
              fileSize: result.bytes,
            });

            toast.success('Document uploaded successfully!');
          } catch (error) {
            console.error('Document upload failed:', error);
            toast.error(error.response?.data?.message || 'Failed to upload document.');
          } finally {
            setIsUploading(false);
            setUploadProgress(null);
          }
        };

        return (
          <div className="space-y-2">
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700"
              placeholder="Document Title"
            />
            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleDocumentUpload}
              disabled={isUploading}
              className="w-full p-2 border rounded bg-gray-800 text-gray-300 border-gray-700 cursor-pointer disabled:opacity-50"
            />
            {isUploading && uploadProgress !== null && (
              <UploadProgress progress={uploadProgress} fileName="document" />
            )}
            {content.url && !isUploading && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle size={14} />
                <span>
                  Document uploaded: <a href={content.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">{content.originalFileName || 'View document'}</a>
                  {content.fileSize && ` (${(content.fileSize / 1024).toFixed(1)} KB)`}
                </span>
              </div>
            )}
            <div className="text-xs text-gray-500">
              Supported: PDF, TXT. Max size: 10MB.
            </div>
          </div>
        );
      }

      case 'quiz': {
        const quizType = content.quizType || 'multiple-choice';
        return (
          <div className="space-y-3">
            <div className="flex space-x-4 mb-2">
              <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name={`quiz-type-${content.id}`}
                  checked={quizType === 'multiple-choice'}
                  onChange={() => onUpdate({ ...content, quizType: 'multiple-choice', options: ['', ''], correctAnswers: [] })}
                  className="mr-2"
                />
                Multiple Choice
              </label>
              <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name={`quiz-type-${content.id}`}
                  checked={quizType === 'true-false'}
                  onChange={() => onUpdate({ ...content, quizType: 'true-false', options: ['True', 'False'], correctAnswers: [0] })}
                  className="mr-2"
                />
                True / False
              </label>
            </div>
            
            <input
              type="text"
              value={content.question || ''}
              onChange={(e) => onUpdate({ ...content, question: e.target.value })}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700"
              placeholder="Question"
            />
            
            {quizType === 'multiple-choice' ? (
              <div className="space-y-2">
                {content.options?.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="flex flex-col items-center justify-center mr-2">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Correct</span>
                      <input
                        type="radio"
                        name={`correct-answer-${content.id}`}
                        checked={content.correctAnswers?.includes(i) || false}
                        onChange={() => {
                          onUpdate({ ...content, correctAnswers: [i] });
                        }}
                        className="radio radio-success radio-sm border-gray-600"
                        title="Mark as correct answer"
                      />
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const options = [...content.options];
                        options[i] = e.target.value;
                        onUpdate({ ...content, options });
                      }}
                      className="flex-1 p-2 border rounded bg-gray-800 text-white border-gray-700"
                      placeholder={`Option ${i + 1}`}
                    />
                    <button
                      onClick={() => {
                        const options = content.options.filter((_, idx) => idx !== i);
                        const correctAnswers = (content.correctAnswers || [])
                          .filter(idx => idx !== i)
                          .map(idx => idx > i ? idx - 1 : idx);
                        onUpdate({ ...content, options, correctAnswers });
                      }}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const options = [...(content.options || []), ''];
                    onUpdate({ ...content, options });
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  <Plus size={14} className="mr-1" /> Add Option
                </button>
              </div>
            ) : (
              <div className="space-y-2 pl-4">
                <span className="text-xs text-gray-400">Select the correct answer:</span>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...content, correctAnswers: [0] })}
                    className={`px-4 py-2 rounded border font-semibold transition-colors ${
                      content.correctAnswers?.includes(0)
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...content, correctAnswers: [1] })}
                    className={`px-4 py-2 rounded border font-semibold transition-colors ${
                      content.correctAnswers?.includes(1)
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    False
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'code':
        return <CodeExerciseEditor content={content} onUpdate={onUpdate} />;
      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'text':
        return <FileText size={16} className="text-blue-400" />;
      case 'video':
        return <Video size={16} className="text-red-400" />;
      case 'quiz':
        return <ListChecks size={16} className="text-yellow-400" />;
      case 'code':
        return <FileCode size={16} className="text-green-400" />;
      case 'document':
        return <File size={16} className="text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 mb-4 border rounded-lg bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="font-medium text-gray-200">
            {type.charAt(0).toUpperCase() + type.slice(1)} Content
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">XP Award:</span>
            <input
              type="number"
              value={content.xp ?? (type === 'quiz' ? 20 : (type === 'code' ? 30 : 10))}
              onChange={(e) => onUpdate({ ...content, xp: parseInt(e.target.value) || 0 })}
              className="w-16 p-1 text-xs border rounded bg-gray-900 text-yellow-400 border-gray-700 text-center font-bold focus:outline-none focus:border-yellow-500"
              min="0"
            />
          </div>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      {renderContentInput()}
    </div>
  );
};

// ─── Section Component ────────────────────────────────────────────────────────
const Section = ({ section, onUpdate, onRemove }) => {
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [_newContentType, _setNewContentType] = useState('text');

  const addContent = (type) => {
    const newContent = { type, id: Date.now() };
    if (type === 'quiz') {
      newContent.question = '';
      newContent.options = [''];
      newContent.correctAnswers = [];
    } else if (type === 'code') {
      newContent.title = '';
      newContent.description = '';
      newContent.starterCode = '';
      newContent.solutionCode = '';
      newContent.testCases = [];
    } else if (type === 'video') {
      newContent.title = '';
      newContent.url = '';
    } else if (type === 'document') {
      newContent.title = '';
      newContent.url = '';
    } else {
      newContent.content = '';
    }
    onUpdate({
      ...section,
      contents: [...(section.contents || []), newContent]
    });
    setIsAddingContent(false);
  };

  const updateContent = (contentId, updatedContent) => {
    onUpdate({
      ...section,
      contents: section.contents.map(content => 
        content.id === contentId ? { ...content, ...updatedContent } : content
      )
    });
  };

  const removeContent = (contentId) => {
    onUpdate({
      ...section,
      contents: section.contents.filter(content => content.id !== contentId)
    });
  };

  return (
    <div className="mb-6 border rounded-lg overflow-hidden bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ ...section, title: e.target.value })}
          className="text-lg font-medium bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none text-white"
          placeholder="Section Title"
        />
        <div className="flex space-x-2">
          {!isAddingContent && (
            <button
              onClick={() => setIsAddingContent(true)}
              className="p-1 text-blue-400 hover:text-blue-300"
              title="Add Content"
            >
              <Plus size={20} />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-300"
            title="Remove Section"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <input
          type="text"
          value={section.description || ''}
          onChange={(e) => onUpdate({ ...section, description: e.target.value })}
          className="w-full p-2 mb-4 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200"
          placeholder="Section description (optional)"
        />

        {isAddingContent && (
          <div className="mb-4 p-4 border border-dashed border-gray-600 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-300">Add New Content</h4>
              <button
                onClick={() => setIsAddingContent(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => addContent('text')}
                className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FileText size={24} className="text-blue-400 mb-1" />
                <span className="text-sm text-gray-200">Text</span>
              </button>
              <button
                onClick={() => addContent('video')}
                className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Video size={24} className="text-red-400 mb-1" />
                <span className="text-sm text-gray-200">Video</span>
              </button>
              <button
                onClick={() => addContent('document')}
                className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <File size={24} className="text-orange-400 mb-1" />
                <span className="text-sm text-gray-200">Document</span>
              </button>
              <button
                onClick={() => addContent('quiz')}
                className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ListChecks size={24} className="text-yellow-400 mb-1" />
                <span className="text-sm text-gray-200">Quiz</span>
              </button>
              <button
                onClick={() => addContent('code')}
                className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FileCode size={24} className="text-green-400 mb-1" />
                <span className="text-sm text-gray-200">Code</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {section.contents?.map((content) => (
            <ContentItem
              key={content.id}
              type={content.type}
              content={content}
              onUpdate={(updatedContent) => updateContent(content.id, updatedContent)}
              onRemove={() => removeContent(content.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Editor Component ────────────────────────────────────────────────────
const CourseContentEditor = ({ content = [], onChange }) => {
  const [sections, setSections] = useState(
    content.length > 0 ? content : [{ id: Date.now(), title: 'Introduction', contents: [] }]
  );

  const updateSections = (updatedSections) => {
    setSections(updatedSections);
    onChange(updatedSections);
  };

  const addSection = () => {
    updateSections([
      ...sections,
      {
        id: Date.now(),
        title: `Section ${sections.length + 1}`,
        contents: []
      }
    ]);
  };

  const updateSection = (sectionId, updatedSection) => {
    updateSections(
      sections.map(section => 
        section.id === sectionId ? updatedSection : section
      )
    );
  };

  const removeSection = (sectionId) => {
    if (sections.length > 1) {
      updateSections(sections.filter(section => section.id !== sectionId));
    } else {
      toast.error("At least one section is required");
    }
  };

  const moveSection = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    updateSections(newSections);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-200">Course Content</h3>
        <button
          onClick={addSection}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 flex items-center space-x-1"
        >
          <Plus size={18} />
          <span>Add Section</span>
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={section.id} className="relative group">
            {index > 0 && (
              <button
                onClick={() => moveSection(index, index - 1)}
                className="absolute -left-10 top-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Move up"
              >
                ↑
              </button>
            )}
            <Section
              section={section}
              onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
              onRemove={() => removeSection(section.id)}
            />
            {index < sections.length - 1 && (
              <button
                onClick={() => moveSection(index, index + 1)}
                className="absolute -left-10 bottom-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Move down"
              >
                ↓
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseContentEditor;
