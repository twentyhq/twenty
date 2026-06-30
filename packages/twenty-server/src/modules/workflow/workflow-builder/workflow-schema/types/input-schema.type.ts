import { type FieldMetadataType } from 'twenty-shared/types';
export type InputSchemaPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'record'
  | 'records'
  | 'unknown'
  | FieldMetadataType;

export type InputSchemaProperty = {
  type: InputSchemaPropertyType;
  enum?: string[];
  items?: InputSchemaProperty; // used to describe array type elements
  properties?: Properties; // used to describe object type elements
  objectUniversalIdentifier?: string;
};

type Properties = {
  [name: string]: InputSchemaProperty;
};

export type InputSchema = InputSchemaProperty[];
