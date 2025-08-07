import { InputSchemaPropertyType } from 'src/modules/workflow/workflow-builder/workflow-schema/types/input-schema.type';

export type Leaf = {
  isLeaf: true;
  type?: InputSchemaPropertyType;
  icon?: string;
  label?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  isCompositeSubField?: boolean;
};

export type Node = {
  isLeaf: false;
  type?: InputSchemaPropertyType;
  icon?: string;
  label?: string;
  description?: string;
  value: OutputSchema;
};

type Link = {
  isLeaf: true;
  tab?: string;
  icon?: string;
  label?: string;
};

export type BaseOutputSchema = Record<string, Leaf | Node>;

export type FieldOutputSchema =
  | ((Leaf | Node) & {
      fieldMetadataId?: string;
    })
  | RecordOutputSchema;

export type RecordOutputSchema = {
  object: {
    nameSingular: string;
    fieldIdName: string;
    objectMetadataId: string;
    isRelationField?: boolean;
  } & Leaf;
  fields: Record<string, FieldOutputSchema>;
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
