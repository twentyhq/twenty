import { InputSchemaPropertyType } from 'src/modules/code-introspection/types/input-schema.type';

type Leaf = {
  isLeaf: true;
  type?: InputSchemaPropertyType;
  icon?: string;
  value: any;
};

type Node = {
  isLeaf: false;
  value: OutputSchema;
};

export type OutputSchema = Record<string, Leaf | Node>;
