import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type CachedFieldMetadataEntity<
  T extends FieldMetadataType = FieldMetadataType,
> = Omit<FieldMetadataEntity<T>, FieldMetadataEntityRelationProperties>;
