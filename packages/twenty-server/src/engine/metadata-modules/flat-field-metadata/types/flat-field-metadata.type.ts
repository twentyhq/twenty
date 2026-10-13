import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

type BaseFlatFieldMetadata<T extends FieldMetadataType> = FlatEntityFrom<
  Omit<
    FieldMetadataEntity<T>,
    'relationTargetFieldMetadata' | 'relationTargetObjectMetadata'
  >,
  'fieldMetadata'
>;

export type FlatFieldMetadata<T extends FieldMetadataType = FieldMetadataType> =
  BaseFlatFieldMetadata<T> &
    ([T] extends [FieldMetadataType.MORPH_RELATION]
      ?
          | {
              relationTargetFieldMetadataId: null;
              relationTargetObjectMetadataId: null;
              relationTargetFieldMetadataUniversalIdentifier: null;
              relationTargetObjectMetadataUniversalIdentifier: null;
            }
          | {
              relationTargetFieldMetadataId: string;
              relationTargetObjectMetadataId: string;
              relationTargetFieldMetadataUniversalIdentifier: string;
              relationTargetObjectMetadataUniversalIdentifier: string;
            }
      : unknown);
