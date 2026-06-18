import { isNonEmptyString } from '@sniptt/guards';

import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isRecordObjectSchema } from '@/logic-function/is-record-input-schema';
import { isDefined } from '@/utils/validation/isDefined';

type ResolveObjectLabel = (
  objectUniversalIdentifier: string,
) => string | undefined;

export const buildToolInputJsonSchema = (
  jsonSchema: InputJsonSchema,
  resolveObjectLabel?: ResolveObjectLabel,
): InputJsonSchema => {
  if (isRecordObjectSchema(jsonSchema)) {
    const objectLabel = resolveObjectLabel?.(
      jsonSchema.objectUniversalIdentifier,
    );

    return {
      type: 'string',
      description: `Id of the ${isNonEmptyString(objectLabel) ? objectLabel : 'linked'} record`,
    };
  }

  const {
    objectUniversalIdentifier: _objectUniversalIdentifier,
    multiline: _multiline,
    label: _label,
    items,
    properties,
    additionalProperties,
    ...standardKeywords
  } = jsonSchema;

  const toolSchema: InputJsonSchema = { ...standardKeywords };

  if (isDefined(items)) {
    toolSchema.items = buildToolInputJsonSchema(items, resolveObjectLabel);
  }

  if (isDefined(properties)) {
    toolSchema.properties = Object.fromEntries(
      Object.entries(properties).map(([key, value]) => [
        key,
        buildToolInputJsonSchema(value, resolveObjectLabel),
      ]),
    );
  }

  if (isDefined(additionalProperties)) {
    toolSchema.additionalProperties =
      typeof additionalProperties === 'object'
        ? buildToolInputJsonSchema(additionalProperties, resolveObjectLabel)
        : additionalProperties;
  }

  return toolSchema;
};
