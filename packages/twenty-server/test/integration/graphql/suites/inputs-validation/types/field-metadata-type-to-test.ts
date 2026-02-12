import { type FieldMetadataType } from 'twenty-shared/types';

type FieldMetadataTypesNotTestedForFilterInputValidation =
  | 'TS_VECTOR'
  | 'RICH_TEXT'
  | 'POSITION'
  | 'ACTOR'
  | 'NUMERIC'
  | 'RICH_TEXT_V2';

type FieldMetadataTypesNotTestedForCreateInputValidation =
  | 'TS_VECTOR'
  | 'ACTOR'
  | 'NUMERIC';

export type FieldMetadataTypesToTestForCreateInputValidation = Exclude<
  FieldMetadataType,
  FieldMetadataTypesNotTestedForCreateInputValidation
>;

export type FieldMetadataTypesToTestForFilterInputValidation = Exclude<
  FieldMetadataType,
  FieldMetadataTypesNotTestedForFilterInputValidation
>;
