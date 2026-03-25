export type ExtractPropertiesThatEndsWithIds<T> = {
  [K in keyof T]: K extends `${infer _}Ids`
    ? T[K] extends string[]
      ? K
      : never
    : never;
}[keyof T];
