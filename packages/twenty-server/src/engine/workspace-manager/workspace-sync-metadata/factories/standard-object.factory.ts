import { Injectable } from '@nestjs/common';

import { type PartialWorkspaceEntity } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardObjectFactory {
  create(
    standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
    context: WorkspaceSyncContext,
  ): Omit<PartialWorkspaceEntity, 'fields' | 'indexMetadatas'>[] {
    return standardObjectMetadataDefinitions
      .map((metadata) => this.createObjectMetadata(metadata, context))
      .filter((metadata): metadata is PartialWorkspaceEntity => !!metadata);
  }

  private createObjectMetadata(
    target: typeof BaseWorkspaceEntity,
    context: WorkspaceSyncContext,
  ):
    | Omit<PartialWorkspaceEntity, 'fields' | 'indexMetadatas' | 'icon'>
    | undefined {
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
        context.featureFlags,
        'database',
      )
    ) {
      return undefined;
    }

    return {
      // TODO: Remove targetTableName when we remove the old metadata
      labelIdentifierFieldMetadataId: null,
      imageIdentifierFieldMetadataId: null,
      duplicateCriteria: [],
      ...workspaceEntityMetadataArgs,
      description: workspaceEntityMetadataArgs.description ?? null,
      targetTableName: 'DEPRECATED',
      workspaceId: context.workspaceId,
      dataSourceId: context.dataSourceId,
      isCustom: false,
      isRemote: false,
      isSystem: workspaceEntityMetadataArgs.isSystem ?? false,
    };
  }
}
