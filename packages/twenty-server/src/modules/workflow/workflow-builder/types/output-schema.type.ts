import { InputSchemaPropertyType } from 'src/modules/code-introspection/types/input-schema.type';

export type Leaf = {
  isLeaf: true;
  icon?: string;
  type?: InputSchemaPropertyType;
  label?: string;
  value: any;
};

export type Node = {
  isLeaf: false;
  icon?: string;
  label?: string;
  value: OutputSchema;
};

export type BaseOutputSchema = Record<string, Leaf | Node>;

export type RecordOutputSchema = {
  object: { nameSingular: string; fieldIdName: string } & Leaf;
  fields: BaseOutputSchema;
  _outputSchemaType: 'RECORD';
};

export type OutputSchema = BaseOutputSchema | RecordOutputSchema;
