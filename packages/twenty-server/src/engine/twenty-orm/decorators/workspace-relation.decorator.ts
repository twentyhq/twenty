import { type MessageDescriptor } from '@lingui/core';
import { isDefined, isUUID } from 'class-validator';
import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import { type RelationOnDeleteAction } from 'twenty-shared/types';
import { CustomError } from 'twenty-shared/utils';
import { type ObjectType } from 'typeorm';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

interface WorkspaceRelationMinimumBaseOptions<TClass> {
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

interface WorkspaceRegularRelationBaseOptions<TClass>
  extends WorkspaceRelationMinimumBaseOptions<TClass> {
  isMorphRelation?: false;
}

interface WorkspaceMorphRelationBaseOptions<TClass>
  extends WorkspaceRelationMinimumBaseOptions<TClass> {
  isMorphRelation: true;
  morphId: string;
}

type WorkspaceRelationBaseOptions<TClass> =
  | WorkspaceRegularRelationBaseOptions<TClass>
  | WorkspaceMorphRelationBaseOptions<TClass>;

type WorkspaceOtherRelationOptions<TClass> =
  WorkspaceRelationBaseOptions<TClass> & {
    type: RelationType.ONE_TO_MANY;
  };

type WorkspaceManyToOneRelationOptions<TClass extends object> =
  WorkspaceRelationBaseOptions<TClass> & {
    type: RelationType.MANY_TO_ONE;
    inverseSideFieldKey: keyof TClass;
  };

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
    const isUIReadOnly =
      TypedReflect.getMetadata(
        'workspace:is-field-ui-readonly-metadata-args',
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
    const isLabelSyncedWithName =
      computeMetadataNameFromLabel({ label }) === name;

    if (options.isMorphRelation && !isDefined(options.morphId)) {
      throw new CustomError(
        'Morph relation must have a morph id',
        'MORPH_RELATION_MUST_HAVE_MORPH_ID',
      );
    }

    if (options.isMorphRelation && !isUUID(options.morphId)) {
      throw new CustomError(
        'Morph ID must be a valid UUID',
        'INVALID_MORPH_ID_FORMAT',
      );
    }

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
      isUIReadOnly,
      gate,
      isMorphRelation: options.isMorphRelation ?? false,
      morphId: options.isMorphRelation ? options.morphId : undefined,
      isLabelSyncedWithName,
    });
  };
}
