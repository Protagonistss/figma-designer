import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const env: Record<string, string> = {
    'process.env.API_KEY': '""',
    'process.env.API_BASE_URL': '""',
    'process.env.MODEL': '""',
    'process.env.BACKEND_URL': '""',
    'process.env.CHAT_URL': '""'
  };
  
  try {
    // 从项目根目录加载 .env 文件
    const envPath = path.resolve(__dirname, '../../.env');
    console.log('[tsup] Loading .env from:', envPath);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line, index) => {
        // 移除行尾的 \r (Windows 换行符)
        line = line.replace(/\r$/, '');
        // 跳过空行和注释
        if (!line.trim() || line.trim().startsWith('#')) {
          return;
        }
        
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // 移除值两端的引号（单引号或双引号）
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          if (key) {
            env[`process.env.${key}`] = JSON.stringify(value);
            console.log(`[tsup] Loaded ${key}: ${value ? `${value.substring(0, 10)}...` : '(empty)'}`);
          }
        } else {
          console.warn(`[tsup] Skipping invalid line ${index + 1}: ${line}`);
        }
      });
    } else {
      console.warn('[tsup] .env file not found at:', envPath);
    }
  } catch (e) {
    console.warn('[tsup] Failed to load .env file:', e);
  }
  
  console.log('[tsup] Final env values:', {
    'process.env.API_KEY': env['process.env.API_KEY'] !== '""' ? '(set)' : '(empty)',
    'process.env.API_BASE_URL': env['process.env.API_BASE_URL'] !== '""' ? '(set)' : '(empty)',
    'process.env.MODEL': env['process.env.MODEL'] !== '""' ? '(set)' : '(empty)',
    'process.env.BACKEND_URL': env['process.env.BACKEND_URL'] !== '""' ? '(set)' : '(empty)',
    'process.env.CHAT_URL': env['process.env.CHAT_URL'] !== '""' ? '(set)' : '(empty)'
  });
  
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
