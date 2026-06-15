import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

// Try to import Sandbox from @vercel/sandbox. If it fails (e.g. package not installed), we use a placeholder.
let Sandbox;
try {
  const mod = await import('@vercel/sandbox');
  Sandbox = mod.Sandbox;
} catch (e) {
  console.warn('⚠️ @vercel/sandbox package could not be imported. Using local runner only.');
}

const getFilename = (language) => {
  const raw = (language || '').toLowerCase().trim();
  if (['python', 'python3', 'py', 'py3'].includes(raw)) return 'solution.py';
  if (['javascript', 'js', 'node', 'nodejs'].includes(raw)) return 'solution.js';
  if (['java'].includes(raw)) return 'Main.java';
  if (['cpp', 'c++'].includes(raw)) return 'solution.cpp';
  if (['sql', 'sqlite', 'sqlite3'].includes(raw)) return 'solution.sql';
  return 'solution.txt';
};

const getCommand = (language, filename) => {
  const raw = (language || '').toLowerCase().trim();
  if (['python', 'python3', 'py', 'py3'].includes(raw)) {
    return { cmd: 'python3', args: [filename] };
  }
  if (['javascript', 'js', 'node', 'nodejs'].includes(raw)) {
    return { cmd: 'node', args: [filename] };
  }
  if (['java'].includes(raw)) {
    return { cmd: 'java', args: [filename] };
  }
  return { cmd: 'node', args: [filename] };
};

// Run using Vercel Sandbox Firecracker microVMs
const runVercelSandbox = async (language, code, stdin = '') => {
  if (!Sandbox) {
    throw new Error('Vercel Sandbox module not loaded');
  }

  const filename = getFilename(language);
  const { cmd, args } = getCommand(language, filename);

  // Choose the right runtime for the language
  const raw = (language || '').toLowerCase().trim();
  const isPython = ['python', 'python3', 'py', 'py3'].includes(raw);
  const runtime = isPython ? 'python3.13' : 'node24';

  console.log(`Creating Vercel Sandbox with runtime: ${runtime}`);
  const sandbox = await Sandbox.create({
    runtime,
    timeout: 30000, // 30 second sandbox timeout
  });

  try {
    // Write the user's code to a file in the sandbox
    await sandbox.writeFiles([
      { path: `/vercel/sandbox/${filename}`, content: code }
    ]);

    // If there's stdin, write it to a file and pipe it via shell
    let result;
    if (stdin && stdin.trim()) {
      await sandbox.writeFiles([
        { path: '/vercel/sandbox/stdin.txt', content: stdin }
      ]);
      // Use shell to pipe stdin
      result = await sandbox.runCommand('sh', ['-c', `cat /vercel/sandbox/stdin.txt | ${cmd} ${args.join(' ')}`], {
        timeoutMs: 10000,
      });
    } else {
      result = await sandbox.runCommand(cmd, [`/vercel/sandbox/${filename}`], {
        timeoutMs: 10000,
      });
    }

    return {
      run: {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        code: result.exitCode ?? 0,
        time: 0,
        output: (result.stdout || '') + (result.stderr || '')
      }
    };
  } finally {
    try {
      await sandbox.stop();
    } catch (e) {
      console.error('Error stopping Vercel sandbox:', e);
    }
  }
};

// Local subprocess execution fallback (runs on the local development machine or container temp dir)
const runLocalSubprocess = async (language, code, stdin = '') => {
  const tempDir = os.tmpdir();
  const isJS = language === 'javascript' || language === 'js' || language === 'node';
  const ext = isJS ? 'js' : 'py';
  const filename = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const filePath = path.join(tempDir, filename);

  await fs.promises.writeFile(filePath, code, 'utf8');

  return new Promise((resolve) => {
    let command = '';
    let args = [];

    if (isJS) {
      command = 'node';
      args = [filePath];
    } else {
      command = process.platform === 'win32' ? 'python' : 'python3';
      args = [filePath];
    }

    let stdout = '';
    let stderr = '';
    const startTime = Date.now();
    let processInstance;

    try {
      processInstance = spawn(command, args);
    } catch (err) {
      fs.promises.unlink(filePath).catch(() => {});
      resolve({
        run: {
          stdout: '',
          stderr: `Execution error: ${err.message}`,
          code: -1,
          time: 0,
          output: `Execution error: ${err.message}`
        }
      });
      return;
    }

    processInstance.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    processInstance.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    processInstance.on('close', async (exitCode) => {
      const duration = (Date.now() - startTime) / 1000;
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
      resolve({
        run: {
          stdout,
          stderr,
          code: exitCode,
          time: duration,
          output: stdout + stderr
        }
      });
    });

    processInstance.on('error', async (err) => {
      const duration = (Date.now() - startTime) / 1000;
      
      if (err.code === 'ENOENT' && command === 'python') {
        const fallbackCommand = 'py';
        let fallbackProcess;
        try {
          fallbackProcess = spawn(fallbackCommand, args);
        } catch (fErr) {
          try {
            await fs.promises.unlink(filePath);
          } catch (e) {}
          resolve({
            run: {
              stdout: '',
              stderr: `Execution error: Python runner not found. (${fErr.message})`,
              code: -1,
              time: 0,
              output: `Execution error: Python runner not found. (${fErr.message})`
            }
          });
          return;
        }

        let fStdout = '';
        let fStderr = '';

        fallbackProcess.stdout.on('data', (data) => { fStdout += data.toString(); });
        fallbackProcess.stderr.on('data', (data) => { fStderr += data.toString(); });

        fallbackProcess.on('close', async (fCode) => {
          const fDuration = (Date.now() - startTime) / 1000;
          try {
            await fs.promises.unlink(filePath);
          } catch (e) {}
          resolve({
            run: {
              stdout: fStdout,
              stderr: fStderr,
              code: fCode,
              time: fDuration,
              output: fStdout + fStderr
            }
          });
        });

        fallbackProcess.on('error', async (fErr) => {
          try {
            await fs.promises.unlink(filePath);
          } catch (e) {}
          resolve({
            run: {
              stdout: '',
              stderr: `Execution error: Python runner not found. (${fErr.message})`,
              code: -1,
              time: 0,
              output: `Execution error: Python runner not found. (${fErr.message})`
            }
          });
        });

        if (fallbackProcess.stdin) {
          fallbackProcess.stdin.write(stdin);
          fallbackProcess.stdin.end();
        }
      } else {
        try {
          await fs.promises.unlink(filePath);
        } catch (e) {}
        resolve({
          run: {
            stdout: '',
            stderr: `Execution error: ${err.message}`,
            code: -1,
            time: duration,
            output: `Execution error: ${err.message}`
          }
        });
      }
    });

    if (processInstance.stdin) {
      processInstance.stdin.write(stdin);
      processInstance.stdin.end();
    }
  });
};

export const executeCodeLocally = async (language, code, stdin = '') => {
  const isVercel = !!process.env.VERCEL;
  const hasToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN || process.env.VERCEL_OIDC_TOKEN;

  // On Vercel: try @vercel/sandbox, and if it fails, THROW so the caller can try Piston
  // (local subprocess won't work on Vercel — no Python/Java installed)
  if (isVercel || hasToken) {
    if (Sandbox) {
      console.log('Running code execution in Vercel Sandbox Firecracker microVM...');
      return await runVercelSandbox(language, code, stdin);
      // If runVercelSandbox throws, it propagates up to the caller (index.js)
      // which will then try the Piston API as a fallback
    }
    // Sandbox module not loaded on Vercel — throw so caller tries Piston
    throw new Error('Vercel Sandbox module not available; cannot run code locally on Vercel.');
  }

  // Local development: use subprocess (Python/Node are installed on the dev machine)
  return await runLocalSubprocess(language, code, stdin);
};
