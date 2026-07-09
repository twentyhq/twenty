import { evalFromContext } from '@/utils/evalFromContext';
import { isDefined } from '@/utils/validation';

const escapeJsonStringContent = (text: string): string => {
  return JSON.stringify(text).slice(1, -1);
};

const isEscapedQuote = (text: string, quoteIndex: number): boolean => {
  let backslashCount = 0;
  let cursor = quoteIndex - 1;

  while (cursor >= 0 && text[cursor] === '\\') {
    backslashCount += 1;
    cursor -= 1;
  }

  return backslashCount % 2 === 1;
};

const encodeResolvedValue = (value: unknown, insideString: boolean): string => {
  if (insideString) {
    const textValue = !isDefined(value)
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);

    return escapeJsonStringContent(textValue);
  }

  return JSON.stringify(isDefined(value) ? value : null);
};

export const resolveJsonBodyVariables = (
  jsonBody: string,
  context: Record<string, unknown>,
): string => {
  let result = '';
  let insideString = false;
  let index = 0;

  while (index < jsonBody.length) {
    if (jsonBody.startsWith('{{', index)) {
      const closingIndex = jsonBody.indexOf('}}', index + 2);

      if (closingIndex !== -1) {
        const token = jsonBody.slice(index, closingIndex + 2);
        const resolvedValue = evalFromContext(token, context);

        result += encodeResolvedValue(resolvedValue, insideString);
        index = closingIndex + 2;
        continue;
      }
    }

    const character = jsonBody[index];

    if (character === '"' && !isEscapedQuote(jsonBody, index)) {
      insideString = !insideString;
    }

    result += character;
    index += 1;
  }

  return result;
};
