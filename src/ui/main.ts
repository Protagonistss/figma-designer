// 读取 HTML 文件内容（在构建时会被替换为实际 HTML 字符串）
// 注意：Figma 插件需要使用字符串形式的 HTML，不能直接读取文件

export const UI_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    :root {
      --primary: #18a0fb;
      --primary-hover: #1592e6;
      --bg: #ffffff;
      --bg-secondary: #f8f9fa;
      --text: #333333;
      --text-secondary: #666666;
      --border: #e0e0e0;
      --success: #10b981;
      --error: #ef4444;
      --code-bg: #1e1e1e;
      --code-text: #d4d4d4;
    }
    
    :root {
      --primary: #2563eb; /* 更深邃的蓝 */
      --primary-hover: #1d4ed8;
      --bg: #ffffff;
      --bg-secondary: #f3f4f6;
      --text: #1f2937;
      --text-secondary: #6b7280;
      --border: #e5e7eb;
      --success: #10b981;
      --error: #ef4444;
      --code-bg: #111827; /* 近似黑色 */
      --code-text: #e5e7eb;
    }
    
    * { box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      padding: 16px; 
      margin: 0;
      background: var(--bg);
      color: var(--text);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden; /* 禁止 Body 滚动 */
    }
    
    /* 头部区域固定 */
    .header-section {
      flex-shrink: 0;
    }
    
    /* 输入框 */
    .input-wrapper {
      position: relative;
      margin-bottom: 12px;
    }
    
    input { 
      width: 100%; 
      padding: 10px 12px; 
      padding-right: 36px;
      border: 1px solid var(--border); 
      border-radius: 6px; 
      font-size: 13px;
      transition: all 0.2s;
      background: var(--bg-secondary);
    }
    
    input:focus {
      outline: none;
      border-color: var(--primary);
      background: #fff;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    }
    
    /* 全局滚动条美化 */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.5);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.8);
    }
    
    /* 主按钮 */
    .btn-primary { 
      width: 100%;
      padding: 10px; 
      background: var(--primary); 
      color: white; 
      border: none; 
      border-radius: 6px; 
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .btn-primary:disabled { 
      background: #9ca3af; 
      cursor: not-allowed;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .btn-secondary {
      width: 100%;
      padding: 10px;
      background: var(--bg);
      color: var(--primary);
      border: 1px solid var(--primary);
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(37, 99, 235, 0.08);
    }

    .btn-secondary:disabled {
      color: #9ca3af;
      border-color: #d1d5db;
      cursor: not-allowed;
    }
    
    /* 状态栏 */
    .status-bar {
      height: 24px;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 8px;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 6px;
      background: #d1d5db;
    }
    .status-dot.loading { background: var(--primary); animation: pulse 1.5s infinite; }
    .status-dot.success { background: var(--success); }
    .status-dot.error { background: var(--error); }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    /* 统计信息 - 紧凑行布局 */
    .stats {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      padding: 10px 16px;
      background: var(--bg-secondary);
      border-radius: 6px;
      border: 1px solid var(--border);
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .stat-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 10px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Tab 容器 - 填满剩余空间 */
    #tabsContainer {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-top: 16px;
      min-height: 0; /* 关键：允许子元素滚动 */
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    
    /*类似于 iOS Segmented Control 的 Tabs，但包含操作区 */
    .tabs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
    }
    
    .tab-group {
      display: flex;
      flex: 1;
      gap: 2px;
    }
    
    .tab {
      flex: 1;
      padding: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border: none;
      background: transparent;
      border-radius: 4px;
      transition: all 0.2s;
      max-width: 100px; /* 限制宽度 */
    }
    
    .tab.active {
      color: var(--text);
      background: white;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      font-weight: 600;
    }
    
    /* 迷你下载按钮 */
    .btn-download-mini {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      margin-left: 8px;
      font-size: 11px;
      color: var(--primary);
      background: rgba(37, 99, 235, 0.1);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    .btn-download-mini:hover {
      background: rgba(37, 99, 235, 0.2);
    }
    
    /* 内容区域 */
    .tab-content {
      display: none;
      flex: 1;
      background: var(--code-bg);
      flex-direction: column;
      overflow: hidden; /* 自身不滚动 */
      position: relative; /* 关键：为绝对定位子元素提供锚点 */
    }
    
    .tab-content.active {
      display: flex; /* 使用 flex 让 pre 填满 */
    }
    
    .tab-content pre {
      flex: 1;
      margin: 0;
      padding: 16px;
      padding-top: 32px; /* 为复制按钮留出空间 */
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 12px;
      font-family: 'JetBrains Mono', 'Fira Code', 'Menlo', monospace;
      line-height: 1.6;
      color: var(--code-text);
      overflow-y: auto; /* 只有这里滚动 */
      -webkit-font-smoothing: antialiased;
    }
    
    /* 复制按钮 */
    .btn-copy {
      position: absolute;
      top: 8px;
      right: 16px; /* 避免遮挡滚动条 */
      padding: 4px 8px;
      font-size: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-secondary);
      border-radius: 4px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: all 0.2s;
      z-index: 10;
    }
    
    .btn-copy:hover {
      background: rgba(255,255,255,0.15);
      color: var(--code-text);
      border-color: rgba(255,255,255,0.2);
    }
    
    .btn-copy:active {
      transform: translateY(1px);
    }
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: none;
    }
    
    /* 底部固定操作栏 */
    .bottom-bar {
      padding: 8px 12px;
      background: var(--bg);
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    
    /* 恢复下载按钮样式 */
    .btn-download {
      width: 100%;
      padding: 8px;
      background: var(--success);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    
    .btn-download:hover {
      background: #059669;
      transform: translateY(-1px);
    }
    
    .btn-download::before {
      content: "↓";
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header-section">
    <div class="input-wrapper">
      <input type="password" id="apiKey" placeholder="请输入 OpenAI API Key (sk-...)" />
    </div>
    <div class="button-group">
      <button class="btn-primary" id="extractBtn">
        <span>提取元数据</span>
      </button>
      <button class="btn-secondary" id="inferBtn" disabled>
        <span>推断结构</span>
      </button>
    </div>
    
    <div class="status-bar">
      <div id="statusDot" class="status-dot"></div>
      <span id="statusText">准备就绪</span>
      <span id="modelInfo" style="margin-left: auto; font-size: 11px; color: var(--text-secondary);"></span>
    </div>
    
    <!-- 统计信息 -->
    <div id="stats" class="stats" style="display: none;">
      <div class="stat-item">
        <span id="nodeCount" class="stat-value">0</span>
        <span class="stat-label">节点数</span>
      </div>
      <div class="stat-item">
        <span id="columnCount" class="stat-value">0</span>
        <span class="stat-label">表格列</span>
      </div>
      <div class="stat-item">
        <span id="fieldCount" class="stat-value">0</span>
        <span class="stat-label">搜索项</span>
      </div>
    </div>
  </div>
  
  <!-- Tab 容器 -->
  <div id="tabsContainer" style="display: none;">
    <div class="tabs">
      <button class="tab active" data-tab="metadata">Metadata</button>
      <button class="tab" data-tab="nodeTree">Node Tree</button>
      <button class="tab" data-tab="inference" id="inferenceTab" style="display: none;">Inference</button>
    </div>
    
    <div id="metadata" class="tab-content active">
      <button class="btn-copy" data-target="metadataJson">复制</button>
      <pre id="metadataJson"></pre>
    </div>
    <div id="nodeTree" class="tab-content">
      <button class="btn-copy" data-target="nodeTreeJson">复制</button>
      <pre id="nodeTreeJson"></pre>
    </div>
    <div id="inference" class="tab-content">
      <button class="btn-copy" data-target="inferenceJson">复制</button>
      <pre id="inferenceJson"></pre>
    </div>
  </div>
  
  <!-- 底部操作栏 -->
  <div id="footerActions" class="bottom-bar" style="display: none;">
    <button class="btn-download" id="downloadBtn">下载元数据 JSON</button>
  </div>

  <script>
    // 配置对象，从主线程接收
    let appConfig = {
      apiKey: '',
      apiBaseUrl: '',
      model: ''
    };
    
    const apiKeyInput = document.getElementById('apiKey');
    const extractBtn = document.getElementById('extractBtn');
    const inferBtn = document.getElementById('inferBtn');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    const statsDiv = document.getElementById('stats');
    const tabsContainer = document.getElementById('tabsContainer');
    const footerActions = document.getElementById('footerActions');
    const metadataJson = document.getElementById('metadataJson');
    const nodeTreeJson = document.getElementById('nodeTreeJson');
    const inferenceTab = document.getElementById('inferenceTab');
    const inferenceJson = document.getElementById('inferenceJson');
    const nodeCountEl = document.getElementById('nodeCount');
    const columnCountEl = document.getElementById('columnCount');
    const fieldCountEl = document.getElementById('fieldCount');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let currentMetadata = null;
    let currentNodeTree = null;
    let currentInference = null;
    
    // 状态更新工具
    function updateStatus(type, text) {
      statusText.textContent = text;
      statusDot.className = 'status-dot ' + type;
    }

    // 复制功能
    function copyToClipboard(text, btn) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        const originalText = btn.textContent;
        btn.textContent = '已复制!';
        btn.style.background = 'var(--success)';
        btn.style.borderColor = 'transparent';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 1500);
      } catch (err) {
        console.error('Copy failed', err);
        updateStatus('error', '复制失败');
      }
      
      document.body.removeChild(textArea);
    }
    
    // 绑定复制按钮事件
    document.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl && targetEl.textContent) {
          copyToClipboard(targetEl.textContent, btn);
        }
      });
    });

    function setActiveTab(tabId) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const targetTab = document.querySelector(\`.tab[data-tab="\${tabId}"]\`);
      const targetContent = document.getElementById(tabId);
      if (targetTab) {
        targetTab.classList.add('active');
      }
      if (targetContent) {
        targetContent.classList.add('active');
      }
    }

    // Tab 切换逻辑
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.dataset.tab) {
          setActiveTab(tab.dataset.tab);
        }
      });
    });
    
    // 下载 JSON
    downloadBtn.onclick = () => {
      if (!currentMetadata) return;
      const blob = new Blob([JSON.stringify(currentMetadata, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'metadata.json';
      a.click();
      URL.revokeObjectURL(url);
    };
    
    // 统计节点数量
    function countNodes(node) {
      let count = 1;
      if (node.children) {
        node.children.forEach(c => count += countNodes(c));
      }
      return count;
    }
    
    // 处理来自主线程的消息
    window.onmessage = async (event) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      
      // 处理配置消息
      if (msg.type === 'config') {
        console.log('[UI] Received config:', msg.payload);
        // 更新完整配置
        if (msg.payload.apiKey) appConfig.apiKey = msg.payload.apiKey;
        if (msg.payload.apiBaseUrl) appConfig.apiBaseUrl = msg.payload.apiBaseUrl;
        if (msg.payload.model) appConfig.model = msg.payload.model;
        
        // 显示当前模型
        const modelInfo = document.getElementById('modelInfo');
        if (modelInfo && appConfig.model) {
          modelInfo.textContent = appConfig.model;
        }
        
        if (msg.payload.apiKey) {
          // 隐藏 API Key 输入框
          const wrapper = document.querySelector('.input-wrapper');
          if (wrapper) {
            wrapper.style.display = 'none';
          }
          updateStatus('success', '已加载本地配置');
        }
        return;
      }
      
      if (msg.type === 'ai-request') {
        try {
          updateStatus('loading', '正在推断...');
          
          const result = await callOpenAI(msg.prompt);
          
          parent.postMessage({
            pluginMessage: {
              type: 'ai-response',
              requestId: msg.requestId,
              result
            }
          }, '*');
          
        } catch (error) {
          parent.postMessage({
            pluginMessage: {
              type: 'ai-response',
              requestId: msg.requestId,
              error: error.message
            }
          }, '*');
          
          updateStatus('error', '推断失败: ' + error.message);
        }
      } else if (msg.type === 'extract-result') {
        currentMetadata = msg.payload.metadata;
        currentNodeTree = msg.payload.nodeTree;
        currentInference = null;
        
        extractBtn.disabled = false;
        extractBtn.innerHTML = '<span>重新提取</span>';
        inferBtn.disabled = false;
        inferBtn.innerHTML = '<span>开始推断</span>';
        updateStatus('success', '元数据提取完成');
        
        const nodeCount = countNodes(msg.payload.metadata);
        nodeCountEl.textContent = nodeCount;
        columnCountEl.textContent = '-';
        fieldCountEl.textContent = '-';
        statsDiv.style.display = 'flex';
        
        metadataJson.textContent = JSON.stringify(msg.payload.metadata, null, 2);
        nodeTreeJson.textContent = JSON.stringify(msg.payload.nodeTree, null, 2);
        inferenceJson.textContent = '';
        if (inferenceTab) {
          inferenceTab.style.display = 'none';
        }
        
        tabsContainer.style.display = 'flex';
        footerActions.style.display = 'block';
        setActiveTab('metadata');
      } else if (msg.type === 'extract-error') {
        extractBtn.disabled = false;
        extractBtn.innerHTML = '<span>提取元数据</span>';
        inferBtn.disabled = true;
        const errorMessage = msg.payload?.message || '提取失败';
        updateStatus('error', '提取失败: ' + errorMessage);
      } else if (msg.type === 'inference-result') {
        currentInference = msg.payload.result;
        
        inferBtn.disabled = false;
        inferBtn.innerHTML = '<span>重新推断</span>';
        updateStatus('success', '推断完成');
        
        inferenceJson.textContent = JSON.stringify(currentInference, null, 2);
        if (inferenceTab) {
          inferenceTab.style.display = 'inline-flex';
        }
        
        const columnCount = currentInference?.table?.columns?.length || 0;
        const fieldCount = currentInference?.search?.fields?.length || 0;
        columnCountEl.textContent = columnCount;
        fieldCountEl.textContent = fieldCount;
        
        setActiveTab('inference');
      } else if (msg.type === 'inference-error') {
        inferBtn.disabled = false;
        inferBtn.innerHTML = '<span>开始推断</span>';
        const errorMessage = msg.payload?.message || '推断失败';
        updateStatus('error', '推断失败: ' + errorMessage);
      }
    };
    
    async function callOpenAI(systemPrompt) {
      // 优先使用 appConfig 配置，否则使用输入框中的值
      const apiKey = appConfig.apiKey || apiKeyInput.value.trim();
      if (!apiKey) {
        throw new Error('请配置 API Key');
      }
      
      if (!appConfig.apiBaseUrl) {
        throw new Error('API 地址未配置');
      }
      
      console.log('[UI] Calling AI API...', { url: appConfig.apiBaseUrl, model: appConfig.model });
      
      const response = await fetch(appConfig.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: appConfig.model,
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.3,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UI] API Error:', errorText);
        throw new Error('API 调用失败: ' + response.status);
      }
      
      const data = await response.json();
      console.log('AI Raw Response:', data);
      
      // glm-4.5-flash 模型可能在 reasoning_content 中返回内容
      const message = data.choices?.[0]?.message;
      const content = message?.content || message?.reasoning_content;
      
      if (!content) {
        throw new Error('AI 返回空内容');
      }
      
      // 解析 JSON
      try {
        const result = JSON.parse(content);
        return result;
      } catch (e) {
        console.log('[UI] Direct parse failed, trying to extract JSON...');
        
        // 尝试提取 JSON
        const startIdx = content.indexOf('{');
        let endIdx = content.lastIndexOf('}');
        
        // 如果没有找到结束的 }，可能是被截断了
        if (startIdx !== -1 && (endIdx === -1 || endIdx <= startIdx)) {
          console.warn('[UI] JSON appears truncated, attempting to fix...');
          // 尝试补全 JSON
          const partialJson = content.substring(startIdx);
          const fixedJson = partialJson + '}}}}'; // 尝试闭合
          try {
            return JSON.parse(fixedJson);
          } catch (e2) {
            console.error('[UI] Could not fix truncated JSON');
          }
        }
        
        if (startIdx !== -1 && endIdx > startIdx) {
          const jsonStr = content.substring(startIdx, endIdx + 1);
          return JSON.parse(jsonStr);
        }
        
        throw new Error('无法解析 AI 响应');
      }
    }
    
    // 提取按钮点击
    extractBtn.onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'start-extract' } }, '*');
      extractBtn.disabled = true;
      extractBtn.innerHTML = '<span>提取中...</span>';
      inferBtn.disabled = true;
      updateStatus('loading', '正在提取设计稿数据...');
      tabsContainer.style.display = 'none';
      footerActions.style.display = 'none';
      statsDiv.style.display = 'none';
    };

    // 推断按钮点击
    inferBtn.onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'start-inference' } }, '*');
      inferBtn.disabled = true;
      inferBtn.innerHTML = '<span>推断中...</span>';
      updateStatus('loading', '正在推断页面结构...');
    };
  </script>
</body>
</html>
`;
