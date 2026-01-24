import {
  Equal,
  type Expect,
  type HasAllProperties,
} from 'twenty-shared/testing';
import {
  FieldNumberVariant,
  LinkMetadata,
  NumberDataType,
  RelationOnDeleteAction,
  RelationType,
  SerializedRelation,
  type FieldMetadataType,
  type NullablePartial,
} from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { Prettify } from 'zod/v4/core/util.cjs';

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

type NarrowedTestCase = Prettify<
  UniversalFlatFieldMetadata<FieldMetadataType.RELATION>['settings']
>;
type NarrowedExpectedResult = {
  relationType: RelationType;
  onDelete?: RelationOnDeleteAction | undefined;
  joinColumnName?: string | null | undefined;
  junctionTargetFieldUniversalIdentifier?: SerializedRelation | undefined;
};

type SettingsTestCase = Prettify<
  UniversalFlatFieldMetadata<
    | FieldMetadataType.RELATION
    | FieldMetadataType.NUMBER
    | FieldMetadataType.TEXT
  >['settings']
>;
type SettingsExpectedResult =
  | {
      relationType: RelationType;
      onDelete?: RelationOnDeleteAction | undefined;
      joinColumnName?: string | null | undefined;
      junctionTargetFieldUniversalIdentifier?: SerializedRelation | undefined;
    }
  | {
      dataType?: NumberDataType | undefined;
      decimals?: number | undefined;
      type?: FieldNumberVariant | undefined;
    }
  | {
      displayedMaxRows?: number | undefined;
    }
  | null;

type DefaultValueTestCase = Prettify<
  UniversalFlatFieldMetadata<
    | FieldMetadataType.RELATION
    | FieldMetadataType.NUMBER
    | FieldMetadataType.TEXT
    | FieldMetadataType.LINKS
    | FieldMetadataType.CURRENCY
  >['defaultValue']
>;
type DefaultValueExpectedResult =
  | string
  | number
  | null
  | {
      amountMicros: string | null;
      currencyCode: string | null;
    }
  | {
      primaryLinkLabel: string | null;
      primaryLinkUrl: string | null;
      secondaryLinks: LinkMetadata[] | null;
    };

type Assertions = [
  Expect<Equal<SettingsTestCase, SettingsExpectedResult>>,
  Expect<Equal<NarrowedTestCase, NarrowedExpectedResult>>,
  Expect<Equal<DefaultValueTestCase, DefaultValueExpectedResult>>,
];
