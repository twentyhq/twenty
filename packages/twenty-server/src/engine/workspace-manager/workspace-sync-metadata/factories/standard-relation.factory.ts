import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { assert } from 'src/utils/assert';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

interface CustomRelationFactory {
  object: ObjectMetadataEntity;
  metadata: typeof BaseWorkspaceEntity;
}

@Injectable()
export class StandardRelationFactory {
  create(
    customObjectFactories: CustomRelationFactory[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[];

  create(
    standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[];

  create(
    standardObjectMetadataDefinitionsOrCustomObjectFactories:
      | (typeof BaseWorkspaceEntity)[]
      | {
          object: ObjectMetadataEntity;
          metadata: typeof BaseWorkspaceEntity;
        }[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
    return standardObjectMetadataDefinitionsOrCustomObjectFactories.flatMap(
      (
        standardObjectMetadata:
          | typeof BaseWorkspaceEntity
          | CustomRelationFactory,
      ) =>
        this.createRelationMetadata(
          standardObjectMetadata,
          context,
          originalObjectMetadataMap,
          workspaceFeatureFlagsMap,
        ),
    );
  }

  private createRelationMetadata(
    workspaceEntityOrCustomRelationFactory:
      | typeof BaseWorkspaceEntity
      | CustomRelationFactory,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
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
      isGatedAndNotEnabled(workspaceEntity?.gate, workspaceFeatureFlagsMap)
    ) {
      return [];
    }

    return workspaceRelationMetadataArgsCollection
      .filter((workspaceRelationMetadataArgs) => {
        // We're not storing many-to-one relations in the DB for the moment
        if (
          workspaceRelationMetadataArgs.type ===
          RelationMetadataType.MANY_TO_ONE
        ) {
          return false;
        }

        return !isGatedAndNotEnabled(
          workspaceRelationMetadataArgs.gate,
          workspaceFeatureFlagsMap,
        );
      })
      .map((workspaceRelationMetadataArgs) => {
        // Compute reflect relation metadata
        const fromObjectNameSingular =
          'object' in workspaceEntityOrCustomRelationFactory
            ? workspaceEntityOrCustomRelationFactory.object.nameSingular
            : convertClassNameToObjectMetadataName(
                workspaceRelationMetadataArgs.target.name,
              );
        const toObjectNameSingular = convertClassNameToObjectMetadataName(
          workspaceRelationMetadataArgs.inverseSideTarget().name,
        );
        const fromFieldMetadataName = workspaceRelationMetadataArgs.name;
        const toFieldMetadataName =
          (workspaceRelationMetadataArgs.inverseSideFieldKey as
            | string
            | undefined) ?? fromObjectNameSingular;
        const fromObjectMetadata =
          originalObjectMetadataMap[fromObjectNameSingular];

        assert(
          fromObjectMetadata,
          `Object ${fromObjectNameSingular} not found in DB 
        for relation FROM defined in class ${fromObjectNameSingular}`,
        );

        const toObjectMetadata =
          originalObjectMetadataMap[toObjectNameSingular];

        assert(
          toObjectMetadata,
          `Object ${toObjectNameSingular} not found in DB
        for relation TO defined in class ${fromObjectNameSingular}`,
        );

        const fromFieldMetadata = fromObjectMetadata?.fields.find(
          (field) => field.name === fromFieldMetadataName,
        );

        assert(
          fromFieldMetadata,
          `Field ${fromFieldMetadataName} not found in object ${fromObjectNameSingular}
        for relation FROM defined in class ${fromObjectNameSingular}`,
        );

        const toFieldMetadata = toObjectMetadata?.fields.find(
          (field) => field.name === toFieldMetadataName,
        );

        assert(
          toFieldMetadata,
          `Field ${toFieldMetadataName} not found in object ${toObjectNameSingular}
        for relation TO defined in class ${fromObjectNameSingular}`,
        );

        return {
          relationType: workspaceRelationMetadataArgs.type,
          fromObjectMetadataId: fromObjectMetadata?.id,
          toObjectMetadataId: toObjectMetadata?.id,
          fromFieldMetadataId: fromFieldMetadata?.id,
          toFieldMetadataId: toFieldMetadata?.id,
          workspaceId: context.workspaceId,
          onDeleteAction: workspaceRelationMetadataArgs.onDelete,
        };
      });
  }
}
