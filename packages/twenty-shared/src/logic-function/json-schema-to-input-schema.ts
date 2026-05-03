import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import {
  type InputSchema,
  type InputSchemaProperty,
} from '@/workflow/types/InputSchema';

const convertProperty = (jsonSchema: InputJsonSchema): InputSchemaProperty => {
  const property: InputSchemaProperty = { type: 'unknown' };

  switch (jsonSchema.type) {
    case 'string':
      property.type = 'string';
      break;
    case 'number':
    case 'integer':
      property.type = 'number';
      break;
    case 'boolean':
      property.type = 'boolean';
      break;
    case 'array':
      property.type = 'array';
      if (jsonSchema.items) {
        property.items = convertProperty(jsonSchema.items);
      }
      break;
    case 'object':
      property.type = 'object';
      if (jsonSchema.properties) {
        property.properties = Object.fromEntries(
          Object.entries(jsonSchema.properties).map(([key, value]) => [
            key,
            convertProperty(value),
          ]),
        );
      }
      break;
    case 'null':
    default:
      property.type = 'unknown';
  }

  if (Array.isArray(jsonSchema.enum)) {
    property.enum = jsonSchema.enum.filter(
      (value): value is string => typeof value === 'string',
    );
  }

  return property;
};

// Wraps in a single-element array because Twenty's InputSchema represents
// the parameter list of a function -- logic functions take a single params
// object, hence a one-element array containing it.
export const jsonSchemaToInputSchema = (
  jsonSchema: InputJsonSchema,
): InputSchema => {
  return [convertProperty(jsonSchema)];
};
