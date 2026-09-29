export type LeafType = 'string' | 'number' | 'boolean' | 'array' | 'unknown';

export type NodeType = 'object' | 'unknown';

export type Leaf = {
  isLeaf: true;
  icon?: string;
  type: LeafType;
  label: string;
  value: any;
};

export type Node = {
  isLeaf: false;
  icon?: string;
  type: NodeType;
  label: string;
  value: BaseOutputSchemaV2;
};

export type BaseOutputSchemaV2 = Record<string, Leaf | Node>;
