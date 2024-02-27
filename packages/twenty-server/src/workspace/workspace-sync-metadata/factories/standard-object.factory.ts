import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';
import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { standardObjectMetadataCollection } from 'src/workspace/workspace-sync-metadata/standard-objects';
import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/workspace/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardObjectFactory {
  create(
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialObjectMetadata[] {
    return standardObjectMetadataCollection
      .map((metadata) =>
        this.createObjectMetadata(metadata, context, workspaceFeatureFlagsMap),
      )
      .filter((metadata): metadata is PartialObjectMetadata => !!metadata);
  }

  private createObjectMetadata(
    metadata: typeof BaseObjectMetadata,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialObjectMetadata | undefined {
    const objectMetadata = TypedReflect.getMetadata('objectMetadata', metadata);
    const fieldMetadataMap =
      TypedReflect.getMetadata('fieldMetadataMap', metadata) ?? [];

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${metadata.name}`,
      );
    }

    if (isGatedAndNotEnabled(objectMetadata.gate, workspaceFeatureFlagsMap)) {
      return undefined;
    }

    const fields = Object.values(fieldMetadataMap).reduce(
      // Omit gate as we don't want to store it in the DB
      (acc, { gate, ...fieldMetadata }) => {
        if (isGatedAndNotEnabled(gate, workspaceFeatureFlagsMap)) {
          return acc;
        }

        acc.push({
          ...fieldMetadata,
          workspaceId: context.workspaceId,
          isSystem: objectMetadata.isSystem || fieldMetadata.isSystem,
        });

        return acc;
      },
      [] as PartialFieldMetadata[],
    );

    return {
      ...objectMetadata,
      workspaceId: context.workspaceId,
      dataSourceId: context.dataSourceId,
      fields,
    };
  }
}
