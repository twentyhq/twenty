import {
  type ObjectRecord,
  type StringFilter,
  type UUIDFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type MetadataResolvedFieldResolverInstance } from 'src/engine/api/common/common-metadata-resolved-fields/types/metadata-resolved-field-resolver-instance.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type ChannelAssociationChannelRow } from 'src/modules/connected-account/metadata-resolved-fields/types/channel-association-channel-row.type';
import { type ChannelAssociationMetadataResolvedFieldContext } from 'src/modules/connected-account/metadata-resolved-fields/types/channel-association-metadata-resolved-field-context.type';
import { computeChannelIdFilterFromSourceFilter } from 'src/modules/connected-account/metadata-resolved-fields/utils/compute-channel-id-filter-from-source-filter.util';

// TODO(charles): drop the accountOwnerId and handle columns and index once 2.63 leaves the cross-upgrade window
export abstract class ChannelAssociationMetadataResolvedFieldResolver implements MetadataResolvedFieldResolverInstance<
  ChannelAssociationMetadataResolvedFieldContext,
  StringFilter & UUIDFilter
> {
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
  }): Promise<ChannelAssociationMetadataResolvedFieldContext> {
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
    context: Pick<
      ChannelAssociationMetadataResolvedFieldContext,
      'channelAssociationSourceByChannelId'
    >;
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
    metadataResolvedFieldName,
    metadataResolvedFieldFilter,
    context,
  }: {
    metadataResolvedFieldName: string;
    metadataResolvedFieldFilter: StringFilter & UUIDFilter;
    context: Pick<
      ChannelAssociationMetadataResolvedFieldContext,
      'channelAssociationSources'
    >;
  }): ObjectRecordFilter {
    return computeChannelIdFilterFromSourceFilter({
      channelIdColumnName: this.channelIdColumnName,
      metadataResolvedFieldName,
      metadataResolvedFieldFilter,
      channelAssociationSources: context.channelAssociationSources,
    });
  }
}
