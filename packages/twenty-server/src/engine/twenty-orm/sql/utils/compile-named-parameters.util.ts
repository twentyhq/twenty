import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export type NamedParameters = Record<string, unknown>;

export type CompiledStatement = {
  text: string;
  values: unknown[];
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
  let pendingTextStartIndex = 0;

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

  // Kept out of the loop body: a closure there capturing a loop-scoped const
  // makes V8 allocate a block context on every scanned character
  const appendSpreadValues = (parameterName: string, items: unknown[]) =>
    items
      .map((item, itemIndex) =>
        appendValue(buildSpreadItemKey(parameterName, itemIndex), item),
      )
      .join(', ');

  while (index < sql.length) {
    const character = sql[index];

    if (character === "'" || character === '"') {
      index = findClosingQuoteIndex(sql, index, character) + 1;
      continue;
    }

    if (character === ':' && sql[index + 1] === ':') {
      index += 2;
      continue;
    }

    if (character !== ':') {
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
      index += 1;
      continue;
    }

    const parameterName = sql.slice(nameStartIndex, nameEndIndex);

    if (!(parameterName in parameters)) {
      throw new TwentyOrmException(
        `Parameter ":${parameterName}" is referenced by the query but was never provided`,
        TwentyOrmExceptionCode.MISSING_PARAMETER,
      );
    }

    const parameterValue = parameters[parameterName];

    text += sql.slice(pendingTextStartIndex, index);

    if (isSpread) {
      if (!Array.isArray(parameterValue)) {
        throw new TwentyOrmException(
          `Parameter ":...${parameterName}" expects an array`,
          TwentyOrmExceptionCode.INVALID_PARAMETER,
        );
      }

      if (parameterValue.length === 0) {
        text += 'NULL';
      } else {
        text += appendSpreadValues(parameterName, parameterValue);
      }
    } else {
      text += appendValue(parameterName, parameterValue);
    }

    index = nameEndIndex;
    pendingTextStartIndex = index;
  }

  text += sql.slice(pendingTextStartIndex);

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

  throw new TwentyOrmException(
    `Unterminated ${quote === "'" ? 'string literal' : 'quoted identifier'} in SQL`,
    TwentyOrmExceptionCode.MALFORMED_SQL,
  );
};
