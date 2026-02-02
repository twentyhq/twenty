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

// Any narrowed flatFieldMetadata type should be assignable to non narrowed flatFieldMetadata
type AbstractFlatFieldMetadata = FlatFieldMetadata<FieldMetadataType>;

const _assertion: Record<string, AbstractFlatFieldMetadata> = {
  // Primitive types
  uuid: {} as FlatFieldMetadata<FieldMetadataType.UUID>,
  text: {} as FlatFieldMetadata<FieldMetadataType.TEXT>,
  number: {} as FlatFieldMetadata<FieldMetadataType.NUMBER>,
  boolean: {} as FlatFieldMetadata<FieldMetadataType.BOOLEAN>,
  numeric: {} as FlatFieldMetadata<FieldMetadataType.NUMERIC>,
  position: {} as FlatFieldMetadata<FieldMetadataType.POSITION>,

  // Date types
  date: {} as FlatFieldMetadata<FieldMetadataType.DATE>,
  dateTime: {} as FlatFieldMetadata<FieldMetadataType.DATE_TIME>,

  // Complex types
  currency: {} as FlatFieldMetadata<FieldMetadataType.CURRENCY>,
  fullName: {} as FlatFieldMetadata<FieldMetadataType.FULL_NAME>,
  address: {} as FlatFieldMetadata<FieldMetadataType.ADDRESS>,
  links: {} as FlatFieldMetadata<FieldMetadataType.LINKS>,
  emails: {} as FlatFieldMetadata<FieldMetadataType.EMAILS>,
  phones: {} as FlatFieldMetadata<FieldMetadataType.PHONES>,
  actor: {} as FlatFieldMetadata<FieldMetadataType.ACTOR>,

  // Select types
  rating: {} as FlatFieldMetadata<FieldMetadataType.RATING>,
  select: {} as FlatFieldMetadata<FieldMetadataType.SELECT>,
  multiSelect: {} as FlatFieldMetadata<FieldMetadataType.MULTI_SELECT>,

  // JSON/Array types
  rawJson: {} as FlatFieldMetadata<FieldMetadataType.RAW_JSON>,
  array: {} as FlatFieldMetadata<FieldMetadataType.ARRAY>,
  richText: {} as FlatFieldMetadata<FieldMetadataType.RICH_TEXT>,
  richTextV2: {} as FlatFieldMetadata<FieldMetadataType.RICH_TEXT_V2>,

  // Relation types
  relation: {} as FlatFieldMetadata<FieldMetadataType.RELATION>,
  morphRelation: {} as FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,

  // Special types
  files: {} as FlatFieldMetadata<FieldMetadataType.FILES>,
  tsVector: {} as FlatFieldMetadata<FieldMetadataType.TS_VECTOR>,
};
