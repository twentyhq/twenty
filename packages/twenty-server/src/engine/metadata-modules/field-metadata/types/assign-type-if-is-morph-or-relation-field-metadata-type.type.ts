import { AssignIfIsGivenFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/assign-if-is-given-field-metadata-type.type';
import { MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FieldMetadataType } from 'twenty-shared/types';

export type AssignTypeIfIsMorphOrRelationFieldMetadataType<
  TTypeToAssign,
  TFieldMetadataType extends FieldMetadataType,
> = AssignIfIsGivenFieldMetadataType<
  TTypeToAssign,
  TFieldMetadataType,
  MorphOrRelationFieldMetadataType
>;
