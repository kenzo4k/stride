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

  const sandbox = await Sandbox.create();
  try {
    await sandbox.writeFile(filename, code);

    const result = await sandbox.runCommand({
      cmd,
      args,
      stdin,
      timeout: 5000,
      stdout: 'pipe',
      stderr: 'pipe',
    });

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
      await sandbox.destroy();
    } catch (e) {
      console.error('Error destroying Vercel sandbox:', e);
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

    const processInstance = spawn(command, args);
    let stdout = '';
    let stderr = '';
    const startTime = Date.now();

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
        const fallbackProcess = spawn(fallbackCommand, args);
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
  const hasToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  if (Sandbox && (process.env.VERCEL || hasToken)) {
    try {
      console.log('Running code execution in Vercel Sandbox Firecracker microVM...');
      return await runVercelSandbox(language, code, stdin);
    } catch (e) {
      console.warn('Vercel Sandbox execution failed, falling back to local runner:', e.message);
      return await runLocalSubprocess(language, code, stdin);
    }
  }

  // Otherwise, default to local subprocess execution
  return await runLocalSubprocess(language, code, stdin);
};
