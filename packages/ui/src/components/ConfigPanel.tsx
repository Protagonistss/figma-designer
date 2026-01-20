import React from 'react';
import classNames from 'classnames';
import { AppConfig } from '@figma-designer/shared';

interface ConfigPanelProps {
  config: AppConfig;
  models: Array<{ value: string; label: string }>;
  mode: 'structure-only' | 'hybrid' | 'visual-only';
  isExtracting: boolean;
  isInferring: boolean;
  hasMetadata: boolean;
  hasInferenceResult: boolean;
  onApiKeyChange: (apiKey: string) => void;
  onModelChange: (model: string) => void;
  onModeChange: (mode: 'structure-only' | 'hybrid' | 'visual-only') => void;
  onExtract: () => void;
  onInference: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  models,
  mode,
  isExtracting,
  isInferring,
  hasMetadata,
  hasInferenceResult,
  onModelChange,
  onModeChange,
  onExtract,
  onInference
}) => {
  return (
    <div className="header-section">
      <div className="header-left">
        <div className="app-title" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span>AI 设计解析</span>
        </div>

        <div className="model-selector-wrapper">
          <span className="select-label">模型:</span>
          <select
            className="model-select"
            value={config.model}
            onChange={e => onModelChange(e.target.value)}
          >
            {models.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
             <path d="M1 1L5 5L9 1" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="mode-selector">
        <button
          className={classNames('mode-option', { active: mode === 'structure-only' })}
          onClick={() => onModeChange('structure-only')}
        >
          仅结构
        </button>
        {mode !== 'structure-only' && mode !== 'hybrid' && <div className="mode-separator"></div>}
        <button
          className={classNames('mode-option', { active: mode === 'hybrid' })}
          onClick={() => onModeChange('hybrid')}
        >
          混合模式
        </button>
        {mode !== 'hybrid' && mode !== 'visual-only' && <div className="mode-separator"></div>}
        <button
          className={classNames('mode-option', { active: mode === 'visual-only' })}
          onClick={() => onModeChange('visual-only')}
        >
          仅截图
        </button>
      </div>

      <div className="header-right">
        <button className="btn-secondary" onClick={onExtract} disabled={isExtracting}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {isExtracting ? '提取中...' : '重新提取'}
        </button>
        <button className="btn-primary" onClick={onInference} disabled={!hasMetadata || isInferring}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/>
            <path d="m14 7 3 3"/>
            <path d="M5 6v1"/>
            <path d="M11 2v2"/>
            <path d="M2 9h2"/>
            <path d="M10 10l-1.5-1.5"/>
          </svg>
          {isInferring ? '推断中...' : '推断结构'}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;