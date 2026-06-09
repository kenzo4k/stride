import React, { useState } from 'react';
import { Plus, X, ListChecks, CheckCircle, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const AssessmentQuestion = ({ question, onUpdate, onRemove, questionIndex }) => {
  const handleTypeChange = (e) => {
    const type = e.target.value;
    const newQuestion = { ...question, type };
    if (type === 'mcq') {
      newQuestion.options = question.options?.length ? question.options : ['Option 1', 'Option 2'];
      // Keep string value instead of index for correctAnswers as expected by CourseAssessment.jsx
      newQuestion.correctAnswers = newQuestion.options[0] ? [newQuestion.options[0]] : [];
    } else if (type === 'true_false') {
      newQuestion.options = ['True', 'False'];
      newQuestion.correctAnswers = [true]; // Use boolean
    }
    onUpdate(newQuestion);
  };

  const updateOption = (idx, value) => {
    const newOptions = [...question.options];
    const oldOption = newOptions[idx];
    newOptions[idx] = value;
    
    // If this option was selected as correct, update it in correctAnswers too
    let newCorrectAnswers = [...(question.correctAnswers || [])];
    if (newCorrectAnswers.includes(oldOption)) {
      newCorrectAnswers = newCorrectAnswers.map(ans => ans === oldOption ? value : ans);
    }
    
    onUpdate({ ...question, options: newOptions, correctAnswers: newCorrectAnswers });
  };

  const removeOption = (idx) => {
    if (question.options.length <= 2) {
      toast.error('MCQ must have at least 2 options');
      return;
    }
    const optionToRemove = question.options[idx];
    const newOptions = question.options.filter((_, i) => i !== idx);
    const newCorrectAnswers = (question.correctAnswers || []).filter(ans => ans !== optionToRemove);
    
    onUpdate({ 
      ...question, 
      options: newOptions, 
      correctAnswers: newCorrectAnswers.length ? newCorrectAnswers : [newOptions[0]] 
    });
  };

  const addOption = () => {
    onUpdate({
      ...question,
      options: [...question.options, `Option ${question.options.length + 1}`]
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4 relative group">
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove Question"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-4 mb-4">
        <div className="mt-2 text-gray-500 cursor-move">
          <GripVertical size={16} />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Question {questionIndex + 1}</label>
              <input
                type="text"
                value={question.question || ''}
                onChange={(e) => onUpdate({ ...question, question: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Enter your question here"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Type</label>
              <select
                value={question.type || 'mcq'}
                onChange={handleTypeChange}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="true_false">True / False</option>
              </select>
            </div>
          </div>

          {/* Multiple Choice Options */}
          {question.type === 'mcq' && (
            <div className="space-y-3 bg-gray-900/50 p-4 rounded border border-gray-700">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Answers</label>
              {question.options?.map((option, idx) => {
                // Determine if this string option is currently selected
                const isSelected = question.correctAnswers?.includes(option);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center" title="Mark as correct">
                      <input
                        type="radio"
                        name={`correct-mcq-${question._id || question.id}`}
                        checked={isSelected}
                        onChange={() => onUpdate({ ...question, correctAnswers: [option] })}
                        className="radio radio-success radio-sm border-gray-500"
                      />
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className={`flex-1 bg-gray-800 border rounded px-3 py-2 text-white focus:outline-none ${isSelected ? 'border-green-500' : 'border-gray-600 focus:border-cyan-500'}`}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      onClick={() => removeOption(idx)}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={addOption}
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center font-medium mt-2"
              >
                <Plus size={14} className="mr-1" /> Add Option
              </button>
            </div>
          )}

          {/* True / False Options */}
          {question.type === 'true_false' && (
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => onUpdate({ ...question, correctAnswers: [true] })}
                className={`flex-1 py-3 rounded-lg border font-bold transition-all ${
                  question.correctAnswers?.includes(true)
                    ? 'border-green-500 bg-green-900/20 text-green-400'
                    : 'border-gray-600 bg-gray-900 hover:bg-gray-800 text-gray-400'
                }`}
              >
                True
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ ...question, correctAnswers: [false] })}
                className={`flex-1 py-3 rounded-lg border font-bold transition-all ${
                  question.correctAnswers?.includes(false)
                    ? 'border-red-500 bg-red-900/20 text-red-400'
                    : 'border-gray-600 bg-gray-900 hover:bg-gray-800 text-gray-400'
                }`}
              >
                False
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const AssessmentTopic = ({ topic, onUpdate, onRemove, topicIndex }) => {
  const addQuestion = () => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      type: 'mcq',
      question: '',
      options: ['Option 1', 'Option 2'],
      correctAnswers: ['Option 1']
    };
    onUpdate({
      ...topic,
      questions: [...(topic.questions || []), newQuestion]
    });
  };

  const updateQuestion = (qId, updatedQuestion) => {
    onUpdate({
      ...topic,
      questions: topic.questions.map(q => (q._id || q.id) === qId ? updatedQuestion : q)
    });
  };

  const removeQuestion = (qId) => {
    onUpdate({
      ...topic,
      questions: topic.questions.filter(q => (q._id || q.id) !== qId)
    });
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden mb-6">
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={topic.name || ''}
            onChange={(e) => onUpdate({ ...topic, name: e.target.value })}
            className="w-full bg-transparent border-b border-transparent focus:border-cyan-500 focus:outline-none text-xl font-bold text-white px-2 py-1"
            placeholder={`Topic ${topicIndex + 1} Name`}
          />
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-400 p-2 rounded hover:bg-gray-700 transition-colors"
          title="Remove Topic"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4">
        {(!topic.questions || topic.questions.length === 0) ? (
          <div className="text-center py-8 text-gray-500">
            <ListChecks size={48} className="mx-auto mb-3 opacity-20" />
            <p>No questions added to this topic yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topic.questions.map((q, idx) => (
              <AssessmentQuestion
                key={q._id || q.id || idx}
                question={q}
                questionIndex={idx}
                onUpdate={(newQ) => updateQuestion(q._id || q.id, newQ)}
                onRemove={() => removeQuestion(q._id || q.id)}
              />
            ))}
          </div>
        )}

        <button
          onClick={addQuestion}
          className="mt-4 w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-cyan-400 hover:border-cyan-500 hover:bg-gray-800 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Question to Topic
        </button>
      </div>
    </div>
  );
};

const CourseAssessmentEditor = ({ assessmentData, onChange, type = 'final-exam' }) => {
  const topics = assessmentData?.topics || [];

  const addTopic = () => {
    const newTopic = {
      id: `topic-${Date.now()}`,
      name: `Topic ${topics.length + 1}`,
      questions: []
    };
    onChange({
      ...assessmentData,
      topics: [...topics, newTopic]
    });
  };

  const updateTopic = (tId, updatedTopic) => {
    onChange({
      ...assessmentData,
      topics: topics.map(t => (t._id || t.id) === tId ? updatedTopic : t)
    });
  };

  const removeTopic = (tId) => {
    onChange({
      ...assessmentData,
      topics: topics.filter(t => (t._id || t.id) !== tId)
    });
  };

  const isPre = type === 'pre-assessment';

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r ${isPre ? 'from-teal-900/25 to-emerald-900/25 border-teal-500/20' : 'from-blue-900/20 to-purple-900/20 border-blue-500/20'} border p-6 rounded-xl flex items-start gap-4`}>
        <CheckCircle className={`${isPre ? 'text-teal-400' : 'text-cyan-400'} flex-shrink-0 mt-1`} size={24} />
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            {isPre ? 'Baseline Pre-Assessment' : 'Final Course Assessment'}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {isPre 
              ? 'Create a pre-assessment to establish student baseline knowledge before they begin.' 
              : 'Create a final assessment that students must pass to complete the course.'}{' '}
            Organize questions into topics. Students will be graded automatically upon submission.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {topics.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
            <h4 className="text-xl font-bold text-white mb-2">No Assessment Created</h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Add your first topic to start building the {isPre ? 'pre-assessment' : 'final assessment'} for this course.
            </p>
            <button
              onClick={addTopic}
              className={`btn ${isPre ? 'bg-teal-600 hover:bg-teal-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white border-none`}
            >
              <Plus className="mr-2" /> Add First Topic
            </button>
          </div>
        ) : (
          <>
            {topics.map((topic, idx) => (
              <AssessmentTopic
                key={topic._id || topic.id || idx}
                topic={topic}
                topicIndex={idx}
                onUpdate={(newT) => updateTopic(topic._id || topic.id, newT)}
                onRemove={() => removeTopic(topic._id || topic.id)}
              />
            ))}

            <div className="pt-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={addTopic}
                className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
              >
                <Plus className="mr-2" /> Add Another Topic
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseAssessmentEditor;
