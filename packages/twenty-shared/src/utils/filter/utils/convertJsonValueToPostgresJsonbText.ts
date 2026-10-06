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

const formatNumberAsDecimal = (value: number): string => {
  const [mantissa = '', exponentText] = String(value).split('e');

  if (exponentText === undefined) {
    return mantissa;
  }

  const sign = mantissa.startsWith('-') ? '-' : '';
  const [integerDigits = '', fractionDigits = ''] = mantissa
    .replace('-', '')
    .split('.');
  const digits = integerDigits + fractionDigits;
  const decimalPointIndex = integerDigits.length + Number(exponentText);

  if (decimalPointIndex <= 0) {
    return `${sign}0.${'0'.repeat(-decimalPointIndex)}${digits}`;
  }

  if (decimalPointIndex >= digits.length) {
    return `${sign}${digits}${'0'.repeat(decimalPointIndex - digits.length)}`;
  }

  return `${sign}${digits.slice(0, decimalPointIndex)}.${digits.slice(decimalPointIndex)}`;
};

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

  if (typeof jsonValue === 'number') {
    return formatNumberAsDecimal(jsonValue);
  }

  return JSON.stringify(jsonValue);
};

export const convertJsonValueToPostgresJsonbText = (jsonValue: unknown) => {
  if (jsonValue === undefined) {
    return 'null';
  }

  return formatAsJsonbText(JSON.parse(JSON.stringify(jsonValue)));
};
