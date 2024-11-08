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
  items?: InputSchemaProperty;
  properties?: InputSchema;
};

export type InputSchema = {
  [name: string]: InputSchemaProperty;
};
