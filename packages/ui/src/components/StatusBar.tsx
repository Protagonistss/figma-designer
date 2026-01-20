import React from 'react';
import { Status } from '@figma-designer/shared';

interface StatusBarProps {
  status: Status;
  model: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  return (
    <div className="status-footer">
      {status.text}
    </div>
  );
};

export default StatusBar;