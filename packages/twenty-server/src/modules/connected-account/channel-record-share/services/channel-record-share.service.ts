import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { type ChannelRecordShareSource } from 'src/modules/connected-account/channel-record-share/types/channel-record-share-source.type';
import { buildChannelRecordShareSyncQueries } from 'src/modules/connected-account/channel-record-share/utils/build-channel-record-share-sync-queries.util';

type SyncChannelRecordSharesArgs = {
  source: ChannelRecordShareSource;
  channelId: string;
  // Omitted to sync every record of the channel.
  recordIds?: string[];
};

// A synced record is shared with the members whose channels synced it, and
// with everyone when one of those channels shares everything. Those grants are
// derived from the channel associations rather than set by hand, so syncing
// rewrites them from the associations and the channel as they stand.
@Injectable()
export class ChannelRecordShareService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async syncChannelRecordShares({
    workspaceId,
    ...args
  }: SyncChannelRecordSharesArgs & { workspaceId: string }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction((transactionScope) =>
          this.syncChannelRecordSharesInTransaction({
            transactionScope,
            ...args,
          }),
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  // The channel and its grants live in different schemas, so a failed sync
  // puts the previous visibility back rather than leave them disagreeing.
  async syncChannelRecordSharesAfterVisibilityChange({
    revertVisibilityChange,
    ...args
  }: SyncChannelRecordSharesArgs & {
    workspaceId: string;
    revertVisibilityChange: () => Promise<unknown>;
  }): Promise<void> {
    try {
      await this.syncChannelRecordShares(args);
    } catch (error) {
      await revertVisibilityChange();

      throw error;
    }
  }

  async syncChannelRecordSharesInTransaction({
    transactionScope,
    source,
    channelId,
    recordIds,
  }: SyncChannelRecordSharesArgs & {
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    if (isDefined(recordIds) && recordIds.length === 0) {
      return;
    }

    const { workspaceId } = transactionScope;
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const objectMetadataId =
      flatObjectMetadataMaps.byUniversalIdentifier[
        source.recordObjectUniversalIdentifier
      ]?.id;

    if (!isDefined(objectMetadataId)) {
      return;
    }

    // Serializes with every other sync of the channel until commit, so a
    // visibility change cannot interleave with an import computed from the
    // previous visibility.
    await transactionScope.executeRawQuery(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [`channel-record-share:${workspaceId}:${channelId}`],
    );

    const { deleteStaleRecordShares, insertRecordShares } =
      buildChannelRecordShareSyncQueries({
        schemaName: escapeIdentifier(getWorkspaceSchemaName(workspaceId)),
        source,
      });
    const parameters = [
      workspaceId,
      channelId,
      objectMetadataId,
      isDefined(recordIds) ? [...new Set(recordIds)] : null,
    ];

    await transactionScope.executeRawQuery(deleteStaleRecordShares, parameters);

    for (const insertRecordSharesQuery of insertRecordShares) {
      await transactionScope.executeRawQuery(
        insertRecordSharesQuery,
        parameters,
      );
    }
  }
}
