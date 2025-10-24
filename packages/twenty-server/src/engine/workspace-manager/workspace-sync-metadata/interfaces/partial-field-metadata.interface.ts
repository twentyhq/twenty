import {
  type ExcludeFunctions,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { type WorkspaceDynamicRelationMetadataArgsFactory } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

// Should get deprecated in favor of the FlatFieldMetadata
export type PartialFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = Pick<
  FieldMetadataEntity<T>,
  | 'type'
  | 'name'
  | 'defaultValue'
  | 'standardOverrides'
  | 'options'
  | 'settings'
  | 'isCustom'
  | 'isUIReadOnly'
  | 'isNullable'
  | 'isUnique'
  | 'isLabelSyncedWithName'
  | 'relationTargetFieldMetadataId'
  | 'relationTargetFieldMetadata'
  | 'relationTargetObjectMetadataId'
  | 'relationTargetObjectMetadata'
  | 'morphId'
> & {
  standardId: string;
  label: string | ((objectMetadata: ObjectMetadataEntity) => string);
  description?: string | ((objectMetadata: ObjectMetadataEntity) => string);
  icon?: string;
  isSystem?: boolean;
  workspaceId: string;
  objectMetadataId?: string;
  isActive?: boolean;
  asExpression?: string; // not accurate
  generatedType?: 'STORED' | 'VIRTUAL'; // not accurate
};

export type PartialComputedFieldMetadata = {
  type: FieldMetadataType.RELATION;
  argsFactory: WorkspaceDynamicRelationMetadataArgsFactory;
  isNullable?: boolean;
  isSystem?: boolean;
  isCustom: boolean;
  workspaceId: string;
  objectMetadataId?: string;
};

export type ComputedPartialFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = {
  [K in keyof PartialFieldMetadata<T>]: ExcludeFunctions<
    PartialFieldMetadata<T>[K]
  >;
};
