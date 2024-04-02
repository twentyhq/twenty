import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { PartialObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

import { StandardFieldFactory } from './standard-field.factory';

@Injectable()
export class StandardObjectFactory {
  constructor(private readonly standardFieldFactory: StandardFieldFactory) {}

  create(
    standardObjectMetadataDefinitions: (typeof BaseObjectMetadata)[],
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialObjectMetadata[] {
    return standardObjectMetadataDefinitions
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

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${metadata.name}`,
      );
    }

    if (isGatedAndNotEnabled(objectMetadata.gate, workspaceFeatureFlagsMap)) {
      return undefined;
    }

    const fields = this.standardFieldFactory.create(
      metadata,
      context,
      workspaceFeatureFlagsMap,
    );

    return {
      ...objectMetadata,
      workspaceId: context.workspaceId,
      dataSourceId: context.dataSourceId,
      fields,
    };
  }
}
