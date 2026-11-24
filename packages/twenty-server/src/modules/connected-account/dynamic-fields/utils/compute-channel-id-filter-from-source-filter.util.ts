import { type StringFilter, type UUIDFilter } from 'twenty-shared/types';
import {
  isDefined,
  isMatchingStringFilter,
  isMatchingUUIDFilter,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { DYNAMIC_FIELD_NO_MATCH_SENTINEL_ID } from 'src/engine/api/common/common-dynamic-fields/constants/dynamic-field-no-match-sentinel-id.constant';
import { type ChannelAssociationSource } from 'src/modules/connected-account/dynamic-fields/types/channel-association-source.type';

const isSourceMatchingFilter = ({
  source,
  dynamicFieldName,
  dynamicFieldFilter,
}: {
  source: ChannelAssociationSource;
  dynamicFieldName: string;
  dynamicFieldFilter: Record<string, unknown>;
}): boolean => {
  if (dynamicFieldName === 'handle') {
    return isMatchingStringFilter({
      stringFilter: dynamicFieldFilter as StringFilter,
      value: source.handle,
    });
  }

  return isDefined(source.accountOwnerId)
    ? isMatchingUUIDFilter({
        uuidFilter: dynamicFieldFilter as UUIDFilter,
        value: source.accountOwnerId,
      })
    : dynamicFieldFilter.is === 'NULL';
};

export const computeChannelIdFilterFromSourceFilter = ({
  channelIdColumnName,
  dynamicFieldName,
  dynamicFieldFilter,
  channelAssociationSources,
}: {
  channelIdColumnName: string;
  dynamicFieldName: string;
  dynamicFieldFilter: Record<string, unknown>;
  channelAssociationSources: ChannelAssociationSource[];
}): ObjectRecordFilter => {
  const channelIds = channelAssociationSources
    .filter((source) =>
      isSourceMatchingFilter({ source, dynamicFieldName, dynamicFieldFilter }),
    )
    .map(({ channelId }) => channelId);

  return {
    [channelIdColumnName]: {
      in:
        channelIds.length > 0
          ? channelIds
          : [DYNAMIC_FIELD_NO_MATCH_SENTINEL_ID],
    },
  };
};
