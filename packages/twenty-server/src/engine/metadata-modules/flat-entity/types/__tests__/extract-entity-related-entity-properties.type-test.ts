import { type Expect, type Equal } from 'twenty-shared/testing';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';

type FieldMetadataRelatedProperties =
  ExtractEntityRelatedEntityProperties<FieldMetadataEntity>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // FieldMetadataEntity has both ManyToOne and OneToMany relations
  // ManyToOne: object, workspace, application, relationTargetFieldMetadata, relationTargetObjectMetadata
  // OneToMany: indexFieldMetadatas, fieldPermissions, viewFields, viewFilters, kanbanAggregateOperationViews, calendarViews, mainGroupByFieldMetadataViews
  Expect<
    Equal<
      FieldMetadataRelatedProperties,
      | 'object'
      | 'workspace'
      | 'application'
      | 'relationTargetFieldMetadata'
      | 'relationTargetObjectMetadata'
      | 'indexFieldMetadatas'
      | 'fieldPermissions'
      | 'viewFields'
      | 'viewFilters'
      | 'kanbanAggregateOperationViews'
      | 'calendarViews'
      | 'mainGroupByFieldMetadataViews'
    >
  >,
];
