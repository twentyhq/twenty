import { type FieldMetadataType } from 'twenty-shared/types';

type FieldMetadataTypesNotTested =
  | 'TS_VECTOR'
  | 'RICH_TEXT'
  | 'POSITION'
  | 'ACTOR'
  | 'MORPH_RELATION'
  | 'NUMERIC'
  | 'RICH_TEXT_V2';

export type FieldMetadataTypeToTest = Exclude<
  FieldMetadataType,
  FieldMetadataTypesNotTested
>;
