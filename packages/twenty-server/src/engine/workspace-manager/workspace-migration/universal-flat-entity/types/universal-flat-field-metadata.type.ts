import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type UnusedFieldMetadataColumnName } from 'src/engine/metadata-modules/field-metadata/types/unused-field-metadata-column-name.type';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = UniversalFlatEntityFrom<
  Omit<FieldMetadataEntity<T>, UnusedFieldMetadataColumnName>,
  'fieldMetadata'
>;
