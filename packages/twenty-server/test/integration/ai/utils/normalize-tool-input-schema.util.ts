import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const RECORD_FILTER_REFERENCE = 'RecordFilter';

const isRecordFilterJsonSchema = (schema: unknown) =>
  isPlainObject(schema) &&
  isPlainObject(schema.properties) &&
  isDefined(schema.properties.or);

const inlineReferences = ({
  schema,
  definitions,
}: {
  schema: unknown;
  definitions: Record<string, unknown>;
}): unknown => {
  if (Array.isArray(schema)) {
    return schema.map((item) =>
      inlineReferences({ schema: item, definitions }),
    );
  }

  if (!isPlainObject(schema)) {
    return schema;
  }

  const { $ref, $defs: _definitions, ...keywords } = schema;

  const inlinedKeywords = Object.fromEntries(
    Object.entries(keywords).map(([keyword, value]) => [
      keyword,
      inlineReferences({ schema: value, definitions }),
    ]),
  );

  if (!isNonEmptyString($ref)) {
    return inlinedKeywords;
  }

  const definition = definitions[$ref.replace('#/$defs/', '')];

  if (isRecordFilterJsonSchema(definition)) {
    return { ...inlinedKeywords, $ref: RECORD_FILTER_REFERENCE };
  }

  const inlinedDefinition = inlineReferences({
    schema: definition,
    definitions,
  });

  if (!isPlainObject(inlinedDefinition)) {
    return inlinedDefinition;
  }

  return { ...inlinedDefinition, ...inlinedKeywords };
};

export const normalizeToolInputSchema = ({
  inputSchema,
}: {
  inputSchema: unknown;
}): { inputSchema: unknown; recordFilter: unknown } => {
  const definitions =
    isPlainObject(inputSchema) && isPlainObject(inputSchema.$defs)
      ? inputSchema.$defs
      : {};

  return {
    inputSchema: inlineReferences({ schema: inputSchema, definitions }),
    recordFilter: inlineReferences({
      schema: Object.values(definitions).find(isRecordFilterJsonSchema),
      definitions,
    }),
  };
};
