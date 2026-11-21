import {
  MessageChannelVisibility,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceMemberIndividualRoleRule } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';

export const buildChannelVisibilityRules = ({
  userWorkspaceId,
  channels,
  objectMetadataUniversalIdentifier,
  associationRelationFieldMetadataUniversalIdentifier,
  channelIdFieldMetadataUniversalIdentifier,
  unreadableFieldMetadataUniversalIdentifiersByVisibility,
}: {
  userWorkspaceId: string;
  channels: (MessageChannelEntity | CalendarChannelEntity)[];
  objectMetadataUniversalIdentifier: string;
  associationRelationFieldMetadataUniversalIdentifier: string;
  channelIdFieldMetadataUniversalIdentifier: string;
  unreadableFieldMetadataUniversalIdentifiersByVisibility: Partial<
    Record<MessageChannelVisibility, string[]>
  >;
}): WorkspaceMemberIndividualRoleRule[] =>
  Object.values(MessageChannelVisibility).flatMap((visibility) => {
    const channelIds = channels
      .filter(
        (channel) =>
          (channel.connectedAccount?.userWorkspaceId === userWorkspaceId
            ? MessageChannelVisibility.SHARE_EVERYTHING
            : channel.visibility) === visibility,
      )
      .map(({ id }) => id);

    // a rule without a channel would be refused, and grants nothing anyway
    if (channelIds.length === 0) {
      return [];
    }

    return [
      {
        ruleKey: `${objectMetadataUniversalIdentifier}:${visibility}`,
        objectMetadataUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          channelIdFieldMetadataUniversalIdentifier,
        relationFieldMetadataUniversalIdentifier:
          associationRelationFieldMetadataUniversalIdentifier,
        operand: RowLevelPermissionPredicateOperand.IS,
        value: channelIds,
        unreadableFieldMetadataUniversalIdentifiers:
          unreadableFieldMetadataUniversalIdentifiersByVisibility[visibility] ??
          [],
      },
    ];
  });
