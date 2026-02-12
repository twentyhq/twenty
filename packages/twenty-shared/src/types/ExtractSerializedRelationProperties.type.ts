import { type IsSerializedRelation } from '@/types/IsSerializedRelation.type';

export type ExtractSerializedRelationProperties<T> = T extends unknown
  ? T extends object
    ? {
        [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
          ? never
          : IsSerializedRelation<NonNullable<T[P]>> extends true
            ? P
            : never;
      }[keyof T]
    : never
  : never;
