import { isNonEmptyString } from '@sniptt/guards';

import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isDefined } from '@/utils/validation/isDefined';

type ResolveObjectLabel = (
  objectUniversalIdentifier: string,
) => string | undefined;

const buildRecordIdSchema = (
  objectUniversalIdentifier: string,
  resolveObjectLabel?: ResolveObjectLabel,
): InputJsonSchema => {
  const objectLabel = resolveObjectLabel?.(objectUniversalIdentifier);

  return {
    type: 'string',
    description: `Id of the ${isNonEmptyString(objectLabel) ? objectLabel : 'linked'} record`,
  };
};

// Record-typed inputs are stored as record ids at runtime (TwentyRecord is a
// branded string), but their schema carries an `objectUniversalIdentifier`
// marker for the workflow builder. The AI tool surface speaks plain JSON
// Schema, so collapse those markers to id strings with a descriptive label.
export const convertRecordInputsToToolSchema = (
  jsonSchema: InputJsonSchema,
  resolveObjectLabel?: ResolveObjectLabel,
): InputJsonSchema => {
  if (
    jsonSchema.type === 'object' &&
    isNonEmptyString(jsonSchema.objectUniversalIdentifier)
  ) {
    return buildRecordIdSchema(
      jsonSchema.objectUniversalIdentifier,
      resolveObjectLabel,
    );
  }

  const convertedSchema: InputJsonSchema = { ...jsonSchema };

  if (isDefined(jsonSchema.items)) {
    convertedSchema.items = convertRecordInputsToToolSchema(
      jsonSchema.items,
      resolveObjectLabel,
    );
  }

  if (isDefined(jsonSchema.properties)) {
    convertedSchema.properties = Object.fromEntries(
      Object.entries(jsonSchema.properties).map(([key, value]) => [
        key,
        convertRecordInputsToToolSchema(value, resolveObjectLabel),
      ]),
    );
  }

  if (
    isDefined(jsonSchema.additionalProperties) &&
    typeof jsonSchema.additionalProperties === 'object'
  ) {
    convertedSchema.additionalProperties = convertRecordInputsToToolSchema(
      jsonSchema.additionalProperties,
      resolveObjectLabel,
    );
  }

  return convertedSchema;
};
