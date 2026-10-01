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
  // puts the previous visibility back rather than leave them disagreeing. The
  // whole change runs under the channel's sync lock, so the rollback cannot
  // undo a change made in the meantime.
  async changeChannelVisibility({
    workspaceId,
    source,
    channelId,
    applyVisibilityChange,
  }: Omit<SyncChannelRecordSharesArgs, 'recordIds'> & {
    workspaceId: string;
    // Returns how to revert the change, or nothing when visibility is unchanged.
    applyVisibilityChange: () => Promise<(() => Promise<unknown>) | undefined>;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await this.lockChannel({ transactionScope, channelId });

            const revertVisibilityChange = await applyVisibilityChange();

            if (!isDefined(revertVisibilityChange)) {
              return;
            }

            try {
              await this.syncChannelRecordSharesInTransaction({
                transactionScope,
                source,
                channelId,
              });
            } catch (error) {
              await revertVisibilityChange();

              throw error;
            }
          },
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
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

    await this.lockChannel({ transactionScope, channelId });

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

  // Serializes with every other sync of the channel until commit, so a
  // visibility change cannot interleave with an import computed from the
  // previous visibility.
  private async lockChannel({
    transactionScope,
    channelId,
  }: {
    transactionScope: WorkspaceTransactionScope;
    channelId: string;
  }): Promise<void> {
    await transactionScope.executeRawQuery(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [`channel-record-share:${transactionScope.workspaceId}:${channelId}`],
    );
  }
}
