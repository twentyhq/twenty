type InputSchemaPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'unknown';

export type InputSchemaProperty = {
  type: InputSchemaPropertyType;
  enum?: string[] | undefined;
  items?: InputSchemaProperty;
  properties?: InputSchema;
};

export type InputSchema = {
  [name: string]: InputSchemaProperty;
};
