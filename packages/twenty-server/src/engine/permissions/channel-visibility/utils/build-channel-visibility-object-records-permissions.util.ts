import { type ObjectRecordsPermissionsManifest } from 'twenty-shared/application';
import {
  MessageChannelVisibility,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v5 } from 'uuid';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceMemberIndividualRoleHolder } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';
import { getWorkspaceMemberIndividualRoleUniversalIdentifier } from 'src/engine/permissions/workspace-member-individual-role/utils/get-workspace-member-individual-role-universal-identifier.util';

export const buildChannelVisibilityObjectRecordsPermissions = ({
  holder,
  channels,
  objectUniversalIdentifier,
  associationRelationFieldUniversalIdentifier,
  channelIdFieldUniversalIdentifier,
  unreadableFieldUniversalIdentifiersByVisibility,
  canUpdateRecords,
}: {
  holder: WorkspaceMemberIndividualRoleHolder;
  channels: (Pick<
    MessageChannelEntity | CalendarChannelEntity,
    'id' | 'visibility'
  > & {
    connectedAccount: Pick<ConnectedAccountEntity, 'userWorkspaceId'> | null;
  })[];
  objectUniversalIdentifier: string;
  associationRelationFieldUniversalIdentifier: string;
  channelIdFieldUniversalIdentifier: string;
  unreadableFieldUniversalIdentifiersByVisibility: Partial<
    Record<MessageChannelVisibility, string[]>
  >;
  canUpdateRecords: boolean;
}): ObjectRecordsPermissionsManifest => {
  const roleUniversalIdentifier =
    getWorkspaceMemberIndividualRoleUniversalIdentifier({ holder });
  // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
  const isOwnedByHolder = (channel: (typeof channels)[number]): boolean =>
    holder.type === 'userWorkspace' &&
    channel.connectedAccount?.userWorkspaceId === holder.userWorkspaceId;

  return {
    objectUniversalIdentifier,
    rowLevelRecordsPermissions: Object.values(MessageChannelVisibility).flatMap(
      (visibility) => {
        const channelIds = channels
          .filter(
            (channel) =>
              (isOwnedByHolder(channel)
                ? MessageChannelVisibility.SHARE_EVERYTHING
                : channel.visibility) === visibility,
          )
          .map(({ id }) => id);

        if (channelIds.length === 0) {
          return [];
        }

        const buildUniversalIdentifier = (kind: string) =>
          v5(
            `${objectUniversalIdentifier}:${visibility}:${kind}`,
            roleUniversalIdentifier,
          );

        return [
          {
            universalIdentifier: buildUniversalIdentifier('rule'),
            canReadRecords: true,
            unreadableFields:
              unreadableFieldUniversalIdentifiersByVisibility[visibility] ?? [],
            canUpdateRecords,
            predicateGroups: [
              {
                universalIdentifier: buildUniversalIdentifier('group'),
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    universalIdentifier: buildUniversalIdentifier('predicate'),
                    fieldUniversalIdentifier: channelIdFieldUniversalIdentifier,
                    relationFieldUniversalIdentifier:
                      associationRelationFieldUniversalIdentifier,
                    operand: RowLevelPermissionPredicateOperand.IS,
                    value: channelIds,
                  },
                ],
              },
            ],
          },
        ];
      },
    ),
  };
};
