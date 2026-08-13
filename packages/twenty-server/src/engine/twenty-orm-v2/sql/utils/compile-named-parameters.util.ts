import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';

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
      throw new TwentyOrmV2Exception(
        `Parameter ":${parameterName}" is referenced by the query but was never provided`,
        TwentyOrmV2ExceptionCode.MISSING_PARAMETER,
      );
    }

    const parameterValue = parameters[parameterName];

    if (isSpread) {
      if (!Array.isArray(parameterValue)) {
        throw new TwentyOrmV2Exception(
          `Parameter ":...${parameterName}" expects an array`,
          TwentyOrmV2ExceptionCode.INVALID_PARAMETER,
        );
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

  throw new TwentyOrmV2Exception(
    `Unterminated ${quote === "'" ? 'string literal' : 'quoted identifier'} in SQL`,
    TwentyOrmV2ExceptionCode.MALFORMED_SQL,
  );
};
