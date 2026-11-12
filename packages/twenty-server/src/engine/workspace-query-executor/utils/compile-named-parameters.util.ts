import { type QueryConfig } from 'pg';

import {
  WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';

export type NamedParameters = Record<string, unknown>;

export type CompiledStatement = {
  text: string;
  values: unknown[];
  types?: QueryConfig['types'];
};

const PARAMETER_NAME_CHARACTER = /[A-Za-z0-9_]/;

export const compileNamedParameters = (
  sql: string,
  parameters: NamedParameters,
): CompiledStatement => {
  const values: unknown[] = [];
  const positionByParameterName = new Map<string, number>();

  let text = '';
  let index = 0;

  const buildSpreadItemKey = (parameterName: string, itemIndex: number) =>
    `:${parameterName}__${itemIndex}`;

  const appendValue = (parameterName: string, value: unknown): string => {
    const existingPosition = positionByParameterName.get(parameterName);

    if (existingPosition !== undefined) {
      return `$${existingPosition}`;
    }

    values.push(value);
    positionByParameterName.set(parameterName, values.length);

    return `$${values.length}`;
  };

  while (index < sql.length) {
    const character = sql[index];

    if (character === "'" || character === '"') {
      const closingIndex = findClosingQuoteIndex(sql, index, character);

      text += sql.slice(index, closingIndex + 1);
      index = closingIndex + 1;
      continue;
    }

    if (character === ':' && sql[index + 1] === ':') {
      text += '::';
      index += 2;
      continue;
    }

    if (character !== ':') {
      text += character;
      index += 1;
      continue;
    }

    const isSpread = sql.startsWith(':...', index);
    const nameStartIndex = index + (isSpread ? 4 : 1);
    let nameEndIndex = nameStartIndex;

    while (
      nameEndIndex < sql.length &&
      PARAMETER_NAME_CHARACTER.test(sql[nameEndIndex])
    ) {
      nameEndIndex += 1;
    }

    if (nameEndIndex === nameStartIndex) {
      text += character;
      index += 1;
      continue;
    }

    const parameterName = sql.slice(nameStartIndex, nameEndIndex);

    if (!(parameterName in parameters)) {
      throw new WorkspaceQueryExecutorException({
        message: `Parameter ":${parameterName}" is referenced by the query but was never provided`,
        code: WorkspaceQueryExecutorExceptionCode.MISSING_PARAMETER,
      });
    }

    const parameterValue = parameters[parameterName];

    if (isSpread) {
      if (!Array.isArray(parameterValue)) {
        throw new WorkspaceQueryExecutorException({
          message: `Parameter ":...${parameterName}" expects an array`,
          code: WorkspaceQueryExecutorExceptionCode.INVALID_PARAMETER,
        });
      }

      if (parameterValue.length === 0) {
        text += 'NULL';
      } else {
        text += parameterValue
          .map((item, itemIndex) =>
            appendValue(buildSpreadItemKey(parameterName, itemIndex), item),
          )
          .join(', ');
      }
    } else {
      text += appendValue(parameterName, parameterValue);
    }

    index = nameEndIndex;
  }

  return { text, values };
};

const findClosingQuoteIndex = (
  sql: string,
  openingIndex: number,
  quote: string,
): number => {
  let index = openingIndex + 1;

  while (index < sql.length) {
    if (sql[index] !== quote) {
      index += 1;
      continue;
    }

    if (sql[index + 1] === quote) {
      index += 2;
      continue;
    }

    return index;
  }

  throw new WorkspaceQueryExecutorException({
    message: `Unterminated ${quote === "'" ? 'string literal' : 'quoted identifier'} in SQL`,
    code: WorkspaceQueryExecutorExceptionCode.MALFORMED_SQL,
  });
};
