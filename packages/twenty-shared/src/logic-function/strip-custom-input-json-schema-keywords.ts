import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isDefined } from '@/utils/validation/isDefined';

export const stripCustomInputJsonSchemaKeywords = (
  jsonSchema: InputJsonSchema,
): InputJsonSchema => {
  const sanitizedSchema: InputJsonSchema = {};

  if (isDefined(jsonSchema.type)) {
    sanitizedSchema.type = jsonSchema.type;
  }

  if (isDefined(jsonSchema.description)) {
    sanitizedSchema.description = jsonSchema.description;
  }

  if (isDefined(jsonSchema.enum)) {
    sanitizedSchema.enum = jsonSchema.enum;
  }

  if (isDefined(jsonSchema.required)) {
    sanitizedSchema.required = jsonSchema.required;
  }

  if (isDefined(jsonSchema.minimum)) {
    sanitizedSchema.minimum = jsonSchema.minimum;
  }

  if (isDefined(jsonSchema.maximum)) {
    sanitizedSchema.maximum = jsonSchema.maximum;
  }

  if (isDefined(jsonSchema.items)) {
    sanitizedSchema.items = stripCustomInputJsonSchemaKeywords(
      jsonSchema.items,
    );
  }

  if (isDefined(jsonSchema.properties)) {
    sanitizedSchema.properties = Object.fromEntries(
      Object.entries(jsonSchema.properties).map(([key, value]) => [
        key,
        stripCustomInputJsonSchemaKeywords(value),
      ]),
    );
  }

  if (isDefined(jsonSchema.additionalProperties)) {
    sanitizedSchema.additionalProperties =
      typeof jsonSchema.additionalProperties === 'object'
        ? stripCustomInputJsonSchemaKeywords(jsonSchema.additionalProperties)
        : jsonSchema.additionalProperties;
  }

  return sanitizedSchema;
};
