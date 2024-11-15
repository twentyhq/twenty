import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type InputSchemaPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'unknown'
  | FieldMetadataType;

export type InputSchemaProperty = {
  type: InputSchemaPropertyType;
  enum?: string[];
  items?: InputSchemaProperty; // used to describe array type elements
  properties?: InputSchema; // used to describe object type elements
};

export type InputSchema = {
  [name: string]: InputSchemaProperty;
};
