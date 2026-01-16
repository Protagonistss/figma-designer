export const STYLES = `
<style>
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    padding: 16px; 
    margin: 0;
    background: #ffffff;
  }
  .input-group { 
    margin-bottom: 16px; 
  }
  label { 
    display: block; 
    margin-bottom: 6px; 
    font-weight: 500;
    font-size: 12px;
    color: #333;
  }
  input { 
    width: 100%; 
    padding: 8px; 
    border: 1px solid #ddd; 
    border-radius: 4px; 
    font-size: 12px;
    box-sizing: border-box;
  }
  input:focus {
    outline: none;
    border-color: #18a0fb;
  }
  button { 
    width: 100%;
    padding: 10px 16px; 
    background: #18a0fb; 
    color: white; 
    border: none; 
    border-radius: 4px; 
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }
  button:hover:not(:disabled) {
    background: #1592e6;
  }
  button:disabled { 
    background: #ccc; 
    cursor: not-allowed;
  }
  .result { 
    margin-top: 16px; 
    padding: 12px; 
    background: #f5f5f5; 
    border-radius: 4px; 
    white-space: pre-wrap;
    font-size: 11px;
    font-family: 'Monaco', 'Menlo', monospace;
    max-height: 300px;
    overflow-y: auto;
    display: none;
  }
  .error { 
    color: #e53935; 
    background: #ffebee;
  }
  .loading { 
    color: #666; 
  }
  .success {
    color: #2e7d32;
    background: #e8f5e9;
  }
  .status {
    margin-top: 8px;
    font-size: 11px;
    color: #666;
  }
</style>
`;
