import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { assert } from 'src/utils/assert';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

interface CustomRelationFactory {
  object: ObjectMetadataEntity;
  metadata: typeof BaseObjectMetadata;
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
    standardObjectMetadataDefinitions: (typeof BaseObjectMetadata)[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[];

  create(
    standardObjectMetadataDefinitionsOrCustomObjectFactories:
      | (typeof BaseObjectMetadata)[]
      | {
          object: ObjectMetadataEntity;
          metadata: typeof BaseObjectMetadata;
        }[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
    return standardObjectMetadataDefinitionsOrCustomObjectFactories.flatMap(
      (
        standardObjectMetadata:
          | typeof BaseObjectMetadata
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
    standardObjectMetadataOrCustomRelationFactory:
      | typeof BaseObjectMetadata
      | CustomRelationFactory,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Partial<RelationMetadataEntity>[] {
    const standardObjectMetadata =
      'metadata' in standardObjectMetadataOrCustomRelationFactory
        ? standardObjectMetadataOrCustomRelationFactory.metadata
        : standardObjectMetadataOrCustomRelationFactory;
    const objectMetadata = TypedReflect.getMetadata(
      'metadata' in standardObjectMetadataOrCustomRelationFactory
        ? 'extendObjectMetadata'
        : 'objectMetadata',
      standardObjectMetadata,
    );
    const reflectRelationMetadataCollection = TypedReflect.getMetadata(
      'reflectRelationMetadataCollection',
      standardObjectMetadata,
    );

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${standardObjectMetadata.name}`,
      );
    }

    if (
      !reflectRelationMetadataCollection ||
      isGatedAndNotEnabled(objectMetadata?.gate, workspaceFeatureFlagsMap)
    ) {
      return [];
    }

    return reflectRelationMetadataCollection
      .filter(
        (reflectRelationMetadata) =>
          !isGatedAndNotEnabled(
            reflectRelationMetadata.gate,
            workspaceFeatureFlagsMap,
          ),
      )
      .map((reflectRelationMetadata) => {
        // Compute reflect relation metadata
        const fromObjectNameSingular =
          'object' in standardObjectMetadataOrCustomRelationFactory
            ? standardObjectMetadataOrCustomRelationFactory.object.nameSingular
            : convertClassNameToObjectMetadataName(
                reflectRelationMetadata.target.constructor.name,
              );
        const toObjectNameSingular = convertClassNameToObjectMetadataName(
          reflectRelationMetadata.inverseSideTarget().name,
        );
        const fromFieldMetadataName = reflectRelationMetadata.fieldKey;
        const toFieldMetadataName =
          (reflectRelationMetadata.inverseSideFieldKey as string | undefined) ??
          fromObjectNameSingular;
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
          relationType: reflectRelationMetadata.type,
          fromObjectMetadataId: fromObjectMetadata?.id,
          toObjectMetadataId: toObjectMetadata?.id,
          fromFieldMetadataId: fromFieldMetadata?.id,
          toFieldMetadataId: toFieldMetadata?.id,
          workspaceId: context.workspaceId,
          onDeleteAction: reflectRelationMetadata.onDelete,
        };
      });
  }
}
