import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const executeCodeLocally = async (language, code, stdin = '') => {
  const tempDir = path.resolve(__dirname, '..', 'temp_runs');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Normalize language name
  const isJS = language === 'javascript' || language === 'js';
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
      
      // Fallback for Windows if python is not in PATH but py is
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
