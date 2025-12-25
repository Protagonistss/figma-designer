import { processTablePage } from './core/processor/enhancedTableProcessor';
import { UI_HTML } from './ui/exportModal';

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

  try {
    const model = processTablePage(rootNode);
    
    console.log("---------------------------------------------------");
    console.log("Table Page Model Result:");
    console.log(JSON.stringify(model, null, 2)); // 重新启用完整输出
    
    const searchCount = model.body.search?.fields.length || 0;
    const columnCount = model.body.table.columns.length || 0;
    console.log(`Summary: SearchFields=${searchCount}, Columns=${columnCount}`);
    if (columnCount > 0) {
        console.log("Columns:", model.body.table.columns.map(c => c.title).join(", "));
    }
    console.log("---------------------------------------------------");

    figma.notify(`解析成功! 搜索项: ${searchCount}, 表格列: ${columnCount}`);
    
    // Show UI for export
    figma.showUI(UI_HTML, { width: 260, height: 260, title: "Export Meta JSON" });
    
    // Send data to UI
    figma.ui.postMessage({ type: 'meta-data', payload: model });

    // Handle messages from UI
    figma.ui.onmessage = (msg) => {
      if (msg.type === 'close') {
        figma.closePlugin();
      }
    };

  } catch (err) {
    console.error("Parsing error:", err);
    figma.notify("解析出错: " + (err as Error).message);
    figma.closePlugin();
  }
}

main().catch((err) => {
  console.error(err);
  figma.notify("发生错误: " + err.message);
  figma.closePlugin();
});
