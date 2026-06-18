import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isRecordObjectSchema } from '@/logic-function/is-record-object-schema';
import { isDefined } from '@/utils/validation/isDefined';

type ResolveObjectLabel = (
  objectUniversalIdentifier: string,
) => string | undefined;

const buildRecordIdDescription = (
  objectUniversalIdentifier: string | undefined,
  resolveObjectLabel?: ResolveObjectLabel,
): string => {
  const objectLabel = isNonEmptyString(objectUniversalIdentifier)
    ? resolveObjectLabel?.(objectUniversalIdentifier)
    : undefined;

  return `Id of the ${isNonEmptyString(objectLabel) ? objectLabel : 'linked'} record`;
};

export const buildToolInputJsonSchema = (
  jsonSchema: InputJsonSchema,
  resolveObjectLabel?: ResolveObjectLabel,
): InputJsonSchema => {
  if (isRecordObjectSchema(jsonSchema)) {
    return {
      type: 'string',
      description: buildRecordIdDescription(
        jsonSchema.objectUniversalIdentifier,
        resolveObjectLabel,
      ),
    };
  }

  if (jsonSchema.type === 'records') {
    return {
      type: 'array',
      items: {
        type: 'string',
        description: buildRecordIdDescription(
          jsonSchema.objectUniversalIdentifier,
          resolveObjectLabel,
        ),
      },
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
    toolSchema.additionalProperties = isObject(additionalProperties)
      ? buildToolInputJsonSchema(additionalProperties, resolveObjectLabel)
      : additionalProperties;
  }

  return toolSchema;
};
