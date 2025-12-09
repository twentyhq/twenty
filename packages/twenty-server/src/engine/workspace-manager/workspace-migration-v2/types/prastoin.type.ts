export type ExtractRecordTypeOrmNonNullableDateProperties<T> = NonNullable<
  {
    [P in keyof T]: null extends T[P]
      ? never
      : [T[P]] extends [never]
        ? never
        : T[P] extends Date
          ? P
          : never;
  }[keyof T]
>;
