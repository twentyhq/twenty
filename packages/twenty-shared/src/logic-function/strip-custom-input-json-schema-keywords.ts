import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isDefined } from '@/utils/validation/isDefined';

export const stripCustomInputJsonSchemaKeywords = (
  jsonSchema: InputJsonSchema,
): InputJsonSchema => {
  const {
    objectUniversalIdentifier: _objectUniversalIdentifier,
    multiline: _multiline,
    label: _label,
    items,
    properties,
    additionalProperties,
    ...standardKeywords
  } = jsonSchema;

  const sanitizedSchema: InputJsonSchema = { ...standardKeywords };

  if (isDefined(items)) {
    sanitizedSchema.items = stripCustomInputJsonSchemaKeywords(items);
  }

  if (isDefined(properties)) {
    sanitizedSchema.properties = Object.fromEntries(
      Object.entries(properties).map(([key, value]) => [
        key,
        stripCustomInputJsonSchemaKeywords(value),
      ]),
    );
  }

  if (isDefined(additionalProperties)) {
    sanitizedSchema.additionalProperties =
      typeof additionalProperties === 'object'
        ? stripCustomInputJsonSchemaKeywords(additionalProperties)
        : additionalProperties;
  }

  return sanitizedSchema;
};
