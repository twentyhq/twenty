// export interface FieldMetadataInterface<
//   T extends FieldMetadataType = FieldMetadataType,
// > {
//   id: string;
//   type: T;
//   name: string;
//   label: string;
//   defaultValue?: FieldMetadataDefaultValue<T>;
//   options?: FieldMetadataOptions<T>;
//   settings?: FieldMetadataSettings<T>;
//   objectMetadataId: string;
//   workspaceId?: string;
//   description?: string;
//   icon?: string;
//   isNullable: boolean;
//   isUnique?: boolean;
//   relationTargetFieldMetadataId?: string;
//   relationTargetFieldMetadata?: FieldMetadataInterface;
//   relationTargetObjectMetadataId?: string;
//   relationTargetObjectMetadata?: ObjectMetadataInterface;
//   relation?: RelationDTO;
//   isCustom?: boolean;
//   isSystem?: boolean;
//   isActive?: boolean;
//   generatedType?: 'STORED' | 'VIRTUAL';
//   asExpression?: string;
//   isLabelSyncedWithName: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataType } from 'twenty-shared/types';

export type FieldMetadataInterface<
  T extends FieldMetadataType = FieldMetadataType,
> = FieldMetadataEntity<T>;
