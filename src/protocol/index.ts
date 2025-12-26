// 协议层主入口
import { NamingProtocolHandler } from './namingProtocol';
import { LayoutProtocolHandler } from './layoutProtocol';
import { IntelligenceEngine } from './intelligence';
import { INamingProtocol, ILayoutProtocol, IIntelligenceEngine, IBusinessProtocol } from './interfaces';

// Re-export interfaces and modules
export * from './interfaces';
export * from './config';
export * from './intelligence';
export * from './namingProtocol';
export * from './layoutProtocol';

/**
 * 协议层管理器
 * 统一管理所有协议处理器，支持动态注册业务协议
 */
export class ProtocolManager {
  private namingProtocol: INamingProtocol;
  private layoutProtocol: ILayoutProtocol;
  private intelligenceEngine: IIntelligenceEngine;
  
  // 存储注册的业务协议
  private businessProtocols: Map<string, IBusinessProtocol> = new Map();

  constructor() {
    this.namingProtocol = new NamingProtocolHandler();
    this.layoutProtocol = new LayoutProtocolHandler();
    this.intelligenceEngine = new IntelligenceEngine();
  }

  // --- 基础能力访问 ---

  getNamingProtocol(): INamingProtocol {
    return this.namingProtocol;
  }

  getLayoutProtocol(): ILayoutProtocol {
    return this.layoutProtocol;
  }

  getIntelligenceEngine(): IIntelligenceEngine {
    return this.intelligenceEngine;
  }
  
  // --- 业务协议注册与管理 ---

  /**
   * 注册一个新的业务协议
   */
  registerProtocol(protocol: IBusinessProtocol): void {
    if (this.businessProtocols.has(protocol.id)) {
      console.warn(`[ProtocolManager] Protocol with id '${protocol.id}' is already registered. Overwriting.`);
    }
    this.businessProtocols.set(protocol.id, protocol);
  }

  /**
   * 获取指定的业务协议
   */
  getProtocol(id: string): IBusinessProtocol | undefined {
    return this.businessProtocols.get(id);
  }
  
  /**
   * 获取所有注册的协议，按优先级降序排列
   */
  getAllProtocols(): IBusinessProtocol[] {
    return Array.from(this.businessProtocols.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * 自动识别并选择最匹配的协议
   */
  identifyProtocol(node: SceneNode): IBusinessProtocol | null {
    const protocols = this.getAllProtocols();
    
    for (const protocol of protocols) {
      try {
        if (protocol.canHandle(node)) {
          return protocol;
        }
      } catch (e) {
        console.error(`[ProtocolManager] Error checking canHandle for protocol '${protocol.id}':`, e);
      }
    }
    
    return null;
  }

  /**
   * 综合判断节点类型 (基础分析，作为回退或辅助)
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
