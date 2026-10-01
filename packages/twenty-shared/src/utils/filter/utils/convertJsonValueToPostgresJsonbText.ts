import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const textEncoder = new TextEncoder();

const compareJsonbKeyBytes = (
  leftBytes: Uint8Array,
  rightBytes: Uint8Array,
) => {
  if (leftBytes.length !== rightBytes.length) {
    return leftBytes.length - rightBytes.length;
  }

  for (const [index, leftByte] of leftBytes.entries()) {
    const rightByte = rightBytes[index] ?? 0;

    if (leftByte !== rightByte) {
      return leftByte - rightByte;
    }
  }

  return 0;
};

const sortKeysInJsonbOrder = (keys: string[]) =>
  keys
    .map((key) => ({ key, bytes: textEncoder.encode(key) }))
    .sort((left, right) => compareJsonbKeyBytes(left.bytes, right.bytes))
    .map(({ key }) => key);

const formatAsJsonbText = (jsonValue: unknown): string => {
  if (Array.isArray(jsonValue)) {
    return `[${jsonValue.map(formatAsJsonbText).join(', ')}]`;
  }

  if (isPlainObject(jsonValue)) {
    const formattedEntries = sortKeysInJsonbOrder(Object.keys(jsonValue)).map(
      (key) => `${JSON.stringify(key)}: ${formatAsJsonbText(jsonValue[key])}`,
    );

    return `{${formattedEntries.join(', ')}}`;
  }

  return JSON.stringify(jsonValue);
};

export const convertJsonValueToPostgresJsonbText = (jsonValue: unknown) =>
  formatAsJsonbText(JSON.parse(JSON.stringify(jsonValue)));
