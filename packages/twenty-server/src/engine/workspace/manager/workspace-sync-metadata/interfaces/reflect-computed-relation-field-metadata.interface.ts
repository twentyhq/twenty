import { GateDecoratorParams } from 'src/engine/workspace/manager/workspace-sync-metadata/interfaces/gate-decorator.interface';

import { FieldMetadataType } from 'src/engine/api/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/api/metadata/object-metadata/object-metadata.entity';

export type DynamicRelationFieldMetadataDecoratorParams = (
  oppositeObjectMetadata: ObjectMetadataEntity,
) => {
  standardId: string;
  name: string;
  label: string;
  joinColumn: string;
  description?: string;
  icon?: string;
};

export interface ReflectDynamicRelationFieldMetadata {
  type: FieldMetadataType.RELATION;
  paramsFactory: DynamicRelationFieldMetadataDecoratorParams;
  isNullable: boolean;
  isSystem: boolean;
  isCustom: boolean;
  gate?: GateDecoratorParams;
}
