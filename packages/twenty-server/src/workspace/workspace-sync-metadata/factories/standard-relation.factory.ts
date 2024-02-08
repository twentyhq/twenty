import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';

import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { standardObjectMetadataCollection } from 'src/workspace/workspace-sync-metadata/standard-objects';
import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/workspace/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { assert } from 'src/utils/assert';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

@Injectable()
export class StandardRelationFactory {
  create(
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
    return standardObjectMetadataCollection.flatMap((standardObjectMetadata) =>
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
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
    const objectMetadata = TypedReflect.getMetadata(
      'objectMetadata',
      standardObjectMetadata,
    );
    const relationMetadataCollection = TypedReflect.getMetadata(
      'relationMetadataCollection',
      standardObjectMetadata,
    );

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${standardObjectMetadata.name}`,
      );
    }

    if (
      !relationMetadataCollection ||
      isGatedAndNotEnabled(objectMetadata.gate, workspaceFeatureFlagsMap)
    ) {
      return [];
    }

    return relationMetadataCollection
      .filter(
        (relationMetadata) =>
          !isGatedAndNotEnabled(
            relationMetadata.gate,
            workspaceFeatureFlagsMap,
          ),
      )
      .map((relationMetadata) => {
        const fromObjectMetadata =
          originalObjectMetadataMap[relationMetadata.fromObjectNameSingular];

        assert(
          fromObjectMetadata,
          `Object ${relationMetadata.fromObjectNameSingular} not found in DB 
        for relation FROM defined in class ${objectMetadata.nameSingular}`,
        );

        const toObjectMetadata =
          originalObjectMetadataMap[relationMetadata.toObjectNameSingular];

        assert(
          toObjectMetadata,
          `Object ${relationMetadata.toObjectNameSingular} not found in DB
        for relation TO defined in class ${objectMetadata.nameSingular}`,
        );

        const fromFieldMetadata = fromObjectMetadata?.fields.find(
          (field) => field.name === relationMetadata.fromFieldMetadataName,
        );

        assert(
          fromFieldMetadata,
          `Field ${relationMetadata.fromFieldMetadataName} not found in object ${relationMetadata.fromObjectNameSingular}
        for relation FROM defined in class ${objectMetadata.nameSingular}`,
        );

        const toFieldMetadata = toObjectMetadata?.fields.find(
          (field) => field.name === relationMetadata.toFieldMetadataName,
        );

        assert(
          toFieldMetadata,
          `Field ${relationMetadata.toFieldMetadataName} not found in object ${relationMetadata.toObjectNameSingular}
        for relation TO defined in class ${objectMetadata.nameSingular}`,
        );

        return {
          relationType: relationMetadata.type,
          fromObjectMetadataId: fromObjectMetadata?.id,
          toObjectMetadataId: toObjectMetadata?.id,
          fromFieldMetadataId: fromFieldMetadata?.id,
          toFieldMetadataId: toFieldMetadata?.id,
          workspaceId: context.workspaceId,
        };
      });
  }
}
