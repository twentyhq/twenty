import { Relation } from 'typeorm';

export type ExtractRecordTypeOrmRelationProperties<T, TRelationTargets> =
  NonNullable<
    {
      [P in keyof T]: T[P] extends Relation<
        TRelationTargets | TRelationTargets[]
      >
        ? P
        : never;
    }[keyof T]
  >;
