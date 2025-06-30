import { MessageDescriptor } from '@lingui/core';
import { ObjectType } from 'typeorm';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

interface WorkspaceRelationBaseOptions<TClass> {
  standardId: string;
  label: MessageDescriptor;
  description?:
    | MessageDescriptor
    | ((objectMetadata: ObjectMetadataEntity) => MessageDescriptor);
  icon?: string;
  inverseSideTarget: () => ObjectType<TClass>;
  inverseSideFieldKey?: keyof TClass;
  onDelete?: RelationOnDeleteAction;
}

interface WorkspaceOtherRelationOptions<TClass>
  extends WorkspaceRelationBaseOptions<TClass> {
  type: RelationType.ONE_TO_MANY;
}

interface WorkspaceManyToOneRelationOptions<TClass extends object>
  extends WorkspaceRelationBaseOptions<TClass> {
  type: RelationType.MANY_TO_ONE;
  inverseSideFieldKey: keyof TClass;
}

type WorkspaceRelationOptions<TClass extends object> =
  | WorkspaceOtherRelationOptions<TClass>
  | WorkspaceManyToOneRelationOptions<TClass>;

export function WorkspaceRelation<TClass extends object>(
  options: WorkspaceRelationOptions<TClass>,
): PropertyDecorator {
  return (object, propertyKey) => {
    const isPrimary =
      TypedReflect.getMetadata(
        'workspace:is-primary-field-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isNullable =
      TypedReflect.getMetadata(
        'workspace:is-nullable-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isSystem =
      TypedReflect.getMetadata(
        'workspace:is-system-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      object,
      propertyKey.toString(),
    );
    const name = propertyKey.toString();
    const label = options.label.message ?? '';
    const isLabelSyncedWithName = computeMetadataNameFromLabel(label) === name;

    metadataArgsStorage.addRelations({
      target: object.constructor,
      standardId: options.standardId,
      name,
      label,
      type: options.type,
      description:
        typeof options.description === 'function'
          ? (objectMetadata: ObjectMetadataEntity) =>
              (
                options.description as (
                  obj: ObjectMetadataEntity,
                ) => MessageDescriptor
              )(objectMetadata).message ?? ''
          : (options.description?.message ?? ''),
      icon: options.icon,
      inverseSideTarget: options.inverseSideTarget,
      inverseSideFieldKey: options.inverseSideFieldKey as string | undefined,
      onDelete: options.onDelete,
      isPrimary,
      isNullable,
      isSystem,
      gate,
      isLabelSyncedWithName,
    });
  };
}
