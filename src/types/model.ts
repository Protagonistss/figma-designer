export interface SearchField {
  label: string;
  key?: string;
  type: 'input' | 'select' | 'date' | 'unknown';
  placeholder?: string;
  defaultValue?: string;
}

export interface TableColumn {
  title: string;
  dataIndex?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TablePageModel {
  type: 'table-page';
  search: {
    fields: SearchField[];
  };
  table: {
    columns: TableColumn[];
  };
}
