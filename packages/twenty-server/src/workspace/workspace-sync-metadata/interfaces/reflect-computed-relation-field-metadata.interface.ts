import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

import { ReflectObjectMetadata } from './reflect-object-metadata.interface';

export type ComputedRelationFieldMetadataDecoratorParams = (
  objectMetadata: ReflectObjectMetadata,
) => {
  name: string;
  label: string;
  joinColumn: string;
  description?: string;
  icon?: string;
};

export interface ReflectComputedRelationFieldMetadata {
  type: FieldMetadataType.RELATION;
  factory: ComputedRelationFieldMetadataDecoratorParams;
  isNullable: boolean;
  isSystem: boolean;
  isCustom: boolean;
  gate?: GateDecoratorParams;
}
