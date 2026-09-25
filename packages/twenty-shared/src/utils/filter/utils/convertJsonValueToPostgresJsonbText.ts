import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const textEncoder = new TextEncoder();

const compareJsonbKeys = (leftKey: string, rightKey: string) => {
  const leftBytes = textEncoder.encode(leftKey);
  const rightBytes = textEncoder.encode(rightKey);

  if (leftBytes.length !== rightBytes.length) {
    return leftBytes.length - rightBytes.length;
  }

  for (let index = 0; index < leftBytes.length; index++) {
    if (leftBytes[index] !== rightBytes[index]) {
      return leftBytes[index] - rightBytes[index];
    }
  }

  return 0;
};

const formatAsJsonbText = (jsonValue: unknown): string => {
  if (Array.isArray(jsonValue)) {
    return `[${jsonValue.map(formatAsJsonbText).join(', ')}]`;
  }

  if (isPlainObject(jsonValue)) {
    const formattedEntries = Object.keys(jsonValue)
      .sort(compareJsonbKeys)
      .map(
        (key) => `${JSON.stringify(key)}: ${formatAsJsonbText(jsonValue[key])}`,
      );

    return `{${formattedEntries.join(', ')}}`;
  }

  return JSON.stringify(jsonValue);
};

export const convertJsonValueToPostgresJsonbText = (jsonValue: unknown) =>
  formatAsJsonbText(JSON.parse(JSON.stringify(jsonValue)));
