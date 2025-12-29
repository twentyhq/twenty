import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FlatFieldMetadata<T extends FieldMetadataType = FieldMetadataType> =
  FlatEntityFrom<
    Omit<
      FieldMetadataEntity<T>,
      'relationTargetFieldMetadata' | 'relationTargetObjectMetadata'
    >
  > & {
    universalIdentifier: string; // TODO remove once universalIdentifier is required on entity directly
  };
