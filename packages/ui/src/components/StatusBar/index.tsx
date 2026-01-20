import React from 'react';
import { Status } from '@figma-designer/shared';
import styles from './style.module.css';

interface StatusBarProps {
  status: Status;
  model: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  return (
    <div className={styles.footer}>
      {status.text}
    </div>
  );
};

export default StatusBar;