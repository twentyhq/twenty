import { CastRecordTypeOrmDatePropertiesToString } from "src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type";

export type UniversalFlatEntityFrom<
  TEntity,
  TEntityRelationProperties extends keyof TEntity,
> = Omit<
  TEntity,
  | TEntityRelationProperties
  | 'application'
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity>;
