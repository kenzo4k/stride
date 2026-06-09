import { test } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { getAssessment, submitAssessment } from '../controllers/assessmentController.js';
import Assessment from '../models/Assessment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

test('assessmentController - unit tests', async (t) => {
  const originalFindOneCourse = Course.findOne;
  const originalFindByIdCourse = Course.findById;
  const originalFindOneEnrollment = Enrollment.findOne;
  const originalFindOneAssessment = Assessment.findOne;
  const originalFindByIdUser = User.findById;

  t.after(() => {
    Course.findOne = originalFindOneCourse;
    Course.findById = originalFindByIdCourse;
    Enrollment.findOne = originalFindOneEnrollment;
    Assessment.findOne = originalFindOneAssessment;
    User.findById = originalFindByIdUser;
  });

  await t.test('getAssessment should strip correct answers for MCQ and matching questions', async () => {
    const courseId = new mongoose.Types.ObjectId().toString();

    // Mock course check
    Course.findById = async () => ({
      _id: courseId,
      instructorId: new mongoose.Types.ObjectId().toString()
    });

    // Mock enrollment check
    Enrollment.findOne = async () => ({ userId: 'u1', courseId, status: 'active' });

    // Mock assessment document with answers
    Assessment.findOne = async () => ({
      _id: 'a1',
      courseId,
      type: 'final-exam',
      topics: [
        {
          name: 'Core JavaScript',
          questions: [
            {
              _id: 'q1',
              type: 'mcq',
              question: 'Which of the following is correct?',
              options: ['A', 'B'],
              correctAnswer: 'A',
              points: 10
            },
            {
              _id: 'q2',
              type: 'matching',
              question: 'Match terms',
              pairs: [
                { left: 'Key', right: 'Value', correct: true }
              ],
              points: 10
            }
          ]
        }
      ]
    });

    const req = {
      params: { courseId, type: 'final-exam' },
      user: { id: 'u1', email: 'student@example.com', role: 'student' }
    };

    let responseData = null;
    const res = {
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await getAssessment(req, res);

    assert.ok(responseData);
    const q1 = responseData.topics[0].questions[0];
    const q2 = responseData.topics[0].questions[1];

    // Assert that correct answers have been removed
    assert.strictEqual(q1.correctAnswer, undefined);
    assert.strictEqual(q2.pairs[0].correct, undefined);
    assert.strictEqual(q1.question, 'Which of the following is correct?');
    assert.deepStrictEqual(q1.options, ['A', 'B']);
  });

  await t.test('submitAssessment should calculate correct score and award XP', async () => {
    const courseId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId().toString();

    // Mock enrollment and user
    Enrollment.findOne = async () => ({
      userId,
      courseId,
      grade: 0,
      save: async () => {}
    });

    User.findById = async () => ({
      _id: userId,
      xp: 100,
      level: 2,
      save: async () => {}
    });

    // Mock assessment with multiple question types
    Assessment.findOne = async () => ({
      _id: 'a1',
      courseId,
      type: 'final-exam',
      topics: [
        {
          name: 'Topic 1',
          questions: [
            {
              _id: 'q1',
              type: 'mcq',
              correctAnswer: 'A',
              points: 10
            },
            {
              _id: 'q2',
              type: 'true_false',
              correctAnswer: true,
              points: 10
            }
          ]
        }
      ]
    });

    const req = {
      params: { courseId, type: 'final-exam' },
      user: { id: userId, email: 'student@example.com', role: 'student' },
      body: {
        answers: [
          { questionId: 'q1', answer: 'A' }, // Correct
          { questionId: 'q2', answer: false } // Incorrect
        ]
      }
    };

    let responseData = null;
    const res = {
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await submitAssessment(req, res);

    assert.ok(responseData);
    // Score should be 50% (10 out of 20 points)
    assert.strictEqual(responseData.score, 50);
    assert.strictEqual(responseData.totalPoints, 20);
    assert.strictEqual(responseData.earnedPoints, 10);
    // Score < 60 is a fail
    assert.strictEqual(responseData.passed, false);
    // XP awarded for 50% score should be 20 XP
    assert.strictEqual(responseData.xpAwarded, 20);
  });
});
