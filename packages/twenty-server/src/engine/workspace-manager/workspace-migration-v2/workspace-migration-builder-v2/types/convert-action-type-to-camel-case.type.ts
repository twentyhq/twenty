export type ConvertActionTypeToCamelCase<T extends string> =
  T extends `${infer Before}_${infer After}`
    ? `${Before}${Capitalize<After>}`
    : T;
