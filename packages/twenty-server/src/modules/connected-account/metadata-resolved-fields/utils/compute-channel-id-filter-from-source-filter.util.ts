import { type StringFilter, type UUIDFilter } from 'twenty-shared/types';
import {
  isDefined,
  isMatchingStringFilter,
  isMatchingUUIDFilter,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { METADATA_RESOLVED_FIELD_NO_MATCH_SENTINEL_ID } from 'src/engine/api/common/common-metadata-resolved-fields/constants/metadata-resolved-field-no-match-sentinel-id.constant';
import { type ChannelAssociationSource } from 'src/modules/connected-account/metadata-resolved-fields/types/channel-association-source.type';

const isSourceMatchingFilter = ({
  source,
  metadataResolvedFieldName,
  metadataResolvedFieldFilter,
}: {
  source: Pick<ChannelAssociationSource, 'handle' | 'accountOwnerId'>;
  metadataResolvedFieldName: string;
  metadataResolvedFieldFilter: StringFilter & UUIDFilter;
}): boolean => {
  if (metadataResolvedFieldName === 'handle') {
    return isMatchingStringFilter({
      stringFilter: metadataResolvedFieldFilter,
      value: source.handle,
    });
  }

  if (!isDefined(source.accountOwnerId)) {
    return metadataResolvedFieldFilter.is === 'NULL';
  }

  return isMatchingUUIDFilter({
    uuidFilter: metadataResolvedFieldFilter,
    value: source.accountOwnerId,
  });
};

export const computeChannelIdFilterFromSourceFilter = ({
  channelIdColumnName,
  metadataResolvedFieldName,
  metadataResolvedFieldFilter,
  channelAssociationSources,
}: {
  channelIdColumnName: string;
  metadataResolvedFieldName: string;
  metadataResolvedFieldFilter: StringFilter & UUIDFilter;
  channelAssociationSources: ChannelAssociationSource[];
}): ObjectRecordFilter => {
  const channelIds = channelAssociationSources
    .filter((source) =>
      isSourceMatchingFilter({
        source,
        metadataResolvedFieldName,
        metadataResolvedFieldFilter,
      }),
    )
    .map(({ channelId }) => channelId);

  return {
    [channelIdColumnName]: {
      in:
        channelIds.length > 0
          ? channelIds
          : [METADATA_RESOLVED_FIELD_NO_MATCH_SENTINEL_ID],
    },
  };
};
