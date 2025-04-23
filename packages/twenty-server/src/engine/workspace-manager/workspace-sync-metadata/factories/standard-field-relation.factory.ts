import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { ObjectType } from 'typeorm/common/ObjectType';

import { WorkspaceDynamicRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';
import { WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';
import { WorkspaceJoinColumnsMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-join-columns-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { getJoinColumn } from 'src/engine/twenty-orm/utils/get-join-column.util';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { assert } from 'src/utils/assert';

interface CustomRelationFactory {
  object: ObjectMetadataEntity;
  metadata: typeof BaseWorkspaceEntity;
}

@Injectable()
export class StandardFieldRelationFactory {
  createFieldRelationForCustomObject(
    customObjectFactories: CustomRelationFactory[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): FieldMetadataEntity<FieldMetadataType.RELATION>[] {
    return customObjectFactories.flatMap((customObjectFactory) =>
      this.computeFieldRelationMetadataFromDecorators({
        workspaceEntityMetadataArgs: {
          ...customObjectFactory.metadata,
          object: customObjectFactory.object,
        },
        workspaceStaticRelationMetadataArgsCollection: [],
        workspaceDynamicRelationMetadataArgsCollection: [],
        joinColumnsMetadataArgsCollection: [],
        context,
        originalObjectMetadataMap,
      }),
    );
  }

  createFieldRelationForStandardObject(
    standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): Map<string, FieldMetadataEntity<FieldMetadataType.RELATION>[]> {
    return standardObjectMetadataDefinitions.reduce(
      (acc, standardObjectMetadata) => {
        const workspaceEntityMetadataArgs = metadataArgsStorage.filterEntities(
          standardObjectMetadata,
        );

        if (!workspaceEntityMetadataArgs) {
          return acc;
        }

        if (
          isGatedAndNotEnabled(
            workspaceEntityMetadataArgs.gate,
            context.featureFlags,
          )
        ) {
          return acc;
        }

        const workspaceStaticRelationMetadataArgsCollection =
          metadataArgsStorage.filterRelations(standardObjectMetadata);

        const workspaceDynamicRelationMetadataArgsCollection =
          metadataArgsStorage.filterDynamicRelations(standardObjectMetadata);

        const joinColumnsMetadataArgsCollection =
          metadataArgsStorage.filterJoinColumns(standardObjectMetadata);

        acc.set(
          workspaceEntityMetadataArgs.standardId,
          this.computeFieldRelationMetadataFromDecorators({
            workspaceEntityMetadataArgs,
            workspaceStaticRelationMetadataArgsCollection,
            workspaceDynamicRelationMetadataArgsCollection,
            joinColumnsMetadataArgsCollection,
            context,
            originalObjectMetadataMap,
          }),
        );

        return acc;
      },
      new Map<string, FieldMetadataEntity<FieldMetadataType.RELATION>[]>(),
    );
  }

  private computeFieldRelationMetadataFromDecorators({
    workspaceEntityMetadataArgs,
    workspaceStaticRelationMetadataArgsCollection,
    workspaceDynamicRelationMetadataArgsCollection,
    joinColumnsMetadataArgsCollection,
    context,
    originalObjectMetadataMap,
  }: {
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs;
    workspaceStaticRelationMetadataArgsCollection: WorkspaceRelationMetadataArgs[];
    workspaceDynamicRelationMetadataArgsCollection: WorkspaceDynamicRelationMetadataArgs[];
    joinColumnsMetadataArgsCollection: WorkspaceJoinColumnsMetadataArgs[];
    context: WorkspaceSyncContext;
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>;
  }): FieldMetadataEntity<FieldMetadataType.RELATION>[] {
    if (
      !workspaceStaticRelationMetadataArgsCollection &&
      !workspaceDynamicRelationMetadataArgsCollection
    ) {
      return [];
    }

    const sourceObjectNameSingular = workspaceEntityMetadataArgs.nameSingular;
    const sourceObjectMetadata =
      originalObjectMetadataMap[sourceObjectNameSingular];

    assert(
      sourceObjectMetadata,
      `Source object ${sourceObjectNameSingular} not found in database while parsing ${workspaceEntityMetadataArgs.nameSingular} relations`,
    );

    const staticRelationsFromDynamicRelations =
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
            return {
              ...workspaceDynamicRelationMetadataArgs.argsFactory(
                targetObjectMetadata,
              ),
              gate: workspaceDynamicRelationMetadataArgs.gate,
              inverseSideTarget: () =>
                ({
                  name: targetObjectMetadata.nameSingular,
                }) as ObjectType<object>,
              inverseSideFieldKey:
                workspaceDynamicRelationMetadataArgs.inverseSideFieldKey,
              onDelete: workspaceDynamicRelationMetadataArgs.onDelete,
              isPrimary: workspaceDynamicRelationMetadataArgs.isPrimary,
              isSystem: workspaceDynamicRelationMetadataArgs.isSystem,
              isNullable: workspaceDynamicRelationMetadataArgs.isNullable,
              type: workspaceDynamicRelationMetadataArgs.type,
            };
          });
        });

    const relations = [
      ...staticRelationsFromDynamicRelations,
      ...workspaceStaticRelationMetadataArgsCollection,
    ]
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

        let joinColumnName;

        if (workspaceRelationMetadataArgs.joinColumn) {
          joinColumnName = workspaceRelationMetadataArgs.joinColumn;
        } else {
          joinColumnName = getJoinColumn(
            joinColumnsMetadataArgsCollection,
            workspaceRelationMetadataArgs as WorkspaceRelationMetadataArgs,
          );
        }

        const targetObjectMetadata =
          originalObjectMetadataMap[targetObjectNameSingular];

        assert(
          targetObjectMetadata,
          `Target object ${targetObjectNameSingular} not found in database for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
        );

        const sourceFieldMetadata = sourceObjectMetadata?.fields.find(
          (field) => field.name === sourceFieldMetadataName,
        ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

        assert(
          sourceFieldMetadata,
          `Source field ${sourceFieldMetadataName} not found in object ${sourceObjectNameSingular} for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
        );

        const targetFieldMetadata = targetObjectMetadata?.fields.find(
          (field) => field.name === targetFieldMetadataName,
        ) as FieldMetadataEntity<FieldMetadataType.RELATION>;

        assert(
          targetFieldMetadata,
          `Target field ${targetFieldMetadataName} not found in object ${targetObjectNameSingular} for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
        );

        return {
          ...sourceFieldMetadata,
          type: FieldMetadataType.RELATION,
          settings: {
            relationType: workspaceRelationMetadataArgs.type,
            onDelete: workspaceRelationMetadataArgs.onDelete,
            joinColumnName,
          },
          relationTargetObjectMetadataId: targetObjectMetadata.id,
          relationTargetFieldMetadataId: targetFieldMetadata.id,
        } satisfies FieldMetadataEntity<FieldMetadataType.RELATION>;
      });

    return relations;
  }
}
