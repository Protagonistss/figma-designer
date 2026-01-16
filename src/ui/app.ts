export const UI_APP_SCRIPT = `
    const apiKeyInput = document.getElementById('apiKey');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultDiv = document.getElementById('result');
    const statusDiv = document.getElementById('status');
    
    // 处理来自主线程的消息
    window.onmessage = async (event) => {
      const msg = event.data.pluginMessage;
      
      if (msg.type === 'ai-request') {
        try {
          resultDiv.style.display = 'block';
          resultDiv.className = 'result loading';
          resultDiv.textContent = '正在调用 AI 进行推理...';
          statusDiv.textContent = '正在处理...';
          
          const result = await callOpenAI(msg.prompt, msg.metadata);
          
          parent.postMessage({
            pluginMessage: {
              type: 'ai-response',
              requestId: msg.requestId,
              result
            }
          }, '*');
          
          resultDiv.className = 'result success';
          resultDiv.textContent = JSON.stringify(result, null, 2);
          statusDiv.textContent = '推理完成';
        } catch (error) {
          parent.postMessage({
            pluginMessage: {
              type: 'ai-response',
              requestId: msg.requestId,
              error: error.message
            }
          }, '*');
          
          resultDiv.className = 'result error';
          resultDiv.textContent = '错误: ' + error.message;
          statusDiv.textContent = '推理失败';
        }
      } else if (msg.type === 'analysis-result') {
        // 显示最终分析结果
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '开始分析';
        resultDiv.style.display = 'block';
        resultDiv.className = 'result success';
        resultDiv.textContent = JSON.stringify(msg.payload, null, 2);
        const role = msg.payload.inference.role || '未知';
        const confidence = (msg.payload.inference.confidence * 100).toFixed(0);
        statusDiv.textContent = '角色: ' + role + ', 置信度: ' + confidence + '%';
      } else if (msg.type === 'config') {
        // 更新全局配置
        if (msg.payload) {
          appConfig = { ...appConfig, ...msg.payload };
        }
        
        // 收到配置，预填 API Key 并隐藏输入框
        if (msg.payload.apiKey) {
            apiKeyInput.value = msg.payload.apiKey;
            // 找到 input-group 并隐藏
            const inputGroup = apiKeyInput.closest('.input-group');
            if (inputGroup) {
                inputGroup.style.display = 'none';
            }
        }
      }
    };
    
    // 分析按钮点击
    analyzeBtn.onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'start-analysis' } }, '*');
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = '分析中...';
      statusDiv.textContent = '等待分析...';
      resultDiv.style.display = 'none';
    };
`;
