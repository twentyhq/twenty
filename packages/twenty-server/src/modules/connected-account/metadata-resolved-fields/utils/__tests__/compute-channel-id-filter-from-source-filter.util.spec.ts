import { type StringFilter, type UUIDFilter } from 'twenty-shared/types';

import { METADATA_RESOLVED_FIELD_NO_MATCH_SENTINEL_ID } from 'src/engine/api/common/common-metadata-resolved-fields/constants/metadata-resolved-field-no-match-sentinel-id.constant';
import { type ChannelAssociationSource } from 'src/modules/connected-account/metadata-resolved-fields/types/channel-association-source.type';
import { computeChannelIdFilterFromSourceFilter } from 'src/modules/connected-account/metadata-resolved-fields/utils/compute-channel-id-filter-from-source-filter.util';
const CHANNEL_ASSOCIATION_SOURCES: ChannelAssociationSource[] = [
  { channelId: 'tim-channel', handle: 'tim@apple.dev', accountOwnerId: 'tim' },
  {
    channelId: 'jony-channel',
    handle: 'jony@apple.dev',
    accountOwnerId: 'jony',
  },
  {
    channelId: 'shared-channel',
    handle: 'support@apple.dev',
    accountOwnerId: null,
  },
];

const computeChannelIds = ({
  metadataResolvedFieldName,
  metadataResolvedFieldFilter,
}: {
  metadataResolvedFieldName: string;
  metadataResolvedFieldFilter: StringFilter & UUIDFilter;
}) =>
  computeChannelIdFilterFromSourceFilter({
    channelIdColumnName: 'messageChannelId',
    metadataResolvedFieldName,
    metadataResolvedFieldFilter,
    channelAssociationSources: CHANNEL_ASSOCIATION_SOURCES,
  }).messageChannelId.in;

describe('computeChannelIdFilterFromSourceFilter', () => {
  it.each<[StringFilter & UUIDFilter, string[]]>([
    [{ eq: 'tim' }, ['tim-channel']],
    [{ in: ['tim', 'jony'] }, ['tim-channel', 'jony-channel']],
    [{ neq: 'tim' }, ['jony-channel']],
    [{ is: 'NULL' }, ['shared-channel']],
    [{ is: 'NOT_NULL' }, ['tim-channel', 'jony-channel']],
    [{ eq: 'nobody' }, [METADATA_RESOLVED_FIELD_NO_MATCH_SENTINEL_ID]],
  ])(
    'should turn account owner filter %j into channels',
    (metadataResolvedFieldFilter, expected) => {
      expect(
        computeChannelIds({
          metadataResolvedFieldName: 'accountOwnerId',
          metadataResolvedFieldFilter,
        }),
      ).toEqual(expected);
    },
  );

  it('should match channels by handle', () => {
    expect(
      computeChannelIds({
        metadataResolvedFieldName: 'handle',
        metadataResolvedFieldFilter: { ilike: '%SUPPORT%' },
      }),
    ).toEqual(['shared-channel']);
  });
});
