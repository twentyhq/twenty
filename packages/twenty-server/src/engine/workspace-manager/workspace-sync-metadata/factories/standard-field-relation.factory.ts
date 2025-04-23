import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { ObjectType } from 'typeorm/common/ObjectType';

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
      this.computeFieldRelationMetadataFromDecorators(
        customObjectFactory.metadata,
        context,
        originalObjectMetadataMap,
      ),
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

        acc.set(
          workspaceEntityMetadataArgs.standardId,
          this.computeFieldRelationMetadataFromDecorators(
            standardObjectMetadata,
            context,
            originalObjectMetadataMap,
          ),
        );

        return acc;
      },
      new Map<string, FieldMetadataEntity<FieldMetadataType.RELATION>[]>(),
    );
  }

  private computeFieldRelationMetadataFromDecorators(
    workspaceEntityTarget: typeof BaseWorkspaceEntity,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): FieldMetadataEntity<FieldMetadataType.RELATION>[] {
    const workspaceEntity = metadataArgsStorage.filterEntities(
      workspaceEntityTarget,
    );
    const workspaceStaticRelationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(workspaceEntityTarget);

    const workspaceDynamicRelationMetadataArgsCollection =
      metadataArgsStorage.filterDynamicRelations(workspaceEntityTarget);

    if (!workspaceEntity) {
      throw new Error(
        `Object metadata decorator not found, can't parse ${workspaceEntityTarget.name}`,
      );
    }

    if (
      !workspaceStaticRelationMetadataArgsCollection &&
      !workspaceDynamicRelationMetadataArgsCollection
    ) {
      return [];
    }

    if (isGatedAndNotEnabled(workspaceEntity?.gate, context.featureFlags)) {
      return [];
    }

    const sourceObjectNameSingular = workspaceEntity.nameSingular;
    const sourceObjectMetadata =
      originalObjectMetadataMap[sourceObjectNameSingular];

    assert(
      sourceObjectMetadata,
      `Source object ${sourceObjectNameSingular} not found in database while parsing ${workspaceEntityTarget.name} relations`,
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
              target: workspaceEntityTarget,
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

        const joinColumnsMetadataArgsCollection =
          metadataArgsStorage.filterJoinColumns(workspaceEntityTarget);

        let joinColumnName;

        if (workspaceRelationMetadataArgs.joinColumn) {
          joinColumnName = workspaceRelationMetadataArgs.joinColumn;
        } else {
          joinColumnName = getJoinColumn(
            joinColumnsMetadataArgsCollection,
            workspaceRelationMetadataArgs,
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
