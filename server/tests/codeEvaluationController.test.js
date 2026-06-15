import { test } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { evaluateCodeSubmission } from '../controllers/codeEvaluationController.js';
import CourseContent from '../models/CourseContent.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import axios from 'axios';

test('codeEvaluationController - unit tests', async (t) => {
  const originalFindOneContent = CourseContent.findOne;
  const originalFindOneEnrollment = Enrollment.findOne;
  const originalFindByIdUser = User.findById;
  const originalAxiosPost = axios.post;
  const originalApiKey = process.env.JUDGE0_API_KEY;

  t.after(() => {
    CourseContent.findOne = originalFindOneContent;
    Enrollment.findOne = originalFindOneEnrollment;
    User.findById = originalFindByIdUser;
    axios.post = originalAxiosPost;
    process.env.JUDGE0_API_KEY = originalApiKey;
  });

  await t.test('evaluateCodeSubmission should fail if language is not Python', async () => {
    const req = {
      body: {
        courseId: 'c1',
        lessonId: 'l1',
        code: 'def add(a, b): return a + b',
        language: 'javascript' // Unsupported language
      }
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status: function(code) {
        statusCode = code;
        return this;
      },
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await evaluateCodeSubmission(req, res);

    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseData.message, 'Only Python test case evaluation is supported at this time');
  });

  await t.test('evaluateCodeSubmission should execute code using mocked Judge0 API', async () => {
    const courseId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId().toString();

    // Force Judge0 flow by setting mock api key
    process.env.JUDGE0_API_KEY = 'mock-key';

    // Mock models
    CourseContent.findOne = async () => ({
      courseId,
      sections: [
        {
          title: 'Section 1',
          lessons: [
            {
              id: 'lesson-1',
              type: 'coding',
              xp: 20,
              exercise: {
                starterCode: 'def add(a, b):\n    pass\n',
                testCases: [
                  { input: '2\n2\n', expectedOutput: '4\n', isHidden: false }
                ]
              }
            }
          ]
        }
      ]
    });

    Enrollment.findOne = async () => ({
      userId,
      courseId,
      progress: 10,
      save: async () => {}
    });

    User.findById = async () => ({
      _id: userId,
      xp: 50,
      level: 1,
      save: async () => {}
    });

    // Mock axios post response representing Judge0 batch results
    axios.post = async () => {
      return {
        data: {
          submissions: [
            {
              status: { id: 3, description: 'Accepted' }, // status 3 is Accepted
              stdout: Buffer.from('4\n').toString('base64'),
              stderr: '',
              compile_output: ''
            }
          ]
        }
      };
    };

    const req = {
      body: {
        courseId,
        lessonId: 'lesson-1',
        code: 'def add(a, b):\n    return a + b',
        language: 'python'
      },
      user: { id: userId, email: 'student@example.com', role: 'student' }
    };

    let responseData = null;
    const res = {
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await evaluateCodeSubmission(req, res);

    assert.ok(responseData);
    assert.strictEqual(responseData.passed, true);
    assert.strictEqual(responseData.xpAwarded, 20);
    assert.strictEqual(responseData.results[0].passed, true);
    assert.strictEqual(responseData.results[0].stdout, '4');
  });
});
