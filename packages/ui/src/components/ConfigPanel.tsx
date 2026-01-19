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

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8.5L2.5 5H4.5V1.5H7.5V5H9.5L6 8.5Z" fill="currentColor"/>
    <path d="M2.5 9.5H9.5V10.5H2.5V9.5Z" fill="currentColor"/>
  </svg>
);

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  models,
  mode,
  isExtracting,
  isInferring,
  hasMetadata,
  hasInferenceResult,
  onApiKeyChange,
  onModelChange,
  onModeChange,
  onExtract,
  onInference
}) => {
  return (
    <div className="header-section">
      {!config.apiKey && (
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="请输入 OpenAI API Key (sk-...)"
            value={config.apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
          />
        </div>
      )}

      <div className="model-selector-wrapper">
        <label className="select-label">模型</label>
        <select
          className="model-select"
          value={config.model}
          onChange={e => onModelChange(e.target.value)}
        >
          {models.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="mode-selector">
        <button
          className={classNames('mode-option', { active: mode === 'structure-only' })}
          onClick={() => onModeChange('structure-only')}
        >仅结构</button>
        <button
          className={classNames('mode-option', { active: mode === 'hybrid' })}
          onClick={() => onModeChange('hybrid')}
        >混合模式</button>
        <button
          className={classNames('mode-option', { active: mode === 'visual-only' })}
          onClick={() => onModeChange('visual-only')}
        >仅截图</button>
      </div>

      <div className="button-group">
        <button className="btn-primary" onClick={onExtract} disabled={isExtracting}>
          {isExtracting ? '提取中...' : (hasMetadata ? '重新提取' : '提取元数据')}
        </button>
        <button className="btn-secondary" onClick={onInference} disabled={!hasMetadata || isInferring}>
          {isInferring ? '推断中...' : (hasInferenceResult ? '重新推断' : '推断结构')}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
