import { type Equal, type Expect } from '@/testing';
import {
  type FieldMetadataDefaultValueMapping,
  type FIELD_METADATA_TYPES_WITHOUT_DEFAULT_VALUE,
} from '@/types/FieldMetadataDefaultValue';
import { type FieldMetadataType } from '@/types/FieldMetadataType';

type ClassifiedFieldMetadataType =
  | keyof FieldMetadataDefaultValueMapping
  | (typeof FIELD_METADATA_TYPES_WITHOUT_DEFAULT_VALUE)[number];

type Unclassified = Exclude<FieldMetadataType, ClassifiedFieldMetadataType>;
type ExtraClassified = Exclude<ClassifiedFieldMetadataType, FieldMetadataType>;

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<Equal<Unclassified, never>>,
  Expect<Equal<ExtraClassified, never>>,
];
