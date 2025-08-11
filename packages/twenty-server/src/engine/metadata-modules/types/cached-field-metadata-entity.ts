import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FieldMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type CachedFieldMetadataEntity<
  T extends FieldMetadataType = FieldMetadataType,
> = Omit<FieldMetadataEntity<T>, FieldMetadataEntityRelationProperties>;
