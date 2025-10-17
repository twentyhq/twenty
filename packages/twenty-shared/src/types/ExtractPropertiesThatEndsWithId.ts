export type ExtractPropertiesThatEndsWithId<T, TExcluded extends keyof T> = {
  [K in keyof T]: K extends `${infer _}Id`
    ? K extends TExcluded
      ? never
      : T[K] extends string | null | undefined
        ? K
        : never
    : never;
}[keyof T];
