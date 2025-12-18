// This plugin will traverse selected nodes and process them.

// Main entry point
async function main() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("请先选择一个节点");
    figma.closePlugin();
    return;
  }

  let count = 0;

  // Function to process a single node
  function processNode(node: SceneNode) {
    console.log(`Processing node: ${node.name} (Type: ${node.type}, ID: ${node.id})`);
    count++;
    // Future processing logic goes here
  }

  // Recursive traversal function
  function traverse(node: SceneNode) {
    processNode(node);

    if ("children" in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  // Traverse all selected nodes
  for (const node of selection) {
    traverse(node);
  }

  figma.notify(`处理完成，共处理 ${count} 个节点`);
  figma.closePlugin();
}

// Run the main function
main().catch((err) => {
  console.error(err);
  figma.notify("发生错误: " + err.message);
  figma.closePlugin();
});
