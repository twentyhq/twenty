import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';
import { MappedObjectMetadataEntity } from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';

import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { standardObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects';
import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/workspace/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { assert } from 'src/utils/assert';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';

@Injectable()
export class StandardRelationFactory {
  create(
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, MappedObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
    return standardObjectMetadata.flatMap((standardObjectMetadata) =>
      this.createRelationMetadata(
        standardObjectMetadata,
        context,
        originalObjectMetadataMap,
        workspaceFeatureFlagsMap,
      ),
    );
  }

  private createRelationMetadata(
    standardObjectMetadata: typeof BaseObjectMetadata,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, MappedObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
    const objectMetadata = TypedReflect.getMetadata(
      'objectMetadata',
      standardObjectMetadata,
    );
    const relationMetadata = TypedReflect.getMetadata(
      'relationMetadata',
      standardObjectMetadata,
    );

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${standardObjectMetadata.name}`,
      );
    }

    if (
      !relationMetadata ||
      isGatedAndNotEnabled(objectMetadata, workspaceFeatureFlagsMap)
    ) {
      return [];
    }

    return relationMetadata
      .filter(
        (relation) => !isGatedAndNotEnabled(relation, workspaceFeatureFlagsMap),
      )
      .map((relation) => {
        const fromObjectMetadata =
          originalObjectMetadataMap[relation.fromObjectNameSingular];

        assert(
          fromObjectMetadata,
          `Object ${relation.fromObjectNameSingular} not found in DB 
        for relation FROM defined in class ${objectMetadata.nameSingular}`,
        );

        const toObjectMetadata =
          originalObjectMetadataMap[relation.toObjectNameSingular];

        assert(
          toObjectMetadata,
          `Object ${relation.toObjectNameSingular} not found in DB
        for relation TO defined in class ${objectMetadata.nameSingular}`,
        );

        const fromFieldMetadata =
          fromObjectMetadata?.fields[relation.fromFieldMetadataName];

        assert(
          fromFieldMetadata,
          `Field ${relation.fromFieldMetadataName} not found in object ${relation.fromObjectNameSingular}
        for relation FROM defined in class ${objectMetadata.nameSingular}`,
        );

        const toFieldMetadata =
          toObjectMetadata?.fields[relation.toFieldMetadataName];

        assert(
          toFieldMetadata,
          `Field ${relation.toFieldMetadataName} not found in object ${relation.toObjectNameSingular}
        for relation TO defined in class ${objectMetadata.nameSingular}`,
        );

        return {
          relationType: relation.type,
          fromObjectMetadataId: fromObjectMetadata?.id,
          toObjectMetadataId: toObjectMetadata?.id,
          fromFieldMetadataId: fromFieldMetadata?.id,
          toFieldMetadataId: toFieldMetadata?.id,
          workspaceId: context.workspaceId,
        };
      });
  }
}
