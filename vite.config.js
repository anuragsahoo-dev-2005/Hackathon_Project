import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sathiApiPlugin } from './server/sathiApi.js';

export default defineConfig(({ mode }) => {
  // Load server-only provider keys without exposing them through Vite client env.
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL;
  if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY;
  if (env.GROQ_MODEL) process.env.GROQ_MODEL = env.GROQ_MODEL;
  if (env.GROQ_STT_MODEL) process.env.GROQ_STT_MODEL = env.GROQ_STT_MODEL;
  if (env.GROQ_TTS_MODEL) process.env.GROQ_TTS_MODEL = env.GROQ_TTS_MODEL;
  if (env.GROQ_TTS_VOICE) process.env.GROQ_TTS_VOICE = env.GROQ_TTS_VOICE;
  if (env.GROQ_VISION_MODEL) process.env.GROQ_VISION_MODEL = env.GROQ_VISION_MODEL;

  return {
    plugins: [react(), sathiApiPlugin()],
    server: {
      port: 5173,
      open: false,
    },
  };
});
