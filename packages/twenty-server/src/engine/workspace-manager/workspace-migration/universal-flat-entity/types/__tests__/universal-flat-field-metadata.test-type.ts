import {
  type Equal,
  type Expect,
  type HasAllProperties,
} from 'twenty-shared/testing';
import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
  type FieldNumberVariant,
  type LinkMetadata,
  type NullablePartial,
  type NumberDataType,
  type RelationOnDeleteAction,
  type RelationType,
  type SerializedRelation,
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

type NarrowedTestCase =
  UniversalFlatFieldMetadata<FieldMetadataType.RELATION>['settings'];

type NarrowedExpectedResult = {
  relationType: RelationType;
  onDelete?: RelationOnDeleteAction | undefined;
  joinColumnName?: string | null | undefined;
  junctionTargetFieldUniversalIdentifier?: SerializedRelation | undefined;
  __JsonbPropertyBrand__?: undefined;
};

type SettingsTestCase = UniversalFlatFieldMetadata<
  FieldMetadataType.RELATION | FieldMetadataType.NUMBER | FieldMetadataType.TEXT
>['settings'];

type SettingsExpectedResult =
  | {
      relationType: RelationType;
      onDelete?: RelationOnDeleteAction | undefined;
      joinColumnName?: string | null | undefined;
      junctionTargetFieldUniversalIdentifier?: SerializedRelation | undefined;
      __JsonbPropertyBrand__?: undefined;
    }
  | {
      dataType?: NumberDataType | undefined;
      decimals?: number | undefined;
      type?: FieldNumberVariant | undefined;
      __JsonbPropertyBrand__?: undefined;
    }
  | {
      displayedMaxRows?: number | undefined;
      __JsonbPropertyBrand__?: undefined;
    }
  | null;

type DefaultValueTestCase = UniversalFlatFieldMetadata<
  | FieldMetadataType.RELATION
  | FieldMetadataType.NUMBER
  | FieldMetadataType.TEXT
  | FieldMetadataType.LINKS
  | FieldMetadataType.CURRENCY
>['defaultValue'];

type DefaultValueExpectedResult =
  | string
  | number
  | null
  | {
      amountMicros: string | null;
      currencyCode: string | null;
      __JsonbPropertyBrand__?: undefined;
    }
  | {
      primaryLinkLabel: string | null;
      primaryLinkUrl: string | null;
      secondaryLinks: LinkMetadata[] | null;
      __JsonbPropertyBrand__?: undefined;
    };

type OptionsTestCase =
  UniversalFlatFieldMetadata<FieldMetadataType.RATING>['options'];

type OptionsExpectedResult = FieldMetadataDefaultOption[];

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<Equal<SettingsTestCase, SettingsExpectedResult>>,
  Expect<Equal<NarrowedTestCase, NarrowedExpectedResult>>,
  Expect<Equal<DefaultValueTestCase, DefaultValueExpectedResult>>,
  Expect<Equal<OptionsTestCase, OptionsExpectedResult>>,
];
