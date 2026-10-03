export const isEnumValue = <TEnumValue extends string>(
  enumObject: Record<string, TEnumValue>,
  value: unknown,
): value is TEnumValue => Object.values<unknown>(enumObject).includes(value);
