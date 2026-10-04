export const isEnumValue = <TEnumValue extends string>(
  enumValues: Readonly<Record<string, TEnumValue>> | readonly TEnumValue[],
  value: unknown,
): value is TEnumValue => Object.values<unknown>(enumValues).includes(value);
