import { InputSchemaPropertyType } from 'src/modules/code-introspection/types/input-schema.type';

type Leaf = {
  isLeaf: true;
  icon?: string;
  type?: InputSchemaPropertyType;
  value: any;
};

type Node = {
  isLeaf: false;
  icon?: string;
  value: OutputSchema;
};

export type OutputSchema = Record<string, Leaf | Node>;
