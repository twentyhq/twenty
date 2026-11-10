import { isDefined, isEmptyObject, isPlainObject } from 'twenty-shared/utils';

import { type McpServerToolInputSchema } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

type JsonSchemaNode = {
  properties?: Record<string, object>;
  required?: string[];
  items?: object;
};

const asJsonSchemaNode = (schema: object | undefined): JsonSchemaNode =>
  isPlainObject(schema) ? (schema as JsonSchemaNode) : {};

// Untouched inputs are seeded with null from the tool schema and must not reach the tool, unlike user-supplied '' and [].
export const removeNullToolArguments = ({
  value,
  schema,
}: {
  value: unknown;
  schema?: McpServerToolInputSchema | object;
}): unknown => {
  const schemaNode = asJsonSchemaNode(schema);

  if (Array.isArray(value)) {
    return value.map((item) =>
      removeNullToolArguments({ value: item, schema: schemaNode.items }),
    );
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (!isDefined(entry)) {
        return [];
      }

      const cleanedEntry = removeNullToolArguments({
        value: entry,
        schema: schemaNode.properties?.[key],
      });

      if (
        isPlainObject(cleanedEntry) &&
        isEmptyObject(cleanedEntry) &&
        !(schemaNode.required ?? []).includes(key)
      ) {
        return [];
      }

      return [[key, cleanedEntry]];
    }),
  );
};
