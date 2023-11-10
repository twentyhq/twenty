import { FieldMetadataTargetColumnMap } from 'src/tenant/schema-builder/interfaces/field-metadata-target-column-map.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';

export interface FieldMetadataInterface<
  T extends FieldMetadataType | 'default' = 'default',
> {
  id: string;
  type: FieldMetadataType;
  name: string;
  label: string;
  targetColumnMap: FieldMetadataTargetColumnMap<T>;
  objectMetadataId: string;
  description?: string;
  isNullable?: boolean;
  fromRelationMetadata?: RelationMetadataEntity;
  toRelationMetadata?: RelationMetadataEntity;
}
