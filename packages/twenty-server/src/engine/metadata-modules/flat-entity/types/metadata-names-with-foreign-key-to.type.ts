import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Equal, type Expect } from 'twenty-shared/testing';

import { type ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';

type ManyToOneRelations<TMetadataName extends AllMetadataName> =
  (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[TMetadataName];

type MetadataForeignKeyTo<
  TMetadataName extends AllMetadataName,
  TTargetMetadataName extends AllMetadataName,
> = {
  [
    TRelationProperty in keyof ManyToOneRelations<TMetadataName>
  ]: ManyToOneRelations<TMetadataName>[TRelationProperty] extends {
    metadataName: TTargetMetadataName;
    foreignKey: infer TForeignKey extends string;
  }
    ? TForeignKey
    : never;
}[keyof ManyToOneRelations<TMetadataName>];

export type MetadataNamesWithForeignKeyTo<
  TTargetMetadataName extends AllMetadataName,
> = {
  [TMetadataName in AllMetadataName]: [
    MetadataForeignKeyTo<TMetadataName, TTargetMetadataName>,
  ] extends [never]
    ? never
    : TMetadataName;
}[AllMetadataName];

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<Equal<MetadataForeignKeyTo<'viewField', 'view'>, 'viewId'>>,
  Expect<
    Equal<MetadataForeignKeyTo<'workflowVersion', 'workflow'>, 'coreWorkflowId'>
  >,
  Expect<Equal<MetadataForeignKeyTo<'agent', 'view'>, never>>,
  Expect<
    Equal<Extract<MetadataNamesWithForeignKeyTo<'workflow'>, 'view'>, never>
  >,
];
