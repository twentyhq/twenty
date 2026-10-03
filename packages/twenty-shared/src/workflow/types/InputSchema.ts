import { type FieldMetadataType } from '@/types';
import { type LeafType, type NodeType } from '@/workflow';

export type RecordSchemaType = 'record' | 'records';

export type InputSchemaPropertyType =
  | LeafType
  | NodeType
  | RecordSchemaType
  | FieldMetadataType;

export type InputSchemaProperty = {
  type: InputSchemaPropertyType;
  enum?: string[];
  items?: InputSchemaProperty;
  properties?: Properties;
  multiline?: boolean;
  label?: string;
  objectUniversalIdentifier?: string;
};

type Properties = {
  [name: string]: InputSchemaProperty;
};

export type InputSchema = InputSchemaProperty[];
