export type InputJsonSchema = {
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array'
    | 'integer'
    | 'null';
  description?: string;
  enum?: unknown[];
  items?: InputJsonSchema;
  properties?: Record<string, InputJsonSchema>;
  required?: string[];
  additionalProperties?: boolean | InputJsonSchema;
};
