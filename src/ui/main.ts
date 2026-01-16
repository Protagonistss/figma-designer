// 读取 HTML 文件内容（在构建时会被替换为实际 HTML 字符串）
// 注意：Figma 插件需要使用字符串形式的 HTML，不能直接读取文件

export const UI_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
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
    }
    input:focus {
      outline: none;
      border-color: #18a0fb;
    }
    .btn-primary { 
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
    .btn-primary:hover:not(:disabled) {
      background: #1592e6;
    }
    .btn-primary:disabled { 
      background: #ccc; 
      cursor: not-allowed;
    }
    
    /* Tab 样式 */
    .tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-top: 16px;
    }
    .tab {
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      border: none;
      background: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    .tab:hover {
      color: #333;
    }
    .tab.active {
      color: #18a0fb;
      border-bottom-color: #18a0fb;
    }
    
    /* 内容面板 */
    .tab-content {
      display: none;
      margin-top: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 4px;
      max-height: 350px;
      overflow-y: auto;
    }
    .tab-content.active {
      display: block;
    }
    .tab-content pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 11px;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      line-height: 1.5;
    }
    
    /* 状态和结果样式 */
    .status {
      margin-top: 8px;
      font-size: 11px;
      color: #666;
    }
    .loading { color: #1890ff; }
    .success { color: #52c41a; }
    .error { color: #ff4d4f; }
    
    /* 统计信息 */
    .stats {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      padding: 8px 12px;
      background: #e6f7ff;
      border-radius: 4px;
      font-size: 11px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .stat-value {
      font-weight: 600;
      color: #1890ff;
    }
    
    /* 下载按钮 */
    .btn-download {
      margin-top: 12px;
      padding: 8px 12px;
      background: #52c41a;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      width: auto;
    }
    .btn-download:hover {
      background: #49b018;
    }
  </style>
</head>
<body>
  <div class="input-group">
    <label>API Key</label>
    <input type="password" id="apiKey" placeholder="请输入 API Key" />
  </div>
  <button class="btn-primary" id="analyzeBtn">开始分析</button>
  <div id="status" class="status"></div>
  
  <!-- 统计信息 -->
  <div id="stats" class="stats" style="display: none;">
    <div class="stat-item">节点数: <span id="nodeCount" class="stat-value">0</span></div>
    <div class="stat-item">表格列: <span id="columnCount" class="stat-value">0</span></div>
    <div class="stat-item">搜索字段: <span id="fieldCount" class="stat-value">0</span></div>
  </div>
  
  <!-- Tab 切换 -->
  <div id="tabsContainer" style="display: none;">
    <div class="tabs">
      <button class="tab active" data-tab="pageContent">PageContent</button>
      <button class="tab" data-tab="metadata">Metadata</button>
    </div>
    
    <div id="pageContent" class="tab-content active">
      <pre id="pageContentJson"></pre>
    </div>
    <div id="metadata" class="tab-content">
      <pre id="metadataJson"></pre>
    </div>
    
    <button class="btn-download" id="downloadBtn">下载 PageContent JSON</button>
  </div>

  <script>
    const apiKeyInput = document.getElementById('apiKey');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const statusDiv = document.getElementById('status');
    const statsDiv = document.getElementById('stats');
    const tabsContainer = document.getElementById('tabsContainer');
    const pageContentJson = document.getElementById('pageContentJson');
    const metadataJson = document.getElementById('metadataJson');
    const nodeCountEl = document.getElementById('nodeCount');
    const columnCountEl = document.getElementById('columnCount');
    const fieldCountEl = document.getElementById('fieldCount');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let currentResult = null;
    
    // Tab 切换逻辑
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
    
    // 下载 JSON
    downloadBtn.onclick = () => {
      if (!currentResult) return;
      const blob = new Blob([JSON.stringify(currentResult.pageContent, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'page-content.json';
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
    
    // 保存配置的 API Key
    let configuredApiKey = '';
    const apiKeyGroup = document.querySelector('.input-group');
    
    // 处理来自主线程的消息
    window.onmessage = async (event) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      
      // 处理配置消息
      if (msg.type === 'config') {
        console.log('[UI] Received config:', msg.payload);
        if (msg.payload.apiKey) {
          configuredApiKey = msg.payload.apiKey;
          // 隐藏 API Key 输入框
          if (apiKeyGroup) {
            apiKeyGroup.style.display = 'none';
          }
          statusDiv.textContent = '已使用本地配置的 API Key';
          statusDiv.className = 'status success';
        }
        return;
      }
      
      if (msg.type === 'ai-request') {
        try {
          statusDiv.textContent = '正在调用 AI 分析...';
          statusDiv.className = 'status loading';
          
          const result = await callOpenAI(msg.prompt, msg.metadata);
          
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
          
          statusDiv.className = 'status error';
          statusDiv.textContent = '错误: ' + error.message;
        }
      } else if (msg.type === 'analysis-result') {
        currentResult = msg.payload;
        
        // 更新状态
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '开始分析';
        statusDiv.className = 'status success';
        statusDiv.textContent = '分析完成!';
        
        // 显示统计
        const nodeCount = countNodes(msg.payload.metadata);
        const columnCount = msg.payload.pageContent?.table?.columns?.length || 0;
        const fieldCount = msg.payload.pageContent?.search?.fields?.length || 0;
        
        nodeCountEl.textContent = nodeCount;
        columnCountEl.textContent = columnCount;
        fieldCountEl.textContent = fieldCount;
        statsDiv.style.display = 'flex';
        
        // 显示 Tab 内容
        pageContentJson.textContent = JSON.stringify(msg.payload.pageContent, null, 2);
        metadataJson.textContent = JSON.stringify(msg.payload.metadata, null, 2);
        tabsContainer.style.display = 'block';
      }
    };
    
    async function callOpenAI(systemPrompt, metadata) {
      // 优先使用配置的 API Key，否则使用输入框中的值
      const apiKey = configuredApiKey || apiKeyInput.value.trim();
      if (!apiKey) {
        throw new Error('请输入 API Key');
      }
      
      console.log('[UI] Calling AI API...');
      
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'glm-4',
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
      console.log('[UI] AI Response:', data);
      console.log('[UI] choices exists:', !!data.choices);
      console.log('[UI] choices length:', data.choices?.length);
      console.log('[UI] first choice:', data.choices?.[0]);
      console.log('[UI] message:', data.choices?.[0]?.message);
      
      const content = data.choices?.[0]?.message?.content;
      console.log('[UI] AI Content type:', typeof content);
      console.log('[UI] AI Content length:', content?.length);
      console.log('[UI] AI Content preview:', content?.substring(0, 500));
      
      if (!content) {
        console.error('[UI] Content is empty or undefined');
        console.error('[UI] Full response data:', JSON.stringify(data, null, 2));
        throw new Error('AI 返回空内容');
      }
      
      // 解析 JSON
      try {
        const result = JSON.parse(content);
        console.log('[UI] Parsed successfully:', result);
        return result;
      } catch (e) {
        console.log('[UI] Direct parse failed, trying to extract JSON...');
        console.log('[UI] Parse error:', e.message);
        
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
          console.log('[UI] Extracted JSON length:', jsonStr.length);
          const result = JSON.parse(jsonStr);
          console.log('[UI] Extracted and parsed successfully:', result);
          return result;
        }
        
        throw new Error('无法解析 AI 响应: ' + (e.message || 'Unknown error'));
      }
    }
    
    // 分析按钮点击
    analyzeBtn.onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'start-analysis' } }, '*');
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = '分析中...';
      statusDiv.textContent = '正在提取元数据...';
      statusDiv.className = 'status loading';
      tabsContainer.style.display = 'none';
      statsDiv.style.display = 'none';
    };
  </script>
</body>
</html>
`;
