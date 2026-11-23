import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { type FunctionInput } from '@/workflow/types/FunctionInput';
import { isNonEmptyArray } from '@sniptt/guards';

type ToolInputJsonSchema = Pick<InputJsonSchema, 'properties' | 'required'>;

const getDefaultPropertyValue = ({
  property,
  isRequired,
}: {
  property: InputJsonSchema;
  isRequired: boolean;
}): FunctionInput => {
  if (property.type === 'object') {
    return buildDefaultToolInput({
      jsonSchema: property,
      shouldSeedRequiredValues: isRequired,
    });
  }

  if (!isRequired) {
    return null;
  }

  if (property.type === 'array') {
    return [];
  }

  return isNonEmptyArray(property.enum) ? property.enum[0] : null;
};

const buildDefaultToolInput = ({
  jsonSchema,
  shouldSeedRequiredValues,
}: {
  jsonSchema: ToolInputJsonSchema;
  shouldSeedRequiredValues: boolean;
}): FunctionInput =>
  Object.fromEntries(
    Object.entries(jsonSchema.properties ?? {}).map(([key, property]) => [
      key,
      getDefaultPropertyValue({
        property,
        isRequired:
          shouldSeedRequiredValues && (jsonSchema.required ?? []).includes(key),
      }),
    ]),
  );

export const getDefaultMcpToolInputFromJsonSchema = (
  jsonSchema: ToolInputJsonSchema,
): FunctionInput =>
  buildDefaultToolInput({ jsonSchema, shouldSeedRequiredValues: true });
