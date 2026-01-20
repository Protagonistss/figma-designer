import React from 'react';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';

interface JsonViewerProps {
  data: any;
  title?: string;
  onCopy?: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  if (data === null || data === undefined) {
    return <div className="json-viewer-empty" style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>No data</div>;
  }

  return (
    <div className="json-viewer-container" style={{ height: '100%', overflow: 'auto', padding: '12px', boxSizing: 'border-box' }}>
      <JsonView
        value={data}
        style={vscodeTheme}
        collapsed={10}
        displayDataTypes={false}
        shortenTextAfterLength={100}
        enableClipboard={true}
      />
    </div>
  );
};
