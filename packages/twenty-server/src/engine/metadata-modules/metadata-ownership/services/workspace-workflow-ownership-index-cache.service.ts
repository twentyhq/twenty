import { Injectable } from '@nestjs/common';

import { WorkspaceMultiSourceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-multi-source-derived-cache-provider.service';

import { WORKFLOW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES } from 'src/engine/metadata-modules/metadata-ownership/constants/workflow-ownership-index-source-key-names.constant';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { buildMetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/utils/build-metadata-ownership-index.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

type WorkflowOwnershipIndexSourceKeyName =
  (typeof WORKFLOW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES)[number];

@Injectable()
@WorkspaceDerivedCache('workflowOwnershipIndex')
export class WorkspaceWorkflowOwnershipIndexCacheService extends WorkspaceMultiSourceDerivedCacheProvider<
  'workflowOwnershipIndex',
  WorkflowOwnershipIndexSourceKeyName
> {
  readonly sourceKeyNames = WORKFLOW_OWNERSHIP_INDEX_SOURCE_KEY_NAMES;

  protected computeFromSources(
    sources: Pick<WorkspaceCacheDataMap, WorkflowOwnershipIndexSourceKeyName>,
  ): MetadataOwnershipIndex {
    return buildMetadataOwnershipIndex({
      rootMetadataName: 'workflow',
      rootFlatEntityMaps: sources.flatWorkflowMaps,
      childFlatEntityMapsByMetadataName: {
        workflowVersion: sources.flatWorkflowVersionMaps,
      },
    });
  }
}
