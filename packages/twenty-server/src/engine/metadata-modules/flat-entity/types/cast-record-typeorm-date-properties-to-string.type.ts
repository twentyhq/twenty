import { type IsWasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';

type IsTypeOrmDateProperty<TValue> = [TValue] extends [never]
  ? false
  : [NonNullable<TValue>] extends [never]
    ? false
    : NonNullable<TValue> extends Date
      ? true
      : false;

type DateAsString<TValue> = null extends TValue ? string | null : string;

type CastDateProperties<T> = {
  [
    P in keyof T as IsTypeOrmDateProperty<T[P]> extends true
      ? IsWasRemovedInUpgrade<T[P]> extends true
        ? never
        : P
      : never
  ]: DateAsString<T[P]>;
} & {
  [
    P in keyof T as IsTypeOrmDateProperty<T[P]> extends true
      ? IsWasRemovedInUpgrade<T[P]> extends true
        ? P
        : never
      : never
  ]?: DateAsString<T[P]>;
};

export type CastRecordTypeOrmDatePropertiesToString<T> = {
  [P in keyof CastDateProperties<T>]: CastDateProperties<T>[P];
};
