import { type Expect, type HasAllProperties } from 'twenty-shared/testing';
import {
  type FieldMetadataType,
  type NullablePartial,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Relation field types have defined relation IDs
type DefinedRelationIdRecord = {
  relationTargetFieldMetadataId: string;
  relationTargetObjectMetadataId: string;
};

// Non-relation field types have never | null relation IDs
type NotDefinedRelationIdRecord = {
  relationTargetFieldMetadataId: never | null;
  relationTargetObjectMetadataId: never | null;
};

// Date properties are cast to strings
type DatePropertiesCastToString = {
  createdAt: string;
  updatedAt: string;
};

// OneToMany relations become ...Ids arrays
type OneToManyRelationIdArrays = {
  viewFieldIds: string[];
  viewFilterIds: string[];
  kanbanAggregateOperationViewIds: string[];
  calendarViewIds: string[];
  mainGroupByFieldMetadataViewIds: string[];
};

// eslint-disable-next-line unused-imports/no-unused-vars
type RelationIdAssertions = [
  // Non-relation types have undefined relation IDs
  Expect<
    HasAllProperties<
      FlatFieldMetadata<FieldMetadataType.UUID>,
      NotDefinedRelationIdRecord
    >
  >,

  // Relation types have defined relation IDs
  Expect<
    HasAllProperties<
      FlatFieldMetadata<FieldMetadataType.RELATION>,
      DefinedRelationIdRecord
    >
  >,
  Expect<
    HasAllProperties<
      FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
      DefinedRelationIdRecord
    >
  >,

  // Abstract type has nullable partial relation IDs
  Expect<
    HasAllProperties<
      FlatFieldMetadata,
      NullablePartial<DefinedRelationIdRecord>
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type FlatTransformationAssertions = [
  Expect<HasAllProperties<FlatFieldMetadata, DatePropertiesCastToString>>,
  Expect<HasAllProperties<FlatFieldMetadata, OneToManyRelationIdArrays>>,
];
