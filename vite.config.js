import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sathiApiPlugin } from './server/sathiApi.js';

export default defineConfig(({ mode }) => {
  // Load .env into process.env for the Gemini middleware (server-only keys)
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;

  return {
    plugins: [react(), sathiApiPlugin()],
    server: {
      port: 5173,
      open: false,
    },
  };
});
