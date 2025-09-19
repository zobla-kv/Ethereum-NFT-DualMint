import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, `src/env/.${process.env.ENV}.env`),
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, '../server/public'),
    emptyOutDir: true,
  },
});
