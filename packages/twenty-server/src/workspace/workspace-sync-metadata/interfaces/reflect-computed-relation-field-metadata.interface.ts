import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export type DynamicRelationFieldMetadataDecoratorParams = (
  oppositeObjectMetadata: ObjectMetadataEntity,
) => {
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
