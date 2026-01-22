import { type Expect, type Equal } from 'twenty-shared/testing';

import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';

type FieldMetadataJoinColumns = MetadataManyToOneJoinColumn<'fieldMetadata'>;

type ViewJoinColumns = MetadataManyToOneJoinColumn<'view'>;

type ObjectMetadataJoinColumns = MetadataManyToOneJoinColumn<'objectMetadata'>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // fieldMetadata foreign keys from ALL_METADATA_RELATIONS
  Expect<
    Equal<
      FieldMetadataJoinColumns,
      | 'objectMetadataId'
      | 'relationTargetFieldMetadataId'
      | 'relationTargetObjectMetadataId'
    >
  >,

  // view foreign keys from ALL_METADATA_RELATIONS
  Expect<
    Equal<
      ViewJoinColumns,
      | 'objectMetadataId'
      | 'calendarFieldMetadataId'
      | 'kanbanAggregateOperationFieldMetadataId'
      | 'mainGroupByFieldMetadataId'
    >
  >,

  // objectMetadata has no foreign keys (only workspace/application which are null)
  Expect<Equal<ObjectMetadataJoinColumns, never>>,
];
