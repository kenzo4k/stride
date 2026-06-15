import { executeCodeLocally } from './services/localRunner.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  process.env.VERCEL = '1';
  console.log("ENV VERCEL_TOKEN:", process.env.VERCEL_TOKEN);
  console.log("ENV VERCEL_API_TOKEN:", process.env.VERCEL_API_TOKEN);
  console.log("ENV VERCEL_OIDC_TOKEN:", process.env.VERCEL_OIDC_TOKEN);
  console.log("ENV VERCEL:", process.env.VERCEL);

  try {
    const res = await executeCodeLocally('python3', 'print("hello world")');
    console.log("SUCCESS RESULT:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("CRITICAL RUNNER ERROR:", err);
  }
}

run();
