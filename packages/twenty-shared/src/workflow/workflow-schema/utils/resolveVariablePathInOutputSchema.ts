import { isDefined, isPlainObject } from '@/utils';
import { isBoolean, isString } from 'class-validator';

export type ResolvedVariable = {
  found: boolean;
  type?: string;
  label?: string;
};

const NOT_FOUND: ResolvedVariable = { found: false };

type SchemaField = {
  isLeaf: boolean;
  type?: string;
  label?: string;
  value?: unknown;
};

const isSchemaField = (value: unknown): value is SchemaField =>
  isPlainObject(value) && isBoolean(value.isLeaf);

const isRecordOutputSchema = (
  value: unknown,
): value is { fields: Record<string, unknown> } =>
  isPlainObject(value) &&
  value['_outputSchemaType'] === 'RECORD' &&
  isPlainObject(value['fields']);

const isFindRecordsOutputSchema = (
  value: unknown,
): value is { first: SchemaField; all?: unknown; totalCount: SchemaField } =>
  isPlainObject(value) &&
  !('_outputSchemaType' in value) &&
  isSchemaField(value['first']) &&
  value['first'].isLeaf === false &&
  isRecordOutputSchema(value['first'].value) &&
  isSchemaField(value['totalCount']);

const isIteratorOutputSchema = (value: unknown): boolean =>
  isPlainObject(value) &&
  isDefined(value['currentItem']) &&
  isDefined(value['hasProcessedAllItems']);

const fieldResult = (field: SchemaField): ResolvedVariable => ({
  found: true,
  type: isString(field.type) ? field.type : undefined,
  label: isString(field.label) ? field.label : undefined,
});

const descendIntoField = (
  field: SchemaField,
  segments: string[],
): ResolvedVariable => {
  if (segments.length === 0) {
    return fieldResult(field);
  }

  return resolveInSchema(field.value, segments);
};

const resolveInFieldsMap = (
  fields: Record<string, unknown>,
  segments: string[],
): ResolvedVariable => {
  for (let length = 1; length <= segments.length; length++) {
    const candidateKey = segments.slice(0, length).join('.');
    const field = fields[candidateKey];

    if (isSchemaField(field)) {
      return descendIntoField(field, segments.slice(length));
    }
  }

  return NOT_FOUND;
};

const resolveInFindRecords = (
  schema: { first: SchemaField; totalCount: unknown },
  segments: string[],
): ResolvedVariable => {
  const [searchResultKey, ...rest] = segments;

  if (searchResultKey === 'first') {
    if (rest.length === 0) {
      return fieldResult(schema.first);
    }

    return resolveInSchema(schema.first.value, rest);
  }

  if (searchResultKey === 'all' || searchResultKey === 'totalCount') {
    const field = (schema as Record<string, unknown>)[searchResultKey];

    if (rest.length === 0 && isSchemaField(field)) {
      return fieldResult(field);
    }

    return NOT_FOUND;
  }

  return NOT_FOUND;
};

const resolveInGenericMap = (
  map: Record<string, unknown>,
  segments: string[],
): ResolvedVariable => {
  const [segment, ...rest] = segments;
  const field = map[segment];

  if (isSchemaField(field)) {
    return descendIntoField(field, rest);
  }

  if (isDefined(field)) {
    if (rest.length === 0) {
      return { found: true };
    }

    if (isPlainObject(field)) {
      return resolveInGenericMap(field, rest);
    }

    return NOT_FOUND;
  }

  return NOT_FOUND;
};

export const resolveInSchema = (
  schema: unknown,
  segments: string[],
): ResolvedVariable => {
  if (segments.length === 0 || !isPlainObject(schema)) {
    return NOT_FOUND;
  }

  if (isRecordOutputSchema(schema)) {
    return resolveInFieldsMap(schema.fields, segments);
  }

  if (isFindRecordsOutputSchema(schema)) {
    return resolveInFindRecords(schema, segments);
  }

  if (isIteratorOutputSchema(schema)) {
    return resolveInGenericMap(schema, segments);
  }

  return resolveInGenericMap(schema, segments);
};

export const resolveVariablePathInOutputSchema = ({
  schema,
  propertyPath,
}: {
  schema: unknown;
  propertyPath: string[];
}): ResolvedVariable => resolveInSchema(schema, propertyPath);

const collectFromFieldsMap = (fields: Record<string, unknown>): string[] => {
  const paths: string[] = [];

  for (const [key, field] of Object.entries(fields)) {
    if (isSchemaField(field)) {
      paths.push(key);

      if (field.isLeaf) {
        continue;
      }

      const value = field.value;

      if (isRecordOutputSchema(value)) {
        for (const sub of collectFromFieldsMap(value.fields)) {
          paths.push(`${key}.${sub}`);
        }
      } else if (isPlainObject(value)) {
        for (const sub of collectFromFieldsMap(value)) {
          paths.push(`${key}.${sub}`);
        }
      }
    } else if (isDefined(field)) {
      paths.push(key);

      if (isPlainObject(field)) {
        for (const sub of collectFromFieldsMap(field)) {
          paths.push(`${key}.${sub}`);
        }
      }
    }
  }

  return paths;
};

export const collectOutputSchemaVariablePaths = (schema: unknown): string[] => {
  if (!isPlainObject(schema)) {
    return [];
  }

  if (isRecordOutputSchema(schema)) {
    return collectFromFieldsMap(schema.fields);
  }

  if (isFindRecordsOutputSchema(schema)) {
    const paths: string[] = [];

    if (isSchemaField(schema.first)) {
      paths.push('first');

      for (const sub of collectOutputSchemaVariablePaths(schema.first.value)) {
        paths.push(`first.${sub}`);
      }
    }

    if (isDefined(schema.all)) {
      paths.push('all');
    }

    paths.push('totalCount');

    return paths;
  }

  return collectFromFieldsMap(schema);
};
