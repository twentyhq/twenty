import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { UniversalFlatEntityFrom } from 'src/engine/metadata-modules/universal-flat-entity/types/universal-flat-entity-from.type';
import { FieldMetadataType } from 'twenty-shared/types';

export type UniversalFlatFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = UniversalFlatEntityFrom<FieldMetadataEntity<T>, 'fieldMetadata'> & {
  universalIdentifier: string; // TODO remove once universalIdentifier is required on entity directly
};
