import { processTablePage } from './core/processor/tableProcessor';

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
    console.log(JSON.stringify(model, null, 2));
    console.log("---------------------------------------------------");

    figma.notify(`解析成功! 搜索项: ${model.search.fields.length}, 表格列: ${model.table.columns.length}`);
  } catch (err: any) {
    console.error("Parsing error:", err);
    figma.notify("解析出错: " + err.message);
  }

  figma.closePlugin();
}

main().catch((err) => {
  console.error(err);
  figma.notify("发生错误: " + err.message);
  figma.closePlugin();
});
