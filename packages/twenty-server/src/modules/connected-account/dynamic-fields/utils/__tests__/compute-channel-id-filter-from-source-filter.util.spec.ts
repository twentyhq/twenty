import { DYNAMIC_FIELD_NO_MATCH_SENTINEL_ID } from 'src/engine/api/common/common-dynamic-fields/constants/dynamic-field-no-match-sentinel-id.constant';
import { type ChannelAssociationSource } from 'src/modules/connected-account/dynamic-fields/types/channel-association-source.type';
import { computeChannelIdFilterFromSourceFilter } from 'src/modules/connected-account/dynamic-fields/utils/compute-channel-id-filter-from-source-filter.util';
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
  dynamicFieldName,
  dynamicFieldFilter,
}: {
  dynamicFieldName: string;
  dynamicFieldFilter: Record<string, unknown>;
}) =>
  computeChannelIdFilterFromSourceFilter({
    channelIdColumnName: 'messageChannelId',
    dynamicFieldName,
    dynamicFieldFilter,
    channelAssociationSources: CHANNEL_ASSOCIATION_SOURCES,
  }).messageChannelId.in;

describe('computeChannelIdFilterFromSourceFilter', () => {
  it.each([
    [{ eq: 'tim' }, ['tim-channel']],
    [{ in: ['tim', 'jony'] }, ['tim-channel', 'jony-channel']],
    [{ neq: 'tim' }, ['jony-channel']],
    [{ is: 'NULL' }, ['shared-channel']],
    [{ is: 'NOT_NULL' }, ['tim-channel', 'jony-channel']],
    [{ eq: 'nobody' }, [DYNAMIC_FIELD_NO_MATCH_SENTINEL_ID]],
  ])(
    'should turn account owner filter %j into channels',
    (dynamicFieldFilter, expected) => {
      expect(
        computeChannelIds({
          dynamicFieldName: 'accountOwnerId',
          dynamicFieldFilter,
        }),
      ).toEqual(expected);
    },
  );

  it('should match channels by handle', () => {
    expect(
      computeChannelIds({
        dynamicFieldName: 'handle',
        dynamicFieldFilter: { ilike: '%SUPPORT%' },
      }),
    ).toEqual(['shared-channel']);
  });
});
