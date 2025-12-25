export const UI_HTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Inter, sans-serif; padding: 16px; text-align: center; color: #333; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; box-sizing: border-box; overflow: hidden; }
    h2 { margin-top: 0; font-size: 16px; margin-bottom: 12px; font-weight: 600; }
    .btn-group { width: 100%; display: flex; flex-direction: column; gap: 8px; }
    button {
      background-color: #18A0FB;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      width: 100%;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    button.secondary {
      background-color: white;
      color: #333;
      border: 1px solid #e5e5e5;
    }
    button.secondary:hover { background-color: #f5f5f5; }
    button:hover { opacity: 0.9; }
    #status { margin-top: 12px; font-size: 11px; color: #888; min-height: 1.5em; }
  </style>
</head>
<body>
  <h2>解析完成</h2>
  <div class="btn-group">
    <button id="downloadBtn">下载 meta.json</button>
    <button id="copyBtn" class="secondary">复制 JSON</button>
    <button id="closeBtn" class="secondary">关闭</button>
  </div>
  <div id="status">准备就绪</div>

  <script>
    let jsonData = null;

    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (msg.type === 'meta-data') {
        jsonData = msg.payload;
        document.getElementById('status').textContent = '数据已生成，请导出';
      }
    };

    document.getElementById('downloadBtn').onclick = () => {
      if (!jsonData) return;
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "meta.json";
      a.click();
      URL.revokeObjectURL(url);
      document.getElementById('status').textContent = '已下载 meta.json';
    };

    document.getElementById('copyBtn').onclick = () => {
      if (!jsonData) return;
      const text = JSON.stringify(jsonData, null, 2);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.getElementById('status').textContent = '已复制到剪贴板';
      } catch (err) {
        document.getElementById('status').textContent = '复制失败';
      }
      document.body.removeChild(textArea);
    };

    document.getElementById('closeBtn').onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
    };
  </script>
</body>
</html>
`;
