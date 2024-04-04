import { ObjectType } from 'typeorm';

import { GateDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/gate-decorator.interface';

import {
  RelationOnDeleteAction,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export interface RelationMetadataDecoratorParams<T> {
  type: RelationMetadataType;
  inverseSideTarget: () => ObjectType<T>;
  inverseSideFieldKey?: keyof T;
  onDelete: RelationOnDeleteAction;
}

export interface ReflectRelationMetadata
  extends RelationMetadataDecoratorParams<any> {
  target: object;
  fieldKey: string;
  gate?: GateDecoratorParams;
  onDelete: RelationOnDeleteAction;
}
