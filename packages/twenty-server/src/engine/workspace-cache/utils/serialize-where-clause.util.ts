import {
  FindOperator,
  type FindOptionsWhere,
  type ObjectLiteral,
} from 'typeorm';

const serializeWhereValue = (value: unknown): string => {
  if (value instanceof FindOperator) {
    if (value.type === 'raw') {
      throw new Error(
        'Cannot serialize a raw operator inside a rows requirement where clause: Raw() and computed predicates are not supported',
      );
    }

    return `op(${value.type}:${serializeWhereValue(value.child ?? value.value)})`;
  }

  if (value instanceof Date) {
    return `date(${value.toISOString()})`;
  }

  if (Array.isArray(value)) {
    return `[${value.map(serializeWhereValue).join(',')}]`;
  }

  if (typeof value === 'function') {
    throw new Error(
      'Cannot serialize a function inside a rows requirement where clause: Raw() and computed predicates are not supported',
    );
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    return `{${Object.keys(record)
      .sort()
      .map((key) => `${key}:${serializeWhereValue(record[key])}`)
      .join(',')}}`;
  }

  return value === undefined ? 'undefined' : JSON.stringify(value);
};

export const serializeWhereClause = (
  where: FindOptionsWhere<ObjectLiteral>,
): string => serializeWhereValue(where);
