import React from 'react';
import classNames from 'classnames';
import { AppConfig } from '@figma-designer/shared';
import styles from './style.module.css';

interface HeaderProps {
  config: AppConfig;
  models: Array<{ value: string; label: string }>;
  mode: 'structure-only' | 'hybrid' | 'visual-only';
  isExtracting: boolean;
  isInferring: boolean;
  hasMetadata: boolean;
  onModelChange: (model: string) => void;
  onModeChange: (mode: 'structure-only' | 'hybrid' | 'visual-only') => void;
  onExtract: () => void;
  onInference: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  models,
  mode,
  isExtracting,
  isInferring,
  hasMetadata,
  onModelChange,
  onModeChange,
  onExtract,
  onInference
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <div className={styles.modelSelectorWrapper}>
          <span className={styles.selectLabel}>模型:</span>
          <select
            className={styles.modelSelect}
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

      <div className={styles.modeSelector}>
        <button
          className={classNames(styles.modeOption, { [styles.active]: mode === 'structure-only' })}
          onClick={() => onModeChange('structure-only')}
        >
          仅结构
        </button>
        <div className={styles.modeSeparator}></div>
        <button
          className={classNames(styles.modeOption, { [styles.active]: mode === 'hybrid' })}
          onClick={() => onModeChange('hybrid')}
        >
          混合模式
        </button>
        <div className={styles.modeSeparator}></div>
        <button
          className={classNames(styles.modeOption, { [styles.active]: mode === 'visual-only' })}
          onClick={() => onModeChange('visual-only')}
        >
          仅截图
        </button>
      </div>

      <div className={styles.right}>
        <button className={styles.btnSecondary} onClick={onExtract} disabled={isExtracting}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
             <path d="M3 3v5h5"/>
             <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
             <path d="M16 21h5v-5"/>
          </svg>
          {isExtracting ? '提取中...' : (hasMetadata ? '重新提取' : '提取结构')}
        </button>
        <button className={styles.btnPrimary} onClick={onInference} disabled={!hasMetadata || isInferring}>
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

export default Header;

