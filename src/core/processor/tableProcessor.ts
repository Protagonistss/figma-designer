import { TablePageModel, SearchField, TableColumn } from '../../types/model';
import { isContainer, findChildren, sortNodesByPosition, findOneChild } from '../parser';

// Debug helper
function logNodeStructure(node: SceneNode, depth: number = 0): void {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.name} (${node.type})`);
  if (depth > 2) return; // Limit depth
  if (isContainer(node)) {
    for (const child of node.children) {
      logNodeStructure(child, depth + 1);
    }
  }
}

function isInputLike(node: SceneNode): boolean {
  // Check for standard input component names
  const name = node.name.toLowerCase();
  if (name.includes('input') || name.includes('select') || name.includes('picker')) {
      return true;
  }
  
  // Rectangle or Frame with stroke or specific background
  if (node.type === 'RECTANGLE' || node.type === 'FRAME' || node.type === 'INSTANCE') {
     // Simplistic check: it has a visible fill or stroke
     if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) return true;
     if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) return true;
  }
  return false;
}

function extractSearchFieldsRecursive(node: SceneNode, depth: number = 0): SearchField[] {
    const fields: SearchField[] = [];
    if (depth > 3) return fields; // Prevent deep recursion
    if (!isContainer(node)) return fields;

    const children = sortNodesByPosition(findChildren(node, n => n.visible));

    // Check for "Label + Input" pattern at this level
    for (let i = 0; i < children.length - 1; i++) {
        const current = children[i];
        const next = children[i+1];

        // Pattern 1: Text Label + Input Component/Frame
        if (current.type === 'TEXT' && isInputLike(next)) {
             // Alignment check
             const currentCenterY = current.y + current.height / 2;
             const nextCenterY = next.y + next.height / 2;
             if (Math.abs(currentCenterY - nextCenterY) < 20) {
                 fields.push({
                     label: current.characters,
                     type: 'input',
                     key: current.characters
                 });
                 // Skip next since we consumed it
                 i++; 
                 continue;
             }
        }
    }

    // If we didn't find direct matches, or to find more nested ones, recurse into children
    // But be careful not to double count if we already processed them.
    // A simpler approach for "search area" is to just deep scan for any Label+Input pairs.
    
    // Let's recurse into children that look like containers/groups
    for (const child of children) {
        if (isContainer(child) && !isInputLike(child)) {
             fields.push(...extractSearchFieldsRecursive(child, depth + 1));
        }
    }

    return fields;
}

function extractTableColumnsFromHeader(headerNode: SceneNode): TableColumn[] {
    const columns: TableColumn[] = [];
    if (!isContainer(headerNode)) return columns;
    
    // The header container should contain text nodes or cells
    const children = sortNodesByPosition(findChildren(headerNode, n => n.visible));
    
    // Filter out lines/backgrounds, keep Texts or Instances that contain Text
    children.forEach(child => {
        let title = '';
        let width = child.width;
        
        if (child.type === 'TEXT') {
            title = child.characters;
        } else if (isContainer(child)) {
            // It might be a cell instance, look for text inside
            const textChild = findOneChild(child, n => n.type === 'TEXT') as TextNode;
            if (textChild) {
                title = textChild.characters;
            }
        }

        if (title) {
            columns.push({
                title,
                dataIndex: title,
                width,
                align: 'left'
            });
        }
    });

    return columns;
}

function extractTableColumnsRecursive(node: SceneNode, depth: number = 0): TableColumn[] {
    if (depth > 4) return [];
    if (!isContainer(node)) return [];

    // Heuristic: Look for a node named "table-title" or similar which usually contains headers
    if (node.name.includes('table-title') || node.name.includes('表头')) {
        return extractTableColumnsFromHeader(node);
    }

    // Heuristic: Look for a row of text items that looks like a header
    // (This is the fallback if no explicit named container found)
    
    const children = sortNodesByPosition(findChildren(node, n => n.visible));
    for (const child of children) {
        const cols = extractTableColumnsRecursive(child, depth + 1);
        if (cols.length > 0) return cols;
    }

    return [];
}


export function processTablePage(node: SceneNode): TablePageModel {
  console.log("Scanning node structure:");
  logNodeStructure(node);

  let searchFields: SearchField[] = [];
  let columns: TableColumn[] = [];

  // 1. Locate Search Area
  // Look for a container named "search" or "filter" or similar
  let searchArea: SceneNode | null = null;
  if (isContainer(node)) {
      searchArea = findOneChild(node, n => n.name.toLowerCase().includes('search') || n.name.includes('搜索')) || null;
      
      // If not found directly, look inside "table-content"
      if (!searchArea) {
          const content = findOneChild(node, n => n.name.includes('table-content'));
          if (content && isContainer(content)) {
              searchArea = findOneChild(content, n => n.name.toLowerCase().includes('search') || n.name.includes('搜索'));
          }
      }
  }

  if (searchArea) {
      console.log("Found Search Area:", searchArea.name);
      searchFields = extractSearchFieldsRecursive(searchArea);
  } else {
      // Fallback: scan the whole node for fields
      searchFields = extractSearchFieldsRecursive(node);
  }


  // 2. Locate Table Area/Columns
  // Look for "table" container
  let tableArea: SceneNode | null = null;
  if (isContainer(node)) {
      // Try finding 'table-content' -> 'table'
      const content = findOneChild(node, n => n.name.includes('table-content'));
      if (content && isContainer(content)) {
          tableArea = findOneChild(content, n => n.name === 'table' || n.name.includes('表格'));
      }
      
      // Try direct child
      if (!tableArea) {
          tableArea = findOneChild(node, n => n.name.includes('table') || n.name.includes('表格'));
      }
  }

  if (tableArea) {
      console.log("Found Table Area:", tableArea.name);
      // Inside table area, look for headers
      columns = extractTableColumnsRecursive(tableArea);
  } else {
      columns = extractTableColumnsRecursive(node);
  }

  return {
    type: 'table-page',
    search: { fields: searchFields },
    table: { columns: columns }
  };
}
