import { type Relation } from 'typeorm';

export type ExtractRecordTypeOrmRelationProperties<T, TRelationTargets> =
  NonNullable<
    {
      [P in keyof T]: NonNullable<T[P]> extends Relation<
        TRelationTargets | TRelationTargets[]
      >
        ? P
        : never;
    }[keyof T]
  >;
