import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export interface FieldMetadataInterface<
  T extends FieldMetadataType = FieldMetadataType,
> {
  id: string;
  type: T;
  name: string;
  label: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  settings?: FieldMetadataSettings<T>;
  objectMetadataId: string;
  workspaceId?: string;
  description?: string;
  isNullable?: boolean;
  isUnique?: boolean;
  fromRelationMetadata?: RelationMetadataEntity;
  toRelationMetadata?: RelationMetadataEntity;
  relationTargetFieldMetadataId?: string;
  relationTargetFieldMetadata?: FieldMetadataEntity;
  relationTargetObjectMetadataId?: string;
  relationTargetObjectMetadata?: ObjectMetadataEntity;
  isCustom?: boolean;
  generatedType?: 'STORED' | 'VIRTUAL';
  asExpression?: string;
}
