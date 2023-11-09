import { FieldMetadataType } from 'src/database/typeorm/metadata/entities/field-metadata.entity';

import { FieldMetadataTargetColumnMap } from './field-metadata-target-column-map.interface';

export interface FieldMetadataInterface<
  T extends FieldMetadataType | 'default' = 'default',
> {
  id: string;
  type: FieldMetadataType;
  name: string;
  label: string;
  targetColumnMap: FieldMetadataTargetColumnMap<T>;
  description?: string;
  isNullable?: boolean;
}
