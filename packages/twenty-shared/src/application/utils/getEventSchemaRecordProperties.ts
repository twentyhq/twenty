import { isNonEmptyString } from '@sniptt/guards';

import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

export const getEventSchemaRecordProperties = (
  schema: Pick<InputJsonSchema, 'properties'>,
): { name: string; objectUniversalIdentifier: string }[] =>
  Object.entries(schema.properties ?? {}).flatMap(
    ([name, { type, objectUniversalIdentifier }]) =>
      type === 'record' && isNonEmptyString(objectUniversalIdentifier)
        ? [{ name, objectUniversalIdentifier }]
        : [],
  );
