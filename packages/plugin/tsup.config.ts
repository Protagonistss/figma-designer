import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const env: Record<string, string> = {
    'process.env.API_KEY': '""',
    'process.env.API_BASE_URL': '""',
    'process.env.MODEL': '""'
  };
  
  try {
    // 从项目根目录加载 .env 文件
    const envPath = path.resolve(__dirname, '../../.env');
    console.log('[tsup] Loading .env from:', envPath);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && !key.startsWith('#')) {
            env[`process.env.${key}`] = JSON.stringify(value);
          }
        }
      });
    }
  } catch (e) {
    console.warn('Failed to load .env file', e);
  }
  return env;
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['iife'],
  clean: false,
  splitting: false,
  sourcemap: true,
  define: loadEnv(),
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.md': 'text',
      '.html': 'text'
    };
  }
});
