import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { CONNECTED_ACCOUNT_DELETED_EVENT } from 'src/engine/metadata-modules/connected-account/constants/connected-account-deleted.constant';
import { type ConnectedAccountDeletedEvent } from 'src/engine/metadata-modules/connected-account/types/connected-account-deleted.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class McpServerConnectedAccountListener {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @OnCustomBatchEvent(CONNECTED_ACCOUNT_DELETED_EVENT)
  async handleDeletedEvent(
    batchEvent: CustomWorkspaceEventBatch<ConnectedAccountDeletedEvent>,
  ): Promise<void> {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    const deletedConnectedAccountIds = new Set(
      batchEvent.events.map(({ connectedAccountId }) => connectedAccountId),
    );

    const { flatMcpServerMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    const referencesDeletedConnectedAccount = Object.values(
      flatMcpServerMaps.byUniversalIdentifier,
    ).some(
      (flatMcpServer) =>
        isDefined(flatMcpServer?.connectedAccountId) &&
        deletedConnectedAccountIds.has(flatMcpServer.connectedAccountId),
    );

    if (!referencesDeletedConnectedAccount) {
      return;
    }

    await this.workspaceManyOrAllFlatEntityMapsCacheService.invalidateFlatEntityMaps(
      { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
    );
  }
}
