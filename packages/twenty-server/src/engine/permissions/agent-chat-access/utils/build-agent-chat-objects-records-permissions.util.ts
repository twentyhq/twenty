import { type ObjectRecordsPermissionsManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { getWorkspaceMemberIndividualRoleUniversalIdentifier } from 'src/engine/permissions/workspace-member-individual-role/utils/get-workspace-member-individual-role-universal-identifier.util';

const { agentChatThread, agentChatThreadParticipant, agentChatThreadTarget } =
  STANDARD_OBJECTS;

const NO_ALL_RECORDS_PERMISSIONS = {
  canReadAllRecords: false,
  canCreateAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
};

export const buildAgentChatObjectsRecordsPermissions = ({
  userWorkspaceId,
  workspaceMemberId,
  hasAiAccess,
  readableChannelIds,
}: {
  userWorkspaceId: string;
  workspaceMemberId: string;
  hasAiAccess: boolean;
  readableChannelIds: string[];
}): ObjectRecordsPermissionsManifest[] => {
  const roleUniversalIdentifier =
    getWorkspaceMemberIndividualRoleUniversalIdentifier(userWorkspaceId);

  const buildRule = ({
    name,
    objectUniversalIdentifier,
    fieldUniversalIdentifier,
    value,
    canUpdateRecords = true,
    canDeleteRecords = false,
  }: {
    name: string;
    objectUniversalIdentifier: string;
    fieldUniversalIdentifier: string;
    value: RowLevelPermissionPredicateValue;
    canUpdateRecords?: boolean;
    canDeleteRecords?: boolean;
  }) => {
    const buildUniversalIdentifier = (kind: string) =>
      v5(
        `agentChat:${objectUniversalIdentifier}:${name}:${kind}`,
        roleUniversalIdentifier,
      );

    return {
      universalIdentifier: buildUniversalIdentifier('rule'),
      canReadRecords: true,
      canUpdateRecords,
      canSoftDeleteRecords: canDeleteRecords,
      canDestroyRecords: canDeleteRecords,
      predicateGroups: [
        {
          universalIdentifier: buildUniversalIdentifier('group'),
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          predicates: [
            {
              universalIdentifier: buildUniversalIdentifier('predicate'),
              fieldUniversalIdentifier,
              operand: RowLevelPermissionPredicateOperand.IS,
              value,
            },
          ],
        },
      ],
    };
  };

  const memberValue = { selectedRecordIds: [workspaceMemberId] };

  if (!hasAiAccess) {
    return [
      agentChatThread,
      agentChatThreadParticipant,
      agentChatThreadTarget,
    ].map(({ universalIdentifier }) => ({
      objectUniversalIdentifier: universalIdentifier,
      ...NO_ALL_RECORDS_PERMISSIONS,
    }));
  }

  return [
    {
      objectUniversalIdentifier: agentChatThread.universalIdentifier,
      ...NO_ALL_RECORDS_PERMISSIONS,
      canCreateAllRecords: true,
      rowLevelRecordsPermissions: [
        buildRule({
          name: 'owner',
          objectUniversalIdentifier: agentChatThread.universalIdentifier,
          fieldUniversalIdentifier:
            agentChatThread.fields.workspaceMember.universalIdentifier,
          value: memberValue,
          canDeleteRecords: true,
        }),
        ...(isNonEmptyArray(readableChannelIds)
          ? [
              buildRule({
                name: 'channels',
                objectUniversalIdentifier: agentChatThread.universalIdentifier,
                fieldUniversalIdentifier:
                  agentChatThread.fields.channelId.universalIdentifier,
                value: readableChannelIds,
              }),
            ]
          : []),
      ],
    },
    {
      objectUniversalIdentifier: agentChatThreadParticipant.universalIdentifier,
      ...NO_ALL_RECORDS_PERMISSIONS,
      rowLevelRecordsPermissions: [
        buildRule({
          name: 'self',
          objectUniversalIdentifier:
            agentChatThreadParticipant.universalIdentifier,
          fieldUniversalIdentifier:
            agentChatThreadParticipant.fields.workspaceMember
              .universalIdentifier,
          value: memberValue,
        }),
      ],
    },
    // Targets are reached through their thread
    {
      objectUniversalIdentifier: agentChatThreadTarget.universalIdentifier,
      ...NO_ALL_RECORDS_PERMISSIONS,
      canCreateAllRecords: true,
    },
  ];
};
