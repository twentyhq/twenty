import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { getJoinColumn } from 'src/engine/twenty-orm/utils/get-join-column.util';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardFieldRelationFactory {
  computeRelationFieldsForCustomObject(
    customObjectMetadata: ObjectMetadataEntity,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >[] {
    const workspaceRelationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(CustomWorkspaceEntity);

    const joinColumnsMetadataArgsCollection =
      metadataArgsStorage.filterJoinColumns(CustomWorkspaceEntity);

    const objectNameSingular = customObjectMetadata.nameSingular;

    const sourceObjectMetadata = originalObjectMetadataMap[objectNameSingular];

    if (!isDefined(sourceObjectMetadata)) {
      throw new Error(
        `Source object ${objectNameSingular} not found in database while parsing ${objectNameSingular} relations`,
      );
    }

    return workspaceRelationMetadataArgsCollection.map(
      (workspaceRelationMetadataArgs) => {
        const inverseSideTarget =
          workspaceRelationMetadataArgs.inverseSideTarget();
        const targetObjectNameSingular = convertClassNameToObjectMetadataName(
          inverseSideTarget.name,
        );
        const targetObjectMetadata =
          originalObjectMetadataMap[targetObjectNameSingular];

        if (!isDefined(targetObjectMetadata)) {
          throw new Error(
            `Target object ${targetObjectNameSingular} not found in database while parsing ${objectNameSingular} relations`,
          );
        }

        const sourceFieldMetadataName = workspaceRelationMetadataArgs.name;

        const targetFieldMetadataName =
          workspaceRelationMetadataArgs.inverseSideFieldKey ??
          objectNameSingular;

        const targetFieldMetadata = targetObjectMetadata.fields.find(
          (field) => field.name === targetFieldMetadataName,
        ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

        if (!isDefined(targetFieldMetadata)) {
          throw new Error(
            `Target field ${targetFieldMetadataName} not found in object ${targetObjectNameSingular} for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
          );
        }

        const joinColumnName =
          workspaceRelationMetadataArgs.type === RelationType.MANY_TO_ONE
            ? getJoinColumn(
                joinColumnsMetadataArgsCollection,
                workspaceRelationMetadataArgs as WorkspaceRelationMetadataArgs,
              )
            : undefined;

        const sourceFieldMetadata = sourceObjectMetadata.fields.find(
          (field) => field.name === sourceFieldMetadataName,
        ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

        if (!isDefined(sourceFieldMetadata)) {
          throw new Error(
            `Source field ${sourceFieldMetadataName} not found in object ${sourceFieldMetadata.name} for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
          );
        }

        return {
          ...sourceFieldMetadata,
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: workspaceRelationMetadataArgs.type,
            onDelete:
              workspaceRelationMetadataArgs.type === RelationType.MANY_TO_ONE
                ? workspaceRelationMetadataArgs.onDelete
                : undefined,
            joinColumnName,
          },
          relationTargetObjectMetadataId: targetObjectMetadata.id,
          relationTargetFieldMetadataId: targetFieldMetadata.id,
          isNullable: workspaceRelationMetadataArgs.isNullable,
        } satisfies FieldMetadataEntity<FieldMetadataType.RELATION>;
      },
    );
  }

  computeRelationFieldsForStandardObject(
    standardObjectMetadataWorkspaceEntity: typeof BaseWorkspaceEntity,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >[] {
    const workspaceEntityMetadataArgs = metadataArgsStorage.filterEntities(
      standardObjectMetadataWorkspaceEntity,
    );

    if (!workspaceEntityMetadataArgs) {
      return [];
    }

    if (
      isGatedAndNotEnabled(
        workspaceEntityMetadataArgs.gate,
        context.featureFlags,
      )
    ) {
      return [];
    }

    const sourceObjectNameSingular = workspaceEntityMetadataArgs.nameSingular;

    const workspaceStaticRelationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(
        standardObjectMetadataWorkspaceEntity,
      );

    const workspaceDynamicRelationMetadataArgsCollection =
      metadataArgsStorage.filterDynamicRelations(
        standardObjectMetadataWorkspaceEntity,
      );

    const joinColumnsMetadataArgsCollection =
      metadataArgsStorage.filterJoinColumns(
        standardObjectMetadataWorkspaceEntity,
      );

    if (
      !isDefined(workspaceStaticRelationMetadataArgsCollection) &&
      !isDefined(workspaceDynamicRelationMetadataArgsCollection)
    ) {
      throw new Error(
        `No relations found for object ${sourceObjectNameSingular}`,
      );
    }

    const sourceObjectMetadata =
      originalObjectMetadataMap[sourceObjectNameSingular];

    if (!isDefined(sourceObjectMetadata)) {
      throw new Error(
        `Source object ${sourceObjectNameSingular} not found in database while parsing relations`,
      );
    }

    const relationsFromDynamicRelations =
      workspaceDynamicRelationMetadataArgsCollection
        .filter(
          (workspaceDynamicRelationMetadataArgs) =>
            !isGatedAndNotEnabled(
              workspaceDynamicRelationMetadataArgs.gate,
              context.featureFlags,
            ),
        )
        .flatMap((workspaceDynamicRelationMetadataArgs) => {
          const customObjectMetadataItems = Object.values(
            originalObjectMetadataMap,
          ).filter((objectMetadata) => objectMetadata.isCustom);

          // TODO: this is hacky and needs to be simplified
          return customObjectMetadataItems.flatMap((targetObjectMetadata) => {
            const relationMetadataArgs =
              workspaceDynamicRelationMetadataArgs.argsFactory(
                targetObjectMetadata,
              );

            const sourceFieldMetadata = sourceObjectMetadata?.fields.find(
              (field) => field.name === relationMetadataArgs.name,
            ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

            const targetFieldMetadata = targetObjectMetadata?.fields.find(
              (field) =>
                field.name ===
                workspaceDynamicRelationMetadataArgs.inverseSideFieldKey,
            ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

            if (!isDefined(sourceFieldMetadata)) {
              throw new Error(
                `Source field ${relationMetadataArgs.name} not found in object ${sourceObjectNameSingular} for relation ${relationMetadataArgs.name} of type ${relationMetadataArgs}`,
              );
            }

            if (!isDefined(targetFieldMetadata)) {
              throw new Error(
                `Target field ${workspaceDynamicRelationMetadataArgs.inverseSideFieldKey} not found in object ${targetObjectMetadata.nameSingular} for relation ${relationMetadataArgs.name} of type ${workspaceDynamicRelationMetadataArgs.type}`,
              );
            }

            return {
              ...sourceFieldMetadata,
              type: FieldMetadataType.RELATION,
              settings: {
                relationType: workspaceDynamicRelationMetadataArgs.type,
                onDelete:
                  workspaceDynamicRelationMetadataArgs.type ===
                  RelationType.MANY_TO_ONE
                    ? workspaceDynamicRelationMetadataArgs.onDelete
                    : undefined,
                joinColumnName: relationMetadataArgs.joinColumn,
              },
              relationTargetObjectMetadataId: targetObjectMetadata.id,
              relationTargetFieldMetadataId: targetFieldMetadata.id,
              isNullable: workspaceDynamicRelationMetadataArgs.isNullable,
            } satisfies FieldMetadataEntity<FieldMetadataType.RELATION>;
          });
        });

    const staticRelations = workspaceStaticRelationMetadataArgsCollection
      .filter(
        (workspaceRelationMetadataArgs) =>
          !isGatedAndNotEnabled(
            workspaceRelationMetadataArgs.gate,
            context.featureFlags,
          ),
      )
      .map((workspaceRelationMetadataArgs) => {
        const inverseSideTarget =
          workspaceRelationMetadataArgs.inverseSideTarget();
        const targetObjectNameSingular = convertClassNameToObjectMetadataName(
          inverseSideTarget.name,
        );
        const sourceFieldMetadataName = workspaceRelationMetadataArgs.name;
        const targetFieldMetadataName =
          workspaceRelationMetadataArgs.inverseSideFieldKey ??
          sourceObjectNameSingular;

        const joinColumnName =
          workspaceRelationMetadataArgs.type === RelationType.MANY_TO_ONE
            ? getJoinColumn(
                joinColumnsMetadataArgsCollection,
                workspaceRelationMetadataArgs as WorkspaceRelationMetadataArgs,
              )
            : undefined;

        const sourceFieldMetadata = sourceObjectMetadata?.fields.find(
          (field) => field.name === sourceFieldMetadataName,
        ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

        if (!isDefined(sourceFieldMetadata)) {
          throw new Error(
            `Source field ${sourceFieldMetadataName} not found in object ${sourceObjectNameSingular} for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
          );
        }

        const targetObjectMetadata =
          originalObjectMetadataMap[targetObjectNameSingular];

        if (!isDefined(targetObjectMetadata)) {
          throw new Error(
            `Target object ${targetObjectNameSingular} not found in database for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
          );
        }

        const targetFieldMetadata = targetObjectMetadata.fields.find(
          (field) => field.name === targetFieldMetadataName,
        ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

        if (!isDefined(targetFieldMetadata)) {
          throw new Error(
            `Target field ${targetFieldMetadataName} not found in object ${targetObjectNameSingular} for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
          );
        }

        const type = workspaceRelationMetadataArgs.isMorphRelation
          ? FieldMetadataType.MORPH_RELATION
          : FieldMetadataType.RELATION;

        return {
          ...sourceFieldMetadata,
          type,
          settings: {
            relationType: workspaceRelationMetadataArgs.type,
            onDelete:
              workspaceRelationMetadataArgs.type === RelationType.MANY_TO_ONE
                ? workspaceRelationMetadataArgs.onDelete
                : undefined,
            joinColumnName,
          },
          morphId: workspaceRelationMetadataArgs.morphId ?? null,
          relationTargetObjectMetadataId: targetObjectMetadata.id,
          relationTargetFieldMetadataId: targetFieldMetadata.id,
        } satisfies FieldMetadataEntity<typeof type>;
      });

    return [...staticRelations, ...relationsFromDynamicRelations];
  }
}
