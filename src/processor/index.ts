import { MetadataExtractor } from '../extractor';
import { NodeMetadata } from '../types/metadata';

export interface ExtractResult {
  metadata: NodeMetadata;
}

export class Processor {
  private extractor: MetadataExtractor;
  
  constructor() {
    this.extractor = new MetadataExtractor(6); // 提高层级以覆盖更多标签文本
  }
  
  async extract(rootNode: SceneNode): Promise<ExtractResult> {
    console.log('[Processor] Extracting metadata...');
    const metadata = this.extractor.extractTree(rootNode);
    console.log('[Processor] Metadata extracted, nodes:', this.countNodes(metadata));
    return { metadata };
  }
  
  private countNodes(node: NodeMetadata): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }
  
}
