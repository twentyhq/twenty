import { MessageChannelVisibility } from 'twenty-shared/types';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { buildChannelVisibilityRules } from 'src/engine/permissions/channel-visibility/utils/build-channel-visibility-rules.util';

const buildChannel = ({
  id,
  ownerUserWorkspaceId,
  visibility,
}: {
  id: string;
  ownerUserWorkspaceId: string;
  visibility: MessageChannelVisibility;
}) =>
  ({
    id,
    visibility,
    connectedAccount: { userWorkspaceId: ownerUserWorkspaceId },
  }) as MessageChannelEntity;

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

const buildChannelIdsByVisibility = (userWorkspaceId: string) =>
  Object.fromEntries(
    buildChannelVisibilityRules({
      userWorkspaceId,
      channels,
      objectMetadataUniversalIdentifier: 'message',
      associationRelationFieldMetadataUniversalIdentifier: 'associations',
      channelIdFieldMetadataUniversalIdentifier: 'channelId',
      unreadableFieldMetadataUniversalIdentifiersByVisibility: {},
    }).map(({ ruleKey, value }) => [ruleKey, value]),
  );

describe('buildChannelVisibilityRules', () => {
  it('should give the owner everything on a channel, whatever it shares', () => {
    expect(buildChannelIdsByVisibility('jane')).toEqual({
      'message:SHARE_EVERYTHING': ['c1', 'c3'],
      'message:SUBJECT': ['c2'],
    });
  });

  it('should give another member what each channel shares, with no rule for an empty level', () => {
    expect(buildChannelIdsByVisibility('alice')).toEqual({
      'message:METADATA': ['c1'],
      'message:SUBJECT': ['c2'],
      'message:SHARE_EVERYTHING': ['c3'],
    });
  });
});
