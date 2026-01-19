import React, { useState } from 'react';
import classNames from 'classnames';
import { NodeMetadata, RawNodeTree } from '@figma-designer/shared';
import { JsonViewer, JsonNode } from './JsonViewer';

interface ResultPanelProps {
  metadata: NodeMetadata | null;
  nodeTree: RawNodeTree | null;
  inferenceResult: any;
  screenshot: string | null;
  mode: 'structure-only' | 'hybrid' | 'visual-only';
}

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8.5L2.5 5H4.5V1.5H7.5V5H9.5L6 8.5Z" fill="currentColor"/>
    <path d="M2.5 9.5H9.5V10.5H2.5V9.5Z" fill="currentColor"/>
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
  screenshot,
  mode
}) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'nodeTree' | 'inference'>('metadata');

  const downloadJson = () => {
    if (!metadata) return;
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied!');
    }).catch(err => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  return (
    <>
      <div className="main-content">
        <div className="left-panel">
          {metadata && (
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{countNodes(metadata)}</span>
                <span className="stat-label">节点数</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{inferenceResult?.table?.columns?.length || 0}</span>
                <span className="stat-label">表格列</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{inferenceResult?.search?.fields?.length || 0}</span>
                <span className="stat-label">搜索项</span>
              </div>
            </div>
          )}

          {screenshot && (
            <div className="screenshot-preview">
              <img src={screenshot} alt="Screenshot" />
              <div className="screenshot-info">
                <span>{Math.round((screenshot.length * 3) / 4 / 1024)} KB</span>
                <span>{mode === 'hybrid' ? '混合模式' : '仅截图'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="tabs-header">
            <div className="tab-group">
              <button
                className={classNames('tab', { active: activeTab === 'metadata' })}
                onClick={() => setActiveTab('metadata')}
              >Metadata</button>
              <button
                className={classNames('tab', { active: activeTab === 'nodeTree' })}
                onClick={() => setActiveTab('nodeTree')}
              >Node Tree</button>
              {inferenceResult && (
                <button
                  className={classNames('tab', { active: activeTab === 'inference' })}
                  onClick={() => setActiveTab('inference')}
                >Inference</button>
              )}
            </div>
            <button className="btn-download-mini" onClick={downloadJson} title="下载元数据 JSON">
              <span>JSON</span>
              <DownloadIcon />
            </button>
          </div>

          <div className={classNames('tab-content', { active: activeTab === 'metadata' })}>
            <JsonViewer
              data={metadata}
              onCopy={metadata ? () => copyToClipboard(JSON.stringify(metadata, null, 2)) : undefined}
            />
          </div>

          <div className={classNames('tab-content', { active: activeTab === 'nodeTree' })}>
            <JsonViewer
              data={nodeTree}
              onCopy={nodeTree ? () => copyToClipboard(JSON.stringify(nodeTree, null, 2)) : undefined}
            />
          </div>

          <div className={classNames('tab-content', { active: activeTab === 'inference' })}>
            {inferenceResult && (
              <button className="btn-copy" onClick={() => copyToClipboard(JSON.stringify(inferenceResult, null, 2))}>复制</button>
            )}
            <textarea
              className="code-textarea"
              readOnly
              value={inferenceResult ? JSON.stringify(inferenceResult, null, 2) : ''}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultPanel;
