// 协议层主入口
export * from './config';
export * from './intelligence';
export * from './namingProtocol';
export * from './layoutProtocol';

import { NamingProtocolHandler } from './namingProtocol';
import { LayoutProtocolHandler } from './layoutProtocol';
import { IntelligenceEngine } from './intelligence';

/**
 * 协议层管理器
 * 统一管理所有协议处理器
 */
export class ProtocolManager {
  private namingProtocol: NamingProtocolHandler;
  private layoutProtocol: LayoutProtocolHandler;
  private intelligenceEngine: IntelligenceEngine;

  constructor() {
    this.namingProtocol = new NamingProtocolHandler();
    this.layoutProtocol = new LayoutProtocolHandler();
    this.intelligenceEngine = new IntelligenceEngine();
  }

  getNamingProtocol(): NamingProtocolHandler {
    return this.namingProtocol;
  }

  getLayoutProtocol(): LayoutProtocolHandler {
    return this.layoutProtocol;
  }

  getIntelligenceEngine(): IntelligenceEngine {
    return this.intelligenceEngine;
  }

  /**
   * 综合判断节点类型
   */
  analyzeNode(node: SceneNode): {
    businessType: string;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let confidence = 0;

    // 基于命名分析
    const nameBasedType = this.namingProtocol.getBusinessType(node.name);
    if (nameBasedType !== 'unknown') {
      reasons.push(`命名匹配: "${node.name}" -> ${nameBasedType}`);
      confidence += 0.6;
    }

    // 基于布局分析
    if (node.type === 'TEXT') {
      reasons.push('文本节点');
      confidence += 0.2;
    }

    if (node.type === 'FRAME' || node.type === 'GROUP') {
      reasons.push('容器节点');
      confidence += 0.2;
    }

    // 如果有子节点，分析子节点类型
    if ('children' in node && node.children.length > 0) {
      const childTypes = new Set(node.children.map(child => 
        this.namingProtocol.getBusinessType(child.name)
      ));
      
      if (childTypes.has('input') && childTypes.has('button')) {
        reasons.push('包含输入和按钮组件');
        confidence += 0.3;
      }
    }

    const finalType = nameBasedType !== 'unknown' ? nameBasedType : this.inferTypeFromNode(node);

    return {
      businessType: finalType,
      confidence: Math.min(confidence, 1.0),
      reasons
    };
  }

  private inferTypeFromNode(node: SceneNode): string {
    if (node.type === 'TEXT') return 'text';
    if (node.type === 'RECTANGLE') return 'shape';
    if (node.type === 'FRAME') return 'container';
    if (node.type === 'INSTANCE') return 'component';
    return 'unknown';
  }
}