import { type Equal, type Expect } from 'twenty-shared/testing';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

type FieldMetadataOneToManyRelations =
  ExtractEntityOneToManyEntityRelationProperties<FieldMetadataEntity>;

type FieldMetadataOneToManySyncableRelations =
  ExtractEntityOneToManyEntityRelationProperties<
    FieldMetadataEntity,
    SyncableEntity
  >;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // FieldMetadataEntity OneToMany relations (all targets):
  // - indexFieldMetadatas, fieldPermissions, viewFields, viewFilters,
  // - kanbanAggregateOperationViews, calendarViews, mainGroupByFieldMetadataViews
  Expect<
    Equal<
      FieldMetadataOneToManyRelations,
      | 'indexFieldMetadatas'
      | 'fieldPermissions'
      | 'viewFields'
      | 'viewFilters'
      | 'kanbanAggregateOperationViews'
      | 'calendarViews'
      | 'mainGroupByFieldMetadataViews'
    >
  >,

  // When filtered by SyncableEntity target, only syncable relations are included
  Expect<
    Equal<
      FieldMetadataOneToManySyncableRelations,
      | 'viewFields'
      | 'viewFilters'
      | 'kanbanAggregateOperationViews'
      | 'calendarViews'
      | 'mainGroupByFieldMetadataViews'
    >
  >,
];
