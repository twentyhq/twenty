import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { RelationMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-metadata.interface';

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
  icon?: string;
  isNullable?: boolean;
  isUnique?: boolean;
  fromRelationMetadata?: RelationMetadataInterface;
  toRelationMetadata?: RelationMetadataInterface;
  relationTargetFieldMetadataId?: string;
  relationTargetFieldMetadata?: FieldMetadataInterface;
  relationTargetObjectMetadataId?: string;
  relationTargetObjectMetadata?: ObjectMetadataInterface;
  isCustom?: boolean;
  isSystem?: boolean;
  isActive?: boolean;
  generatedType?: 'STORED' | 'VIRTUAL';
  asExpression?: string;
}
