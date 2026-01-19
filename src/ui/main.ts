// 读取 HTML 文件内容（在构建时会被替换为实际 HTML 字符串）
// 注意：Figma 插件需要使用字符串形式的 HTML，不能直接读取文件

export const UI_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg: #ffffff;
      --bg-secondary: #f3f4f6;
      --text: #1f2937;
      --text-secondary: #6b7280;
      --border: #e5e7eb;
      --success: #10b981;
      --error: #ef4444;
      --code-bg: #111827;
      --code-text: #e5e7eb;
    }
    
    * { box-sizing: border-box; }
    
    html, body { 
      height: 100%;
      overflow: hidden; 
    }

    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      padding: 12px;
      padding-bottom: 0; /* 底部无内边距 */
      margin: 0;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
    }
    
    /* 头部区域固定 */
    .header-section {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
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
      margin-top: 8px;
      padding: 8px 12px;
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
      font-size: 13px;
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
      margin-top: 12px;
      margin-bottom: 8px; /* 底部留白 */
      min-height: 150px;  /* 保证最小高度 */
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
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 24px; /* 固定高度 */
      padding: 0 8px;
      margin-left: 8px;
      font-size: 11px;
      color: var(--primary);
      background: rgba(37, 99, 235, 0.1);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      white-space: nowrap;
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
      overflow: hidden;
      position: relative;
    }

    /* 使用 ID 选择器强制样式 */
    #metadata, #nodeTree, #inference {
      display: none;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      height: 100%;
      min-height: 0;
      border-radius: 0 0 8px 8px;
    }
    
    #metadata.active, #nodeTree.active, #inference.active {
      display: flex !important;
    }
    
    /* 还原为普通 Textarea 样式 */
    .code-textarea {
      flex: 1;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 16px;
      padding-top: 32px;
      background-color: #111827;
      color: #e5e7eb;
      border: none;
      resize: none;
      font-family: 'JetBrains Mono', 'Fira Code', 'Menlo', monospace;
      font-size: 12px;
      line-height: 1.6;
      outline: none;
      display: block;
    }
    
    .code-textarea::selection {
      background: rgba(37, 99, 235, 0.3);
    }
    
    /* 自定义滚动条样式 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
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
    
    /* 分析模式选择器 */
    .mode-selector {
      display: flex;
      gap: 2px;
      padding: 3px;
      background: var(--bg-secondary);
      border-radius: 6px;
      margin-bottom: 12px;
    }
    
    .mode-option {
      flex: 1;
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    
    .mode-option:hover {
      color: var(--text);
    }
    
    .mode-option.active {
      background: white;
      color: var(--primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* 主内容区 - 双栏布局 */
    .main-content {
      flex: 1;
      display: flex;
      gap: 12px;
      overflow: hidden;
      margin-top: 12px;
      margin-bottom: 0; /* 底部无外边距 */
      padding-bottom: 12px; /* 给一点底部内边距，保持视觉平衡，但必须在容器内 */
    }
    
    /* 左侧：预览区 */
    .left-panel {
      width: 200px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      gap: 8px;
    }
    
    /* 右侧：数据区 */
    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0; /* 防止溢出 */
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    
    /* 截图预览区 - 适配侧边栏 */
    .screenshot-preview {
      padding: 6px;
      background: var(--bg-secondary);
      border-radius: 6px;
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
    }
    
    .screenshot-preview img {
      width: 100%;
      border-radius: 4px;
      max-height: 200px;
      object-fit: contain;
      background: #000;
      display: block;
    }
    
    .screenshot-info {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      font-size: 9px;
      color: var(--text-secondary);
    }
    
    /* Tab 容器 - 填满右侧面板 */
    #tabsContainer {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: none;
      border-radius: 0;
      margin: 0;
      min-height: 0;
    }
    
    /* 模型选择器 */
    .model-selector-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .select-label {
      font-size: 12px;
      color: var(--text-secondary);
      white-space: nowrap;
    }
    
    .model-select {
      flex: 1;
      padding: 6px 8px;
      font-size: 12px;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--bg-secondary);
      color: var(--text);
      cursor: pointer;
    }
    
    .model-select:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* JSON Tree Viewer 样式 */
    .json-tree {
      font-family: 'JetBrains Mono', 'Fira Code', 'Menlo', monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #e5e7eb;
      padding: 16px;
      overflow: auto;
      height: 100%;
    }
    
    .json-node {
      margin-left: 14px;
    }
    
    .json-key {
      color: #9cdcfe;
      margin-right: 4px;
    }
    
    .json-string { color: #ce9178; }
    .json-number { color: #b5cea8; }
    .json-boolean { color: #569cd6; }
    .json-null { color: #569cd6; }
    
    .json-toggle {
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-right: 4px;
      cursor: pointer;
      position: relative;
      color: #c586c0;
    }
    
    .json-toggle::before {
      content: '▼';
      font-size: 8px;
      position: absolute;
      top: 1px;
      left: 0;
      transition: transform 0.1s;
    }
    
    .json-toggle.collapsed::before {
      transform: rotate(-90deg);
    }
    
    .json-children {
      display: block;
    }
    
    .json-children.collapsed {
      display: none;
    }
    
    .json-placeholder {
      color: #808080;
      font-style: italic;
      cursor: pointer;
      display: none;
    }
    
    .json-children.collapsed + .json-placeholder {
      display: inline;
    }
  </style>
</head>
<body>
  <div class="header-section">
    <div class="input-wrapper">
      <input type="password" id="apiKey" placeholder="请输入 OpenAI API Key (sk-...)" />
    </div>
    
    <!-- 模型选择器 -->
    <div class="model-selector-wrapper">
      <label for="modelSelect" class="select-label">模型</label>
      <select id="modelSelect" class="model-select">
        <!-- Options will be populated dynamically -->
      </select>
    </div>
    
    <!-- 分析模式选择器 -->
    <div class="mode-selector" id="modeSelector">
      <button class="mode-option active" data-mode="structure-only">仅结构</button>
      <button class="mode-option" data-mode="hybrid">混合模式</button>
      <button class="mode-option" data-mode="visual-only">仅截图</button>
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
  </div>
    
    <div class="main-content">
      <!-- 左侧面板：预览与辅助信息 -->
      <div class="left-panel">
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
        
        <!-- 截图预览区 -->
        <div id="screenshotPreview" class="screenshot-preview" style="display: none;">
          <img id="screenshotImg" src="" alt="Screenshot" />
          <div class="screenshot-info">
            <span id="screenshotSize">0 KB</span>
            <span id="screenshotMode">混合模式</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧面板：数据与结果 -->
      <div class="right-panel">
        <!-- Tab 容器 -->
          <div class="tabs-header">
            <div class="tab-group">
              <button class="tab active" data-tab="metadata">Metadata</button>
              <button class="tab" data-tab="nodeTree">Node Tree</button>
              <button class="tab" data-tab="inference" id="inferenceTab" style="display: none;">Inference</button>
            </div>
            <button id="downloadBtn" class="btn-download-mini" title="下载元数据 JSON">
              <span>JSON</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8.5L2.5 5H4.5V1.5H7.5V5H9.5L6 8.5Z" fill="currentColor"/>
                <path d="M2.5 9.5H9.5V10.5H2.5V9.5Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          
          <div id="metadata" class="tab-content active">
            <button class="btn-copy" data-target="metadataJsonHidden">复制</button>
            <div id="metadataViewer" class="json-tree">System Ready.</div>
            <textarea id="metadataJsonHidden" style="display:none"></textarea>
          </div>
          <div id="nodeTree" class="tab-content">
            <button class="btn-copy" data-target="nodeTreeJsonHidden">复制</button>
            <div id="nodeTreeViewer" class="json-tree">Waiting for Node Tree...</div>
            <textarea id="nodeTreeJsonHidden" style="display:none"></textarea>
          </div>
          <div id="inference" class="tab-content">
            <button class="btn-copy" data-target="inferenceContentRaw">复制</button>
            <pre id="inferenceJson" style="display: none;"></pre> <!-- 保留 pre 用于 markdown 渲染结果? 不，结果通常也是 JSON -->
            <textarea id="inferenceContentRaw" class="code-textarea" readonly></textarea>
            <div id="inferenceContentRendered" class="result-content markdown-body" style="display:none; padding: 16px;"></div>
          </div>
        </div>
      </div>
  
  <!-- 底部操作栏 -->


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
    // const footerActions = document.getElementById('footerActions'); // Removed
    // Elements for Metadata
    const metadataViewer = document.getElementById('metadataViewer');
    const metadataJsonHidden = document.getElementById('metadataJsonHidden');
    
    // Elements for Node Tree
    const nodeTreeViewer = document.getElementById('nodeTreeViewer');
    const nodeTreeJsonHidden = document.getElementById('nodeTreeJsonHidden');
    
    const inferenceTab = document.getElementById('inferenceTab');
    const inferenceJson = document.getElementById('inferenceJson');
    const nodeCountEl = document.getElementById('nodeCount');
    const columnCountEl = document.getElementById('columnCount');
    const fieldCountEl = document.getElementById('fieldCount');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let currentMetadata = null;
    let currentNodeTree = null;
    let currentInference = null;
    let currentScreenshot = null;
    let currentMode = 'structure-only';
    
    // 截图预览元素
    const screenshotPreview = document.getElementById('screenshotPreview');
    const screenshotImg = document.getElementById('screenshotImg');
    const screenshotSize = document.getElementById('screenshotSize');
    const screenshotModeEl = document.getElementById('screenshotMode');
    
    // 模式选择器逻辑
    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        console.log('[UI] Mode changed:', currentMode);
        
        // 如果选择了混合/视觉模式，自动切换到视觉模型
        const modelSelect = document.getElementById('modelSelect');
        if (currentMode !== 'structure-only' && modelSelect) {
          modelSelect.value = 'GLM-4.6V-Flash';
          appConfig.model = 'GLM-4.6V-Flash';
        }
      });
    });
    
    // 模型选择器逻辑
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        appConfig.model = e.target.value;
        console.log('[UI] Model changed:', appConfig.model);
        
        // 更新状态栏显示
        const modelInfo = document.getElementById('modelInfo');
        if (modelInfo) {
          modelInfo.textContent = appConfig.model;
        }
      });
    }
    
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
    // 绑定复制按钮事件
    document.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          // 优先读取 value (textarea/input), 否则读取 textContent
          const content = targetEl.value || targetEl.textContent;
          if (content) {
            copyToClipboard(content, btn);
          }
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
        
        // 同步模型选择器
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
          // 清空现有选项
          modelSelect.innerHTML = '';
          
          // 获取可用模型列表 (优先使用配置中的列表)
          const models = msg.payload.availableModels || [
            { value: 'glm-4-flash', label: 'GLM-4-Flash (快速)' } // Fallback
          ];
          
          // 填充选项
          models.forEach(m => {
            const option = document.createElement('option');
            option.value = m.value;
            option.textContent = m.label;
            modelSelect.appendChild(option);
          });

          // 选中当前模型
          if (appConfig.model) {
            // 检查配置的模型是否在列表中
            const found = models.find(m => m.value === appConfig.model);
            if (found) {
              modelSelect.value = appConfig.model;
            } else {
              // 如果配置的模型不在列表中，添加一个临时选项并选中
              const newOption = document.createElement('option');
              newOption.value = appConfig.model;
              newOption.textContent = appConfig.model + ' (Configured)';
              modelSelect.appendChild(newOption);
              modelSelect.value = appConfig.model;
            }
          }
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
          
          const result = await callOpenAI(msg.prompt, msg.screenshot);
          
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
        currentScreenshot = msg.payload.screenshot || null;
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
        
        // 显示截图预览
        if (currentScreenshot) {
          screenshotImg.src = currentScreenshot;
          const sizeKB = Math.round((currentScreenshot.length * 3) / 4 / 1024);
          screenshotSize.textContent = sizeKB + ' KB';
          screenshotModeEl.textContent = currentMode === 'hybrid' ? '混合模式' : '仅截图';
          screenshotPreview.style.display = 'block';
        } else {
          screenshotPreview.style.display = 'none';
        }
        
        if (msg.payload.metadata) {
          const jsonStr = JSON.stringify(msg.payload.metadata, null, 2);
          if (metadataJsonHidden) {
            metadataJsonHidden.value = jsonStr; 
          }
          if (metadataViewer) {
             renderJson(msg.payload.metadata, metadataViewer);
          }
        } else {
          if (metadataViewer) metadataViewer.innerText = '// Error: No metadata received';
        }
        
        if (msg.payload.nodeTree) {
          const nodeTreeStr = JSON.stringify(msg.payload.nodeTree, null, 2);
          if (nodeTreeJsonHidden) {
             nodeTreeJsonHidden.value = nodeTreeStr;
          }
          if (nodeTreeViewer) {
            renderJson(msg.payload.nodeTree, nodeTreeViewer);
          }
        } else {
           if (nodeTreeViewer) nodeTreeViewer.innerText = '// Error: No node tree';
        }
        
        if (document.getElementById('inferenceContentRaw')) {
            document.getElementById('inferenceContentRaw').value = '';
        }
        if (inferenceTab) {
          inferenceTab.style.display = 'none';
        }
        
        // tabsContainer.style.display = 'flex'; // 保持 header 显示，只切换内容? 不，整个 container 隐显
        if (tabsContainer) tabsContainer.style.display = 'flex';
        // footerActions.style.display = 'block'; // 已移除
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
        
        const jsonStr = JSON.stringify(currentInference, null, 2);
        
        // 更新隐形 pre 用于其他可能的逻辑（或者移除它，但为了安全起见先保留并同步）
        if (inferenceJson) inferenceJson.textContent = jsonStr;
        
        // 关键：更新显示的 Textarea
        const inferenceTextarea = document.getElementById('inferenceContentRaw');
        if (inferenceTextarea) {
            inferenceTextarea.value = jsonStr;
        }

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
    
    async function callOpenAI(systemPrompt, screenshot) {
      // 优先使用 appConfig 配置，否则使用输入框中的值
      const apiKey = appConfig.apiKey || apiKeyInput.value.trim();
      if (!apiKey) {
        throw new Error('请配置 API Key');
      }
      
      if (!appConfig.apiBaseUrl) {
        throw new Error('API 地址未配置');
      }
      
      // 构建消息内容（支持多模态）
      // 智谱 GLM API 格式：content 数组包含 text 和 image_url
      let messages = [];
      
      if (screenshot) {
        // Vision API: GLM 格式 - 图片和文本在同一个 content 数组中
        console.log('[UI] Using Vision API with screenshot');
        messages.push({
          role: 'user',
          content: [
            { 
              type: 'image_url', 
              image_url: { 
                url: screenshot  // GLM 支持 base64 data URL
              } 
            },
            { 
              type: 'text', 
              text: systemPrompt 
            }
          ]
        });
      } else {
        // 纯文本模式
        messages.push({ role: 'user', content: systemPrompt });
      }
      
      console.log('[UI] Calling AI API...', { url: appConfig.apiBaseUrl, model: appConfig.model, hasScreenshot: !!screenshot });
      
      // 如果有截图，自动切换到 Vision 模型
      // glm-4.7 不支持图片，需要使用 glm-4v-flash
      let modelToUse = appConfig.model;
      if (screenshot) {
        // 检查当前模型是否支持 Vision
        const visionModels = ['GLM-4.6V-Flash'];
        const isVisionModel = visionModels.some(v => appConfig.model.toLowerCase().includes(v.toLowerCase()));
        
        if (!isVisionModel) {
          modelToUse = 'GLM-4.6V-Flash';  // 自动切换到 Vision 模型
          console.log('[UI] Auto-switching to Vision model:', modelToUse);
        }
      }
      
      const response = await fetch(appConfig.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: messages,
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
    
    // JSON 渲染工具
    function renderJson(data, container) {
      if (!data) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = '';
      container.appendChild(createJsonNode(data));
    }

    function createJsonNode(data) {
      if (data === null) return createSpan('null', 'json-null');
      if (typeof data === 'boolean') return createSpan(data, 'json-boolean');
      if (typeof data === 'number') return createSpan(data, 'json-number');
      if (typeof data === 'string') return createSpan('"' + data + '"', 'json-string');

      if (Array.isArray(data)) {
        if (data.length === 0) return createSpan('[]', '');
        return createCollapsible(data, '[', ']');
      }

      if (typeof data === 'object') {
        if (Object.keys(data).length === 0) return createSpan('{}', '');
        return createCollapsible(data, '{', '}');
      }
      
      return createSpan(String(data), '');
    }

    function createSpan(text, className) {
      const span = document.createElement('span');
      span.textContent = text;
      if (className) span.className = className;
      return span;
    }

    function createCollapsible(data, openChar, closeChar) {
      const fragment = document.createDocumentFragment();
      const toggle = document.createElement('span');
      toggle.className = 'json-toggle';
      toggle.onclick = (e) => {
        const t = e.target;
        t.classList.toggle('collapsed');
        const children = t.nextElementSibling; // Skip text node (brace), go to div
        if (children) children.classList.toggle('collapsed');
      };
      fragment.appendChild(toggle);

      fragment.appendChild(document.createTextNode(openChar));

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'json-children';

      const isArray = Array.isArray(data);
      const keys = Object.keys(data);
      keys.forEach((key, index) => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'json-node';
        
        if (!isArray) {
          const keySpan = document.createElement('span');
          keySpan.className = 'json-key';
          keySpan.textContent = '"' + key + '":';
          nodeDiv.appendChild(keySpan);
        }

        nodeDiv.appendChild(createJsonNode(data[key]));
        
        if (index < keys.length - 1) {
          nodeDiv.appendChild(document.createTextNode(','));
        }
        
        childrenContainer.appendChild(nodeDiv);
      });

      fragment.appendChild(childrenContainer);
      
      const placeholder = document.createElement('span');
      placeholder.className = 'json-placeholder';
      placeholder.textContent = '...';
      placeholder.onclick = (e) => {
        // 点击 ... 也能展开
        const p = e.target;
        const children = p.previousElementSibling;
        const t = children.previousElementSibling; 
        children.classList.remove('collapsed');
        t.classList.remove('collapsed');
      };
      
      fragment.appendChild(placeholder);
      fragment.appendChild(document.createTextNode(closeChar));

      return fragment;
    }

    // 提取按钮点击
    extractBtn.onclick = () => {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'start-extract',
          mode: currentMode
        } 
      }, '*');
      extractBtn.disabled = true;
      extractBtn.innerHTML = '<span>提取中...</span>';
      inferBtn.disabled = true;
      updateStatus('loading', '正在提取设计稿数据...');
      tabsContainer.style.display = 'none';
      if(typeof footerActions !== 'undefined') footerActions.style.display = 'none'; // Safety check
      statsDiv.style.display = 'none';
      screenshotPreview.style.display = 'none';
    };

    // 推断按钮点击
    inferBtn.onclick = () => {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'start-inference',
          mode: currentMode,
          hasScreenshot: !!currentScreenshot
        } 
      }, '*');
      inferBtn.disabled = true;
      inferBtn.innerHTML = '<span>推断中...</span>';
      updateStatus('loading', '正在推断页面结构...');
    };
  </script>
</body>
</html>
`;
