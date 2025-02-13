import { MessageDescriptor } from '@lingui/core';
import { ObjectType } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

interface WorkspaceRelationOptions<TClass> {
  standardId: string;
  label:
    | MessageDescriptor
    | ((objectMetadata: ObjectMetadataEntity) => MessageDescriptor);
  description?:
    | MessageDescriptor
    | ((objectMetadata: ObjectMetadataEntity) => MessageDescriptor);
  icon?: string;
  type: RelationMetadataType;
  inverseSideTarget: () => ObjectType<TClass>;
  inverseSideFieldKey?: keyof TClass;
  onDelete?: RelationOnDeleteAction;
}

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

    metadataArgsStorage.addRelations({
      target: object.constructor,
      standardId: options.standardId,
      name: propertyKey.toString(),
      label:
        typeof options.label === 'function'
          ? (objectMetadata: ObjectMetadataEntity) =>
              (
                options.label as (
                  obj: ObjectMetadataEntity,
                ) => MessageDescriptor
              )(objectMetadata).message ?? ''
          : (options.label.message ?? ''),
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
    });
  };
}
