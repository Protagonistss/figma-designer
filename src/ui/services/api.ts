export const API_SERVICE_SCRIPT = `
    let appConfig = {
      apiKey: '',
      apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-4'
    };

    async function callOpenAI(systemPrompt, metadata) {
      const apiKeyInput = document.getElementById('apiKey');
      // 优先使用输入框的值，其次使用配置的值
      const apiKey = apiKeyInput.value.trim() || appConfig.apiKey;
      
      if (!apiKey) {
        throw new Error('请配置 API Key');
      }
      
      const response = await fetch(appConfig.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: appConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(metadata, null, 2) }
          ],
          temperature: 0.3,
          max_tokens: 4096
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API 调用失败');
      }
      
      const data = await response.json();
      console.log('AI Raw Response:', data);
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
         throw new Error('AI 响应内容为空');
      }
      
      // 解析 JSON 响应
      try {
        // 1. 尝试直接解析
        return JSON.parse(content);
      } catch (e) {
        // 2. 尝试移除 Markdown 代码块标记 (\`\`\`json ... \`\`\`)
        const cleanContent = content.replace(/^\`\`\`json\s*|\s*\`\`\`$/g, '').replace(/^\`\`\`\s*|\s*\`\`\`$/g, '');
        try {
            return JSON.parse(cleanContent);
        } catch (e2) {
             // 3. 尝试提取第一个 { ... }
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (e3) {
                     // ignore
                }
            }
            console.error('Failed API Content:', content);
            throw new Error('无法解析 AI 响应: ' + content.substring(0, 100));
        }
      }
    }
`;
