import { spawn } from 'child_process';
import axios from 'axios';
import CourseContent from '../models/CourseContent.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

// Helper function to dynamically generate Python test wrapper
const getPythonWrapper = (lessonId) => {
  if (lessonId.endsWith('-1')) {
    // Sum of two numbers
    return `
import sys
try:
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if len(lines) >= 2:
        val1 = float(lines[0]) if '.' in lines[0] else int(lines[0])
        val2 = float(lines[1]) if '.' in lines[1] else int(lines[1])
        print(add(val1, val2))
except Exception as e:
    import sys
    print(f"Runtime error in test runner: {e}", file=sys.stderr)
    sys.exit(1)
`;
  } else if (lessonId.endsWith('-2')) {
    // Factorial of a number
    return `
import sys
try:
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if len(lines) >= 1:
        val = int(lines[0])
        print(factorial(val))
except Exception as e:
    import sys
    print(f"Runtime error in test runner: {e}", file=sys.stderr)
    sys.exit(1)
`;
  } else if (lessonId.endsWith('-3')) {
    // Is Palindrome String
    return `
import sys
try:
    lines = [line.strip() for line in sys.stdin if line.strip()]
    if len(lines) >= 1:
        val = lines[0]
        print(is_palindrome(val))
except Exception as e:
    import sys
    print(f"Runtime error in test runner: {e}", file=sys.stderr)
    sys.exit(1)
`;
  }
  return '';
};

// Local Python Execution Fallback
const runPythonLocally = (code, stdin) => {
  return new Promise((resolve) => {
    // Try 'python', fall back to 'py' or 'python3' if failed
    const command = process.platform === 'win32' ? 'python' : 'python3';
    const pyProcess = spawn(command, ['-c', code]);
    
    let stdout = '';
    let stderr = '';
    
    pyProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pyProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pyProcess.on('close', (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code
      });
    });
    
    pyProcess.on('error', (err) => {
      // If 'python' is not found, fallback to 'py'
      if (err.code === 'ENOENT' && command === 'python') {
        const fallbackProcess = spawn('py', ['-c', code]);
        let fStdout = '';
        let fStderr = '';
        
        fallbackProcess.stdout.on('data', (data) => { fStdout += data.toString(); });
        fallbackProcess.stderr.on('data', (data) => { fStderr += data.toString(); });
        
        fallbackProcess.on('close', (fCode) => {
          resolve({ stdout: fStdout.trim(), stderr: fStderr.trim(), exitCode: fCode });
        });
        
        fallbackProcess.on('error', (fallbackErr) => {
          resolve({ stdout: '', stderr: `Python runner not found: ${fallbackErr.message}`, exitCode: -1 });
        });
        
        fallbackProcess.stdin.write(stdin);
        fallbackProcess.stdin.end();
      } else {
        resolve({ stdout: '', stderr: `Execution error: ${err.message}`, exitCode: -1 });
      }
    });

    if (pyProcess.stdin) {
      pyProcess.stdin.write(stdin);
      pyProcess.stdin.end();
    }
  });
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
    const wrapper = getPythonWrapper(lessonId);
    const wrappedCode = `${code}\n${wrapper}`;

    const results = [];
    let passedAll = true;

    // Check if RapidAPI Judge0 is configured
    const apiKey = process.env.JUDGE0_API_KEY;
    const apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    const apiHost = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

    if (apiKey && apiKey.trim() !== '') {
      // === JUDGE0 API BATCH FLOW ===
      const submissions = testCases.map((tc) => ({
        language_id: 71, // Python (3.8.1)
        source_code: Buffer.from(wrappedCode).toString('base64'),
        stdin: Buffer.from(tc.input).toString('base64'),
        expected_output: Buffer.from(tc.expectedOutput).toString('base64')
      }));

      try {
        const response = await axios.post(
          `${apiUrl}/submissions/batch?base64_encoded=true&wait=true`,
          { submissions },
          {
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': apiHost
            }
          }
        );

        const subResults = response.data.submissions || response.data || [];
        
        testCases.forEach((tc, idx) => {
          const runRes = subResults[idx] || {};
          const statusId = runRes.status?.id || runRes.status_id;
          const passed = statusId === 3; // status 3 is Accepted/Correct

          if (!passed) passedAll = false;

          const stdout = runRes.stdout ? Buffer.from(runRes.stdout, 'base64').toString('utf-8').trim() : '';
          const stderr = runRes.stderr ? Buffer.from(runRes.stderr, 'base64').toString('utf-8').trim() : '';
          const compileOutput = runRes.compile_output ? Buffer.from(runRes.compile_output, 'base64').toString('utf-8').trim() : '';

          results.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            stdout,
            stderr: stderr || compileOutput,
            passed,
            isHidden: tc.isHidden,
            statusDescription: runRes.status?.description || 'Failed'
          });
        });
      } catch (apiErr) {
        console.error('Judge0 RapidAPI Request Error:', apiErr.response?.data || apiErr.message);
        return res.status(502).json({
          message: 'Error calling execution engine. Please verify RapidAPI settings.',
          error: apiErr.message
        });
      }
    } else {
      // === LOCAL RUNNER FALLBACK FLOW ===
      console.log('No JUDGE0_API_KEY set, falling back to local Python runtime');
      for (const tc of testCases) {
        const runRes = await runPythonLocally(wrappedCode, tc.input);
        const actualOut = runRes.stdout.trim();
        const expectedOut = tc.expectedOutput.trim();
        const passed = actualOut === expectedOut && runRes.exitCode === 0;

        if (!passed) passedAll = false;

        results.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          stdout: actualOut,
          stderr: runRes.stderr,
          passed,
          isHidden: tc.isHidden,
          statusDescription: passed ? 'Accepted' : (runRes.exitCode !== 0 ? 'Runtime Error' : 'Wrong Answer')
        });
      }
    }

    // If passed all, record completion & award XP
    let xpAwarded = 0;
    if (passedAll) {
      xpAwarded = targetLesson.xp || 20;

      // Find user
      const user = await User.findById(req.user.id);
      if (user) {
        user.xp = (user.xp || 0) + xpAwarded;
        user.level = Math.floor(user.xp / 100) + 1;
        await user.save();
      }

      // Update enrollment progress
      const enrollment = await Enrollment.findOne({ userId: req.user.id, courseId });
      if (enrollment) {
        // Calculate new progress: find how many lessons are completed.
        // For simplicity, we can increase progress slightly or mark this lesson as completed.
        // Stride usually has simple progress updates.
        enrollment.progress = Math.min((enrollment.progress || 0) + 10, 100);
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
