import { ObjectType } from 'typeorm';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

interface WorkspaceBaseRelationOptions<TType, TClass> {
  standardId: string;
  label: string;
  description?: string;
  icon?: string;
  type: TType;
  inverseSideTarget: () => ObjectType<TClass>;
  inverseSideFieldKey?: keyof TClass;
  onDelete?: RelationOnDeleteAction;
}

export interface WorkspaceManyToOneRelationOptions<TClass>
  extends WorkspaceBaseRelationOptions<
    RelationMetadataType.MANY_TO_ONE | RelationMetadataType.ONE_TO_ONE,
    TClass
  > {
  joinColumn?: string;
}

export interface WorkspaceOtherRelationOptions<TClass>
  extends WorkspaceBaseRelationOptions<
    RelationMetadataType.ONE_TO_MANY | RelationMetadataType.MANY_TO_MANY,
    TClass
  > {}

export function WorkspaceRelation<TClass extends object>(
  options:
    | WorkspaceManyToOneRelationOptions<TClass>
    | WorkspaceOtherRelationOptions<TClass>,
): PropertyDecorator {
  return (object: object, fieldKey: string) => {
    let joinColumn: string | undefined;

    if ('joinColumn' in options) {
      joinColumn = options.joinColumn ? options.joinColumn : `${fieldKey}Id`;
    }

    metadataArgsStorage.relations.push({
      target: object.constructor,
      standardId: options.standardId,
      name: fieldKey,
      label: options.label,
      type: options.type,
      description: options.description,
      icon: options.icon,
      inverseSideTarget: options.inverseSideTarget,
      inverseSideFieldKey: options.inverseSideFieldKey as string | undefined,
      onDelete: options.onDelete,
      joinColumn,
    });
  };
}
