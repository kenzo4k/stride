import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, FileText, Video, FileCode, ListChecks, Play } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple code editor supporting JavaScript and Python
const CodeExerciseEditor = ({ content, onUpdate }) => {
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState(content.language || 'javascript');
  const [code, setCode] = useState(content.starterCode || '');
  const [pyodideReady, setPyodideReady] = useState(false);
  const pyodideRef = useRef(null);

  useEffect(() => {
    onUpdate({ ...content, language, starterCode: code });
  }, [language, code, content, onUpdate]);

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
        // Execute code in a simple sandbox
        // Avoid using eval directly in production
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button
          onClick={runCode}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 flex items-center space-x-1"
        >
          <Play className="w-4 h-4" />
          <span>Run Code</span>
        </button>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-40 bg-gray-900 border border-gray-600 rounded p-4 text-green-400 font-mono text-sm"
        placeholder="Write code here..."
      />
      {output && (
        <div className="bg-gray-900 border border-gray-600 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Output:</h4>
          <pre className="text-blue-400 font-mono text-sm">{output}</pre>
        </div>
      )}
    </div>
  );
};

const ContentItem = ({ type, content, onUpdate, onRemove }) => {
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
      case 'video':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onUpdate({ ...content, title: e.target.value })}
              className="w-full p-2 border rounded bg-gray-800 text-white"
              placeholder="Video Title"
            />
            <input
              type="url"
              value={content.url || ''}
              onChange={(e) => onUpdate({ ...content, url: e.target.value })}
              className="w-full p-2 border rounded bg-gray-800 text-white"
              placeholder="Video URL (YouTube, Vimeo, etc.)"
            />
          </div>
        );
      case 'quiz':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={content.question || ''}
              onChange={(e) => onUpdate({ ...content, question: e.target.value })}
              className="w-full p-2 border rounded bg-gray-800 text-white"
              placeholder="Question"
            />
            <div className="space-y-2">
              {content.options?.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={content.correctAnswers?.includes(i) || false}
                    onChange={(e) => {
                      const correctAnswers = [...(content.correctAnswers || [])];
                      if (e.target.checked) {
                        correctAnswers.push(i);
                      } else {
                        const index = correctAnswers.indexOf(i);
                        if (index > -1) correctAnswers.splice(index, 1);
                      }
                      onUpdate({ ...content, correctAnswers });
                    }}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const options = [...content.options];
                      options[i] = e.target.value;
                      onUpdate({ ...content, options });
                    }}
                    className="flex-1 p-2 border rounded bg-gray-800 text-white"
                    placeholder={`Option ${i + 1}`}
                  />
                  <button
                    onClick={() => {
                      const options = content.options.filter((_, idx) => idx !== i);
                      onUpdate({ ...content, options });
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
          </div>
        );
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
      default:
        return null;
    }
  };

  return (
    <div className="p-4 mb-4 border rounded-lg bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="font-medium text-gray-200">
            {type.charAt(0).toUpperCase() + type.slice(1)} Content
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-400"
        >
          <X size={18} />
        </button>
      </div>
      {renderContentInput()}
    </div>
  );
};

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
    } else if (type === 'video') {
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
