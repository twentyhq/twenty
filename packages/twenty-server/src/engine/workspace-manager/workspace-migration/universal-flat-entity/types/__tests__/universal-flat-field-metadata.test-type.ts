import { type Expect, type HasAllProperties } from 'twenty-shared/testing';
import {
  type FieldMetadataType,
  type NullablePartial,
} from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Relation field types have defined relation universal identifiers
type DefinedRelationUniversalIdentifierRecord = {
  relationTargetFieldMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
};

// Non-relation field types have never | null relation universal identifiers
type NotDefinedRelationUniversalIdentifierRecord = {
  relationTargetFieldMetadataUniversalIdentifier: never | null;
  relationTargetObjectMetadataUniversalIdentifier: never | null;
};

// Date properties are cast to strings
type DatePropertiesCastToString = {
  createdAt: string;
  updatedAt: string;
};

// OneToMany relations become ...UniversalIdentifiers arrays
type OneToManyUniversalIdentifierArrays = {
  viewFieldUniversalIdentifiers: string[];
  viewFilterUniversalIdentifiers: string[];
  kanbanAggregateOperationViewUniversalIdentifiers: string[];
  calendarViewUniversalIdentifiers: string[];
  mainGroupByFieldMetadataViewUniversalIdentifiers: string[];
};

// Narrowed relation universal identifier assertions - verifies conditional typing is preserved
// eslint-disable-next-line unused-imports/no-unused-vars
type RelationUniversalIdentifierAssertions = [
  // Non-relation types have undefined relation universal identifiers
  Expect<
    HasAllProperties<
      UniversalFlatFieldMetadata<FieldMetadataType.UUID>,
      NotDefinedRelationUniversalIdentifierRecord
    >
  >,

  // Relation types have defined relation universal identifiers
  Expect<
    HasAllProperties<
      UniversalFlatFieldMetadata<FieldMetadataType.RELATION>,
      DefinedRelationUniversalIdentifierRecord
    >
  >,
  Expect<
    HasAllProperties<
      UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
      DefinedRelationUniversalIdentifierRecord
    >
  >,

  // Abstract type has nullable partial relation universal identifiers
  Expect<
    HasAllProperties<
      UniversalFlatFieldMetadata,
      NullablePartial<DefinedRelationUniversalIdentifierRecord>
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type UniversalFlatTransformationAssertions = [
  Expect<
    HasAllProperties<UniversalFlatFieldMetadata, DatePropertiesCastToString>
  >,
  Expect<
    HasAllProperties<
      UniversalFlatFieldMetadata,
      OneToManyUniversalIdentifierArrays
    >
  >,
];
