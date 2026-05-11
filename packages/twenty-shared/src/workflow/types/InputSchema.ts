import { type FieldMetadataType } from '@/types';
import { type LeafType, type NodeType } from '@/workflow';

export type InputSchemaPropertyType = LeafType | NodeType | FieldMetadataType;

export type InputSchemaProperty = {
  type: InputSchemaPropertyType;
  enum?: string[];
  items?: InputSchemaProperty;
  properties?: Properties;
  multiline?: boolean;
};

type Properties = {
  [name: string]: InputSchemaProperty;
};

export type InputSchema = InputSchemaProperty[];
