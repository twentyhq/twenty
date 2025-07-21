import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type FieldMetadataInterface<
  T extends FieldMetadataType = FieldMetadataType,
> = FieldMetadataEntity<T>;
