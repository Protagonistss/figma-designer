import { Processor } from './processor';
import { UI_HTML } from './ui';
import { ConfigManager } from './config';

/**
 * 提取原始节点树（用于调试和对比）
 * 包含完整的节点信息：id、坐标、尺寸等
 */
function extractRawNodeTree(node: SceneNode): any {
  const rawNode: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    x: Math.round(node.x),
    y: Math.round(node.y),
    width: Math.round(node.width),
    height: Math.round(node.height)
  };
  
  // 提取文本内容
  if (node.type === 'TEXT') {
    rawNode.characters = (node as TextNode).characters;
  }
  
  // 递归提取子节点
  if ('children' in node) {
    rawNode.children = node.children
      .filter(c => c.visible)
      .map(c => extractRawNodeTree(c));
  }
  
  return rawNode;
}


async function main() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("请先选择一个节点");
    figma.closePlugin();
    return;
  }

  // Only process the first selected node as the root of the page/module
  const rootNode = selection[0];
  console.log(`Processing root node: ${rootNode.name} (Type: ${rootNode.type})`);

  // Show UI for API Key input and analysis
  figma.showUI(UI_HTML, { width: 400, height: 500, title: "AI 设计稿解析" });

  // 发送配置信息给 UI
  const config = ConfigManager.getInstance().getConfig();
  figma.ui.postMessage({
    type: 'config',
    payload: config
  });

  // Handle messages from UI
  figma.ui.onmessage = async (msg: any) => {
    if (msg.type === 'start-analysis') {
      try {
        figma.notify("开始分析...");
        
        const processor = new Processor();
        const result = await processor.process(rootNode);
        
        console.log("---------------------------------------------------");
        console.log("AI Inference Result:");
        console.log(JSON.stringify(result, null, 2));
        console.log("---------------------------------------------------");
        
        // Send result back to UI for display
        figma.ui.postMessage({
          type: 'analysis-result',
          payload: {
            metadata: result.metadata,
            inference: result.inference,
            pageContent: result.pageContent,
            nodeTree: extractRawNodeTree(rootNode)
          }
        });
        
        // 显示分析摘要
        const pageType = result.pageContent.page?.type || '未知';
        const columnsCount = result.pageContent.table?.columns?.length || 0;
        const fieldsCount = result.pageContent.search?.fields?.length || 0;
        figma.notify(`分析完成! 类型: ${pageType}, 表格列: ${columnsCount}, 搜索字段: ${fieldsCount}`);
      } catch (err) {
        console.error("Processing error:", err);
        figma.notify("分析出错: " + (err as Error).message);
      }
    } else if (msg.type === 'close') {
      figma.closePlugin();
    }
  };
}

main().catch((err) => {
  console.error(err);
  figma.notify("发生错误: " + err.message);
  figma.closePlugin();
});
