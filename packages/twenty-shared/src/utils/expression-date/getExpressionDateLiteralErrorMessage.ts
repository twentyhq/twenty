export const getExpressionDateLiteralErrorMessage = ({
  value,
  kind,
  allowedValues,
}: {
  value: unknown;
  kind: 'unit' | 'part';
  allowedValues: readonly string[];
}): string => {
  const quotedValues = allowedValues.map((allowedValue) => `'${allowedValue}'`);

  return `${JSON.stringify(value) ?? String(value)} is not a date ${kind}: use ${quotedValues.slice(0, -1).join(', ')} or ${quotedValues[quotedValues.length - 1]}`;
};
