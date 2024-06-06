import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { PartialWorkspaceEntity } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

import { StandardFieldFactory } from './standard-field.factory';

@Injectable()
export class StandardObjectFactory {
  constructor(private readonly standardFieldFactory: StandardFieldFactory) {}

  create(
    standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialWorkspaceEntity[] {
    return standardObjectMetadataDefinitions
      .map((metadata) =>
        this.createObjectMetadata(metadata, context, workspaceFeatureFlagsMap),
      )
      .filter((metadata): metadata is PartialWorkspaceEntity => !!metadata);
  }

  private createObjectMetadata(
    target: typeof BaseWorkspaceEntity,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialWorkspaceEntity | undefined {
    const workspaceEntityMetadataArgs =
      metadataArgsStorage.filterEntities(target);

    if (!workspaceEntityMetadataArgs) {
      throw new Error(
        `Object metadata decorator not found, can't parse ${target.name}`,
      );
    }

    if (
      isGatedAndNotEnabled(
        workspaceEntityMetadataArgs.gate,
        workspaceFeatureFlagsMap,
      )
    ) {
      return undefined;
    }

    const fields = this.standardFieldFactory.create(
      target,
      context,
      workspaceFeatureFlagsMap,
    );

    return {
      ...workspaceEntityMetadataArgs,
      // TODO: Remove targetTableName when we remove the old metadata
      targetTableName: 'DEPRECATED',
      workspaceId: context.workspaceId,
      dataSourceId: context.dataSourceId,
      isCustom: false,
      isRemote: false,
      isSystem: workspaceEntityMetadataArgs.isSystem ?? false,
      fields,
    };
  }
}
