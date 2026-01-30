import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityFromV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from-v2.type';

export type FlatFieldMetadata<T extends FieldMetadataType = FieldMetadataType> =
  FlatEntityFromV2<
    Omit<
      FieldMetadataEntity<T>,
      'relationTargetFieldMetadata' | 'relationTargetObjectMetadata'
    >,
    'fieldMetadata'
  >;
