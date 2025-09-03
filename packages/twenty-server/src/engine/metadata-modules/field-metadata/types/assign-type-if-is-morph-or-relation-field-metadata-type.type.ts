import { type FieldMetadataType } from 'twenty-shared/types';

import { type AssignIfIsGivenFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-if-is-given-field-metadata-type.type';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';

export type AssignTypeIfIsMorphOrRelationFieldMetadataType<
  TTypeToAssign,
  TFieldMetadataType extends FieldMetadataType,
> = AssignIfIsGivenFieldMetadataType<
  TTypeToAssign,
  TFieldMetadataType,
  MorphOrRelationFieldMetadataType
>;
