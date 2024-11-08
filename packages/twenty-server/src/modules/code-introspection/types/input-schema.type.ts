type InputSchemaPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'unknown';

export type InputSchemaProperty = {
  type: InputSchemaPropertyType;
  enum?: string[];
  items?: InputSchemaProperty; // used to describe array type elements
  properties?: InputSchema; // used to describe object type elements
};

export type InputSchema = {
  [name: string]: InputSchemaProperty;
};
