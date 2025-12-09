export type ExtractRecordTypeOrmNullableDateProperties<T> = NonNullable<
  {
    [P in keyof T]: null extends T[P]
      ? NonNullable<T[P]> extends Date
        ? P
        : never
      : never;
  }[keyof T]
>;
