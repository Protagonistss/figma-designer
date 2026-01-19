import React, { useState } from 'react';
import classNames from 'classnames';

interface JsonNodeProps {
  data: any;
  name?: string;
  isLast?: boolean;
}

export const JsonNode: React.FC<JsonNodeProps> = ({ data, name, isLast = true }) => {
  const [collapsed, setCollapsed] = useState(false);

  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data).length === 0;

  if (!isObject) {
    let valueClass = '';
    let valueDisplay = String(data);

    if (data === null) {
      valueClass = 'json-null';
      valueDisplay = 'null';
    } else if (typeof data === 'boolean') {
      valueClass = 'json-boolean';
    } else if (typeof data === 'number') {
      valueClass = 'json-number';
    } else if (typeof data === 'string') {
      valueClass = 'json-string';
      valueDisplay = `"${data}"`;
    }

    return (
      <div className="json-node">
        {name && <span className="json-key">"{name}":</span>}
        <span className={valueClass}>{valueDisplay}</span>
        {!isLast && <span>,</span>}
      </div>
    );
  }

  const openChar = isArray ? '[' : '{';
  const closeChar = isArray ? ']' : '}';
  const keys = Object.keys(data);

  if (isEmpty) {
    return (
      <div className="json-node">
        {name && <span className="json-key">"{name}":</span>}
        <span>{openChar}{closeChar}</span>
        {!isLast && <span>,</span>}
      </div>
    );
  }

  return (
    <div className="json-node" style={{ marginLeft: name ? 14 : 0 }}>
      <span
        className={classNames('json-toggle', { collapsed })}
        onClick={() => setCollapsed(!collapsed)}
      />
      {name && <span className="json-key">"{name}":</span>}
      <span>{openChar}</span>

      {!collapsed ? (
        <div className="json-children">
          {keys.map((key, index) => (
            <JsonNode
              key={key}
              name={isArray ? undefined : key}
              data={data[key]}
              isLast={index === keys.length - 1}
            />
          ))}
        </div>
      ) : (
        <span className="json-placeholder" onClick={() => setCollapsed(false)}>...</span>
      )}

      <span>{closeChar}</span>
      {!isLast && <span>,</span>}
    </div>
  );
};

interface JsonViewerProps {
  data: any;
  title?: string;
  onCopy?: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title, onCopy }) => {
  return (
    <div className="tab-content-wrapper">
      {onCopy && <button className="btn-copy" onClick={onCopy}>复制</button>}
      <div className="json-tree">
        {data ? <JsonNode data={data} isLast={true} /> : 'No data available.'}
      </div>
    </div>
  );
};
