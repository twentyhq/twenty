import { MessageChannelVisibility } from 'twenty-shared/types';

import { buildChannelVisibilityObjectRecordsPermissions } from 'src/engine/permissions/channel-visibility/utils/build-channel-visibility-object-records-permissions.util';

const buildChannel = ({
  id,
  ownerUserWorkspaceId,
  visibility,
}: {
  id: string;
  ownerUserWorkspaceId: string;
  visibility: MessageChannelVisibility;
}) => ({
  id,
  visibility,
  connectedAccount: { userWorkspaceId: ownerUserWorkspaceId },
});

const channels = [
  buildChannel({
    id: 'c1',
    ownerUserWorkspaceId: 'jane',
    visibility: MessageChannelVisibility.METADATA,
  }),
  buildChannel({
    id: 'c2',
    ownerUserWorkspaceId: 'bob',
    visibility: MessageChannelVisibility.SUBJECT,
  }),
  buildChannel({
    id: 'c3',
    ownerUserWorkspaceId: 'bob',
    visibility: MessageChannelVisibility.SHARE_EVERYTHING,
  }),
];

const findReadableChannelIds = (userWorkspaceId: string) =>
  (
    buildChannelVisibilityObjectRecordsPermissions({
      userWorkspaceId,
      channels,
      objectUniversalIdentifier: 'message',
      associationRelationFieldUniversalIdentifier: 'associations',
      channelIdFieldUniversalIdentifier: 'channelId',
      unreadableFieldUniversalIdentifiersByVisibility: {
        [MessageChannelVisibility.METADATA]: ['subject'],
      },
    }).rowLevelRecordsPermissions ?? []
  ).map(({ unreadableFields, predicateGroups }) => ({
    unreadableFields,
    channelIds: predicateGroups?.[0]?.predicates?.[0]?.value,
  }));

describe('buildChannelVisibilityObjectRecordsPermissions', () => {
  it('should give the owner everything on a channel, whatever it shares', () => {
    expect(findReadableChannelIds('jane')).toEqual([
      { unreadableFields: [], channelIds: ['c2'] },
      { unreadableFields: [], channelIds: ['c1', 'c3'] },
    ]);
  });

  it('should give another member what each channel shares, with no rule for an empty level', () => {
    expect(findReadableChannelIds('alice')).toEqual([
      { unreadableFields: ['subject'], channelIds: ['c1'] },
      { unreadableFields: [], channelIds: ['c2'] },
      { unreadableFields: [], channelIds: ['c3'] },
    ]);
  });
});
