import {
  IsEmptyObject,
  IsNever,
  IsSerializedRelation,
} from 'twenty-shared/types';

type ContainsSerializedRelationInner<T> = T extends unknown
  ? IsNever<T> extends true
    ? false
    : unknown extends T
      ? false
      : IsSerializedRelation<T> extends true
        ? true
        : T extends readonly (infer U)[]
          ? ContainsSerializedRelationInner<U>
          : T extends object
            ? IsEmptyObject<T> extends true
              ? false
              : ContainsSerializedRelationInner<T[keyof T]>
            : false
  : never;

export type ContainsSerializedRelation<T> =
  true extends ContainsSerializedRelationInner<T> ? true : false;
