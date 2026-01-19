import React from 'react';
import classNames from 'classnames';
import { Status } from '@figma-designer/shared';

interface StatusBarProps {
  status: Status;
  model: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status, model }) => {
  return (
    <div className="status-bar">
      <div className={classNames('status-dot', status.type)}></div>
      <span>{status.text}</span>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>
        {model}
      </span>
    </div>
  );
};

export default StatusBar;
