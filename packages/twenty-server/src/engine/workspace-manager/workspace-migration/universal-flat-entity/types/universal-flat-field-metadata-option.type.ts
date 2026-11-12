import { type FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatFieldMetadataOption = UniversalFlatEntityFrom<
  FieldMetadataOptionEntity,
  'fieldMetadataOption'
>;
