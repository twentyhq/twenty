import { type JSONSchema7 } from 'json-schema';
import { isDefined } from 'twenty-shared/utils';

export type NormalizedToolInputSchema = {
  inputSchema: JSONSchema7;
  recordFilter?: JSONSchema7 | string;
};

const isRecordFilterDefinition = (definition: unknown) => {
  const properties = (definition as { properties?: Record<string, unknown> })
    ?.properties;

  return isDefined(properties?.or) && isDefined(properties?.not);
};

const sortKeys = (entries: [string, unknown][]) =>
  Object.fromEntries(
    entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
  );

const inlineReferences = (
  node: unknown,
  definitions: Record<string, unknown>,
): unknown => {
  if (Array.isArray(node)) {
    return node.map((item) => inlineReferences(item, definitions));
  }

  if (node === null || typeof node !== 'object') {
    return node;
  }

  const {
    $ref,
    $defs: _definitions,
    ...siblings
  } = node as Record<string, unknown>;

  const inlinedSiblings = sortKeys(
    Object.entries(siblings)
      .filter(([key]) => !(key === 'pattern' && 'format' in siblings))
      .map(([key, value]) => [
        key,
        key === 'required' && Array.isArray(value)
          ? [...value].sort()
          : inlineReferences(value, definitions),
      ]),
  );

  if (typeof $ref !== 'string') {
    return inlinedSiblings;
  }

  const definition = definitions[$ref.replace('#/$defs/', '')];

  if (isRecordFilterDefinition(definition)) {
    return sortKeys(Object.entries({ ...inlinedSiblings, recordFilter: true }));
  }

  return sortKeys(
    Object.entries({
      ...(inlineReferences(definition, definitions) as Record<string, unknown>),
      ...inlinedSiblings,
    }),
  );
};

const pointTopLevelFiltersToRecordFilter = (
  inputSchema: JSONSchema7,
  recordFilter: JSONSchema7 | undefined,
): JSONSchema7 => ({
  ...inputSchema,
  properties: Object.fromEntries(
    Object.entries(inputSchema.properties ?? {}).map(([key, value]) => [
      key,
      isDefined(recordFilter?.properties?.[key]) &&
      JSON.stringify(recordFilter.properties[key]) === JSON.stringify(value)
        ? `same as recordFilter.properties.${key}`
        : value,
    ]),
  ) as JSONSchema7['properties'],
});

const normalizeToolInputSchema = (
  inputSchema: JSONSchema7,
): NormalizedToolInputSchema => {
  const definitions = (inputSchema.$defs ?? {}) as Record<string, unknown>;
  const recordFilterDefinition = Object.values(definitions).find(
    isRecordFilterDefinition,
  );
  const recordFilter = isDefined(recordFilterDefinition)
    ? (inlineReferences(recordFilterDefinition, definitions) as JSONSchema7)
    : undefined;

  return {
    inputSchema: pointTopLevelFiltersToRecordFilter(
      inlineReferences(inputSchema, definitions) as JSONSchema7,
      recordFilter,
    ),
    ...(isDefined(recordFilter) && { recordFilter }),
  };
};

export const normalizeMcpToolInputSchemas = (
  tools: { name: string; inputSchema: JSONSchema7 }[],
): Record<string, NormalizedToolInputSchema> => {
  const toolNameByRecordFilter = new Map<string, string>();

  return Object.fromEntries(
    tools.map(({ name, inputSchema }) => {
      const normalized = normalizeToolInputSchema(inputSchema);

      if (!isDefined(normalized.recordFilter)) {
        return [name, normalized];
      }

      const serializedRecordFilter = JSON.stringify(normalized.recordFilter);
      const firstToolName = toolNameByRecordFilter.get(serializedRecordFilter);

      if (!isDefined(firstToolName)) {
        toolNameByRecordFilter.set(serializedRecordFilter, name);

        return [name, normalized];
      }

      return [
        name,
        { ...normalized, recordFilter: `same as ${firstToolName}` },
      ];
    }),
  );
};
