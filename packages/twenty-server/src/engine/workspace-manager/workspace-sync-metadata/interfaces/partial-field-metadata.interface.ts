import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { WorkspaceDynamicRelationMetadataArgsFactory } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type PartialFieldMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = Omit<
  FieldMetadataInterface<T>,
  'id' | 'label' | 'description' | 'objectMetadataId'
> & {
  standardId: string;
  label: string | ((objectMetadata: ObjectMetadataEntity) => string);
  description?: string | ((objectMetadata: ObjectMetadataEntity) => string);
  icon?: string;
  isSystem?: boolean;
  workspaceId: string;
  objectMetadataId?: string;
  isActive?: boolean;
  asExpression?: string;
  generatedType?: 'STORED' | 'VIRTUAL';
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
