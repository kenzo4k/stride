import axios from 'axios';
import CourseContent from '../models/CourseContent.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { executeCodeLocally } from '../services/localRunner.js';

export const getPythonFunctionName = (starterCode) => {
  if (!starterCode) return null;
  const match = starterCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
  return match ? match[1] : null;
};

export const getPythonWrapper = (funcName) => {
  return `
import sys
import json

def _parse_val(s):
    s = s.strip()
    if s.lower() == 'true': return True
    if s.lower() == 'false': return False
    try:
        return json.loads(s)
    except Exception:
        return s

try:
    _inputs = [_parse_val(line) for line in sys.stdin.read().splitlines()]
    _result = ${funcName}(*_inputs)
    print(_result)
except Exception as e:
    print(f"Runtime error in test runner: {e}", file=sys.stderr)
    sys.exit(1)
`;
};

const runPistonTestCase = async (wrappedCode, stdin) => {
  return await executeCodeLocally('python3', wrappedCode, stdin);
};

export const evaluateCodeSubmission = async (req, res) => {
  try {
    const { courseId, lessonId, code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    if (language !== 'python') {
      return res.status(400).json({ message: 'Only Python test case evaluation is supported at this time' });
    }

    // Retrieve Course Content
    const courseContent = await CourseContent.findOne({ courseId });
    if (!courseContent) {
      return res.status(404).json({ message: 'Course content not found' });
    }

    // Find lesson
    let targetLesson = null;
    for (const section of courseContent.sections) {
      const found = section.lessons.find((l) => l.id === lessonId);
      if (found) {
        targetLesson = found;
        break;
      }
    }

    if (!targetLesson || targetLesson.type !== 'coding' || !targetLesson.exercise) {
      return res.status(404).json({ message: 'Coding exercise lesson not found' });
    }

    const testCases = targetLesson.exercise.testCases || [];
    if (testCases.length === 0) {
      return res.status(400).json({ message: 'No test cases defined for this coding exercise' });
    }

    // Wrap the code
    const starterCode = targetLesson.exercise.starterCode || '';
    const funcName = getPythonFunctionName(starterCode);
    let wrappedCode = code;
    if (funcName) {
      const wrapper = getPythonWrapper(funcName);
      wrappedCode = `${code}\n${wrapper}`;
    }

    const promises = testCases.map(async (tc) => {
      try {
        const runRes = await runPistonTestCase(wrappedCode, tc.input);
        const stdout = (runRes.run?.stdout || '').trim();
        const stderr = (runRes.run?.stderr || '').trim();
        const compileStderr = (runRes.compile?.stderr || '').trim();
        const exitCode = runRes.run?.code ?? 0;

        const passed = stdout === tc.expectedOutput.trim() && exitCode === 0 && !stderr && !compileStderr;
        const statusDescription = passed
          ? 'Accepted'
          : (exitCode !== 0 || stderr || compileStderr ? 'Runtime Error' : 'Wrong Answer');

        return {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          stdout,
          stderr: stderr || compileStderr,
          passed,
          isHidden: tc.isHidden,
          statusDescription
        };
      } catch (err) {
        return {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          stdout: '',
          stderr: `Execution engine error: ${err.message}`,
          passed: false,
          isHidden: tc.isHidden,
          statusDescription: 'Failed'
        };
      }
    });

    const results = await Promise.all(promises);
    const passedAll = results.every(r => r.passed);

    // If passed all, record completion & award XP
    let xpAwarded = 0;
    if (passedAll) {
      const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId });
      if (enrollment) {
        const alreadyCompleted = (enrollment.completedLessons || []).includes(lessonId);

        if (!alreadyCompleted) {
          xpAwarded = targetLesson.xp || 20;

          // Find user and award XP
          const user = await User.findById(req.user.id);
          if (user) {
            user.xp = (user.xp || 0) + xpAwarded;
            user.level = Math.floor(user.xp / 100) + 1;
            await user.save();
          }

          // Add lesson to completedLessons
          if (!enrollment.completedLessons) {
            enrollment.completedLessons = [];
          }
          enrollment.completedLessons.push(lessonId);
        }

        // Calculate progress based on actual lesson count from CourseContent
        const totalLessons = courseContent.sections.reduce(
          (acc, section) => acc + (section.lessons?.length || 0),
          0
        );
        enrollment.progress = totalLessons > 0
          ? Math.min(Math.round((enrollment.completedLessons.length / totalLessons) * 100), 100)
          : 0;

        await enrollment.save();
      }
    }

    res.json({
      passed: passedAll,
      xpAwarded,
      results
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
