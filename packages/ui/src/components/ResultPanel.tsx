import React, { useState } from 'react';
import classNames from 'classnames';
import { NodeMetadata, RawNodeTree } from '@figma-designer/shared';
import { JsonViewer } from './JsonViewer';

interface ResultPanelProps {
  metadata: NodeMetadata | null;
  nodeTree: RawNodeTree | null;
  inferenceResult: any;
  screenshot: string | null;
  mode: 'structure-only' | 'hybrid' | 'visual-only';
}

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ZoomInIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
);

const ZoomOutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
    </svg>
);

const FitIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
);

const countNodes = (node: any): number => {
  let count = 1;
  if (node?.children) {
    node.children.forEach((c: any) => count += countNodes(c));
  }
  return count;
};

export const ResultPanel: React.FC<ResultPanelProps> = ({
  metadata,
  nodeTree,
  inferenceResult,
  screenshot
}) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'nodeTree' | 'inference'>('metadata');
  const [zoom, setZoom] = useState(100);

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy via navigator.clipboard', err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const getActiveData = () => {
      if (activeTab === 'metadata') return metadata;
      if (activeTab === 'nodeTree') return nodeTree;
      if (activeTab === 'inference') return inferenceResult;
      return null;
  };

  const activeData = getActiveData();
  const nodeCount = metadata ? countNodes(metadata) : 0;

  return (
    <div className="main-content">
      {/* Left Panel: Preview - Only show if screenshot exists */}
      {screenshot && (
        <div className="panel-left">
          <div className="panel-header">预览</div>
          <div className="preview-area">
              <img 
                  src={screenshot} 
                  className="preview-image" 
                  style={{ transform: `scale(${zoom / 100})` }}
                  alt="Preview" 
              />
              <div className="zoom-controls">
                  <button className="zoom-btn" onClick={() => setZoom(Math.max(10, zoom - 10))}><ZoomOutIcon /></button>
                  <button className="zoom-btn" onClick={() => setZoom(100)}><FitIcon /></button>
                  <button className="zoom-btn" onClick={() => setZoom(Math.min(500, zoom + 10))}><ZoomInIcon /></button>
              </div>
          </div>
        </div>
      )}

      {/* Right Panel: Code */}
      <div className="panel-right">
        <div className="right-header">
           <button 
              className={classNames('tab-btn', { active: activeTab === 'metadata' })}
              onClick={() => setActiveTab('metadata')}
           >
              Metadata
           </button>
           <button 
              className={classNames('tab-btn', { active: activeTab === 'nodeTree' })}
              onClick={() => setActiveTab('nodeTree')}
           >
              Node Tree
           </button>
        </div>
        
        <div className="right-sub-header">
           <span>{metadata ? `${nodeCount} 节点, ${0} 表格` : 'Ready'}</span>
           <button className="json-copy-btn" onClick={() => activeData && copyToClipboard(JSON.stringify(activeData, null, 2))}>
              {copyStatus === 'copied' ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon /> JSON
                </>
              )}
           </button>
        </div>

        <div className="code-content">
            <div className="tab-content-wrapper">
                {activeTab === 'metadata' && (
                     <JsonViewer data={metadata} />
                )}
                {activeTab === 'nodeTree' && (
                     <JsonViewer data={nodeTree} />
                )}
                 {activeTab === 'inference' && (
                     <JsonViewer data={inferenceResult} />
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;