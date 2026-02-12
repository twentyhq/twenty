import { type Equal, type Expect } from 'twenty-shared/testing';

import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';

type FieldMetadataJoinColumns = MetadataManyToOneJoinColumn<'fieldMetadata'>;

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
];
