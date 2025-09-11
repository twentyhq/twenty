export type ExtractNestedStringValues<T> =
  T extends Record<string, infer U>
    ? U extends string
      ? U
      : U extends Record<string, infer V>
        ? V extends string
          ? V
          : never
        : never
    : never;
