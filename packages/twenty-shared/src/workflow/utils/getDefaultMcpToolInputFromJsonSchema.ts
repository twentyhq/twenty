import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { type FunctionInput } from '@/workflow/types/FunctionInput';
import { isNonEmptyArray } from '@sniptt/guards';

const getDefaultPropertyValue = ({
  property,
  isRequired,
}: {
  property: InputJsonSchema;
  isRequired: boolean;
}): FunctionInput => {
  if (property.type === 'object') {
    return getDefaultMcpToolInputFromJsonSchema(property);
  }

  if (!isRequired) {
    return null;
  }

  if (property.type === 'array') {
    return [];
  }

  return isNonEmptyArray(property.enum) ? property.enum[0] : null;
};

// Optional inputs stay null until the author fills them, so the tool never receives a seeded [] or first enum value.
export const getDefaultMcpToolInputFromJsonSchema = (
  jsonSchema: InputJsonSchema,
): FunctionInput =>
  Object.fromEntries(
    Object.entries(jsonSchema.properties ?? {}).map(([key, property]) => [
      key,
      getDefaultPropertyValue({
        property,
        isRequired: (jsonSchema.required ?? []).includes(key),
      }),
    ]),
  );
