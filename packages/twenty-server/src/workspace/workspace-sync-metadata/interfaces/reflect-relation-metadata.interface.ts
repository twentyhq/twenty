import { ObjectType } from 'typeorm';

import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

import {
  RelationOnDeleteAction,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';

export interface RelationMetadataDecoratorParams<T> {
  type: RelationMetadataType;
  inverseSideTarget: () => ObjectType<T>;
  inverseSideFieldKey?: keyof T;
  onDelete?: RelationOnDeleteAction;
}

export interface ReflectRelationMetadata
  extends RelationMetadataDecoratorParams<any> {
  target: object;
  fieldKey: string;
  gate?: GateDecoratorParams;
  onDelete: RelationOnDeleteAction;
}
