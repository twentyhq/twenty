import { MessageChannelVisibility } from 'twenty-shared/types';

import { buildChannelVisibilityObjectRecordsPermissions } from 'src/engine/permissions/channel-visibility/utils/build-channel-visibility-object-records-permissions.util';
import { type WorkspaceMemberIndividualRoleHolder } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';

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

const findReadableChannelIds = (holder: WorkspaceMemberIndividualRoleHolder) =>
  (
    buildChannelVisibilityObjectRecordsPermissions({
      holder,
      channels,
      objectUniversalIdentifier: 'message',
      associationRelationFieldUniversalIdentifier: 'associations',
      channelIdFieldUniversalIdentifier: 'channelId',
      unreadableFieldUniversalIdentifiersByVisibility: {
        [MessageChannelVisibility.METADATA]: ['subject'],
      },
      canUpdateRecords: false,
    }).rowLevelRecordsPermissions ?? []
  ).map(({ unreadableFields, predicateGroups }) => ({
    unreadableFields,
    channelIds: predicateGroups?.[0]?.predicates?.[0]?.value,
  }));

describe('buildChannelVisibilityObjectRecordsPermissions', () => {
  it('should give the owner everything on a channel, whatever it shares', () => {
    expect(
      findReadableChannelIds({
        type: 'userWorkspace',
        userWorkspaceId: 'jane',
      }),
    ).toEqual([
      { unreadableFields: [], channelIds: ['c2'] },
      { unreadableFields: [], channelIds: ['c1', 'c3'] },
    ]);
  });

  it('should give another member what each channel shares, with no rule for an empty level', () => {
    expect(
      findReadableChannelIds({
        type: 'userWorkspace',
        userWorkspaceId: 'alice',
      }),
    ).toEqual([
      { unreadableFields: ['subject'], channelIds: ['c1'] },
      { unreadableFields: [], channelIds: ['c2'] },
      { unreadableFields: [], channelIds: ['c3'] },
    ]);
  });

  // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
  it('should give API keys what each channel shares, since they own no channel', () => {
    expect(findReadableChannelIds({ type: 'apiKeys' })).toEqual([
      { unreadableFields: ['subject'], channelIds: ['c1'] },
      { unreadableFields: [], channelIds: ['c2'] },
      { unreadableFields: [], channelIds: ['c3'] },
    ]);
  });

  it('should let visible records be updated when asked', () => {
    expect(
      buildChannelVisibilityObjectRecordsPermissions({
        holder: { type: 'userWorkspace', userWorkspaceId: 'alice' },
        channels,
        objectUniversalIdentifier: 'calendarEvent',
        associationRelationFieldUniversalIdentifier: 'associations',
        channelIdFieldUniversalIdentifier: 'channelId',
        unreadableFieldUniversalIdentifiersByVisibility: {},
        canUpdateRecords: true,
      }).rowLevelRecordsPermissions?.map(
        ({ canUpdateRecords }) => canUpdateRecords,
      ),
    ).toEqual([true, true, true]);
  });
});
