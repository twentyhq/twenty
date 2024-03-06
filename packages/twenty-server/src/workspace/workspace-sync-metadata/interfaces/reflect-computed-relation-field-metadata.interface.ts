import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export type ComputedRelationFieldMetadataDecoratorParams = (
  oppositeObjectMetadata: ObjectMetadataEntity,
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
