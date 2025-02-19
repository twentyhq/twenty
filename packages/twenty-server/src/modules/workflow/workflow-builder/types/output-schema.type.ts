import { InputSchemaPropertyType } from 'src/modules/workflow/workflow-builder/types/input-schema.type';

export type Leaf = {
  isLeaf: true;
  type?: InputSchemaPropertyType;
  icon?: string;
  label?: string;
  value: any;
};

export type Node = {
  isLeaf: false;
  icon?: string;
  label?: string;
  value: OutputSchema;
};

type Link = {
  isLeaf: true;
  tab?: string;
  icon?: string;
  label?: string;
};

export type BaseOutputSchema = Record<string, Leaf | Node>;

export type RecordOutputSchema = {
  object: { nameSingular: string; fieldIdName: string } & Leaf;
  fields: BaseOutputSchema;
  _outputSchemaType: 'RECORD';
};

export type LinkOutputSchema = {
  link: Link;
  _outputSchemaType: 'LINK';
};

export type OutputSchema =
  | BaseOutputSchema
  | RecordOutputSchema
  | LinkOutputSchema;
