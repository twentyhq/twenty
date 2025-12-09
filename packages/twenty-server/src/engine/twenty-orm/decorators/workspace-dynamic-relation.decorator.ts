import { type ObjectType } from 'typeorm';
import { type RelationOnDeleteAction } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type WorkspaceDynamicRelationMetadataArgsFactory } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';

import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

interface WorkspaceBaseDynamicRelationOptions<TClass> {
  type: RelationType;
  argsFactory: WorkspaceDynamicRelationMetadataArgsFactory;
  inverseSideTarget: () => ObjectType<TClass>;
  inverseSideFieldKey?: keyof TClass;
  onDelete?: RelationOnDeleteAction;
}

export function WorkspaceDynamicRelation<TClass extends object>(
  args: WorkspaceBaseDynamicRelationOptions<TClass>,
): PropertyDecorator {
  return (target, propertyKey) => {
    const isSystem =
      TypedReflect.getMetadata(
        'workspace:is-system-metadata-args',
        target,
        propertyKey.toString(),
      ) ?? false;

    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
      propertyKey.toString(),
    );

    metadataArgsStorage.addDynamicRelations({
      target: target.constructor,
      argsFactory: args.argsFactory,
      type: args.type,
      inverseSideTarget: args.inverseSideTarget,
      inverseSideFieldKey: args.inverseSideFieldKey as string | undefined,
      onDelete: args.onDelete,
      isSystem,
      isNullable: true,
      isPrimary: false,
      gate,
    });
  };
}
