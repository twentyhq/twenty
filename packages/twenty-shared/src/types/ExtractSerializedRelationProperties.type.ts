import { SERIALIZED_RELATION_BRAND } from './SerializedRelation.type';

export type ExtractSerializedRelationProperties<T> = T extends unknown
  ? NonNullable<
      {
        [P in keyof T]-?: [NonNullable<T[P]>] extends [never]
          ? never
          : typeof SERIALIZED_RELATION_BRAND extends keyof NonNullable<T[P]>
            ? P
            : never;
      }[keyof T]
    >
  : never;
