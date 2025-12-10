import type { Node, Edge } from 'reactflow';

export interface ColumnSchema {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  nullable?: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface RelationshipSchema {
  sourceTable: string;
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
  type: '1:1' | '1:N' | 'N:M';
}

export interface DatabaseSchema {
  tables: TableSchema[];
  relationships: RelationshipSchema[];
}

export interface OptimizationSuggestion {
  id: string;
  category: 'Performance' | 'Security' | 'Normalization' | 'Storage';
  title: string;
  description: string;
  sqlCode?: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  schema: DatabaseSchema;
  optimizations: OptimizationSuggestion[];
}

// React Flow Custom Node Props
export interface TableNodeData {
  label: string;
  columns: ColumnSchema[];
}