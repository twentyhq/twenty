import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type DynamicFieldResolverInstance } from 'src/engine/api/common/common-dynamic-fields/types/dynamic-field-resolver-instance.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type ChannelAssociationChannelRow } from 'src/modules/connected-account/dynamic-fields/types/channel-association-channel-row.type';
import { type ChannelAssociationDynamicFieldContext } from 'src/modules/connected-account/dynamic-fields/types/channel-association-dynamic-field-context.type';
import { computeChannelIdFilterFromSourceFilter } from 'src/modules/connected-account/dynamic-fields/utils/compute-channel-id-filter-from-source-filter.util';

export abstract class ChannelAssociationDynamicFieldResolver implements DynamicFieldResolverInstance<ChannelAssociationDynamicFieldContext> {
  abstract readonly objectUniversalIdentifier: string;
  abstract readonly channelIdColumnName: string;

  get sourceColumnNames(): string[] {
    return [this.channelIdColumnName];
  }

  protected abstract readonly workspaceCacheService: WorkspaceCacheService;

  protected abstract findChannelRows(
    workspaceId: string,
  ): Promise<ChannelAssociationChannelRow[]>;

  async loadContext({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<ChannelAssociationDynamicFieldContext> {
    const [channelRows, { flatWorkspaceMemberMaps }] = await Promise.all([
      this.findChannelRows(workspaceId),
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]),
    ]);

    const channelAssociationSources = channelRows.map(
      ({ id, handle, userWorkspaceId, hasAccountOwner }) => ({
        channelId: id,
        handle,
        accountOwnerId:
          hasAccountOwner && isDefined(userWorkspaceId)
            ? (flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId] ??
              null)
            : null,
      }),
    );

    return {
      channelAssociationSources,
      channelAssociationSourceByChannelId: new Map(
        channelAssociationSources.map((source) => [source.channelId, source]),
      ),
    };
  }

  computeValues({
    record,
    context,
  }: {
    record: ObjectRecord;
    context: ChannelAssociationDynamicFieldContext;
  }): Partial<ObjectRecord> {
    const source = context.channelAssociationSourceByChannelId.get(
      record[this.channelIdColumnName],
    );

    return {
      accountOwnerId: source?.accountOwnerId ?? null,
      handle: source?.handle ?? null,
    };
  }

  computeSourceFilter({
    dynamicFieldName,
    dynamicFieldFilter,
    context,
  }: {
    dynamicFieldName: string;
    dynamicFieldFilter: Record<string, unknown>;
    context: ChannelAssociationDynamicFieldContext;
  }): ObjectRecordFilter {
    return computeChannelIdFilterFromSourceFilter({
      channelIdColumnName: this.channelIdColumnName,
      dynamicFieldName,
      dynamicFieldFilter,
      channelAssociationSources: context.channelAssociationSources,
    });
  }
}
