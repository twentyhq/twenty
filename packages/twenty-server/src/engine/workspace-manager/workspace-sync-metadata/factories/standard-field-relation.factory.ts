import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

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
      this.updateFieldRelationMetadata(
        customObjectFactory,
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
          this.updateFieldRelationMetadata(
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

  private updateFieldRelationMetadata(
    workspaceEntityOrCustomRelationFactory:
      | typeof BaseWorkspaceEntity
      | CustomRelationFactory,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): FieldMetadataEntity<FieldMetadataType.RELATION>[] {
    const target =
      'metadata' in workspaceEntityOrCustomRelationFactory
        ? workspaceEntityOrCustomRelationFactory.metadata
        : workspaceEntityOrCustomRelationFactory;
    const workspaceEntity =
      'metadata' in workspaceEntityOrCustomRelationFactory
        ? metadataArgsStorage.filterExtendedEntities(target)
        : metadataArgsStorage.filterEntities(target);
    const workspaceRelationMetadataArgsCollection =
      metadataArgsStorage.filterRelations(target);

    if (!workspaceEntity) {
      throw new Error(
        `Object metadata decorator not found, can't parse ${target.name}`,
      );
    }

    if (
      !workspaceRelationMetadataArgsCollection ||
      isGatedAndNotEnabled(workspaceEntity?.gate, context.featureFlags)
    ) {
      return [];
    }

    return workspaceRelationMetadataArgsCollection
      .filter(
        (workspaceRelationMetadataArgs) =>
          !isGatedAndNotEnabled(
            workspaceRelationMetadataArgs.gate,
            context.featureFlags,
          ),
      )
      .map((workspaceRelationMetadataArgs) => {
        // Compute reflect relation metadata
        const sourceObjectNameSingular =
          'object' in workspaceEntityOrCustomRelationFactory
            ? workspaceEntityOrCustomRelationFactory.object.nameSingular
            : convertClassNameToObjectMetadataName(
                workspaceRelationMetadataArgs.target.name,
              );
        const inverseSideTarget =
          workspaceRelationMetadataArgs.inverseSideTarget();
        const targetObjectNameSingular = convertClassNameToObjectMetadataName(
          inverseSideTarget.name,
        );
        const sourceFieldMetadataName = workspaceRelationMetadataArgs.name;
        const targetFieldMetadataName =
          (workspaceRelationMetadataArgs.inverseSideFieldKey as
            | string
            | undefined) ?? sourceObjectNameSingular;
        const sourceObjectMetadata =
          originalObjectMetadataMap[sourceObjectNameSingular];
        const joinColumnsMetadataArgsCollection =
          metadataArgsStorage.filterJoinColumns(target);
        const joinColumnName = getJoinColumn(
          joinColumnsMetadataArgsCollection,
          workspaceRelationMetadataArgs,
        );

        assert(
          sourceObjectMetadata,
          `Source object ${sourceObjectNameSingular} not found in databse for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
        );

        const targetObjectMetadata =
          originalObjectMetadataMap[targetObjectNameSingular];

        assert(
          targetObjectMetadata,
          `Target object ${targetObjectNameSingular} not found in databse for relation ${workspaceRelationMetadataArgs.name} of type ${workspaceRelationMetadataArgs.type}`,
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
  }
}
