import {
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildWorkspaceAccessGroups } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-groups.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_ID = 'object-id';
const BROKEN_ROLE_ID = 'broken';
const TIMESTAMP = '2026-01-01T00:00:00.000Z';

const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatObjectMetadataMock({
    id: OBJECT_ID,
    universalIdentifier: OBJECT_ID,
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const noAccess: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  restrictedFields: {},
};

const buildRoleRecordsPermissions = (
  objectRecordsPermissions: ObjectRecordsPermissions,
): RoleRecordsPermissions => ({
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  objects: { [OBJECT_ID]: objectRecordsPermissions },
});

const rolesPermissions: Record<string, RoleRecordsPermissions> = {
  healthy: buildRoleRecordsPermissions({
    ...noAccess,
    canReadAllRecords: true,
  }),
  [BROKEN_ROLE_ID]: buildRoleRecordsPermissions({
    ...noAccess,
    rowLevelRecordsPermissions: {
      canCreateRecords: false,
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      predicates: [
        {
          id: 'stale',
          fieldMetadataId: 'field-id',
          objectMetadataId: OBJECT_ID,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: null,
          subFieldName: null,
          rowLevelPermissionPredicateGroupId: 'rule',
          workspaceMemberFieldMetadataId: 'gone-field',
          workspaceMemberSubFieldName: null,
          roleId: BROKEN_ROLE_ID,
        },
      ],
      predicateGroups: [
        {
          id: 'rule',
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          objectMetadataId: OBJECT_ID,
          parentRowLevelPermissionPredicateGroupId: null,
          positionInRowLevelPermissionPredicateGroup: null,
          canReadRecords: true,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
          roleId: BROKEN_ROLE_ID,
        },
      ],
    },
  }),
};

const workspaceMember: FlatWorkspaceMember = {
  id: 'member',
  userId: 'user',
  deletedAt: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  position: 0,
  name: { firstName: 'Jane', lastName: 'Doe' },
  colorScheme: 'System',
  uiScale: 'Default',
  openRecordIn: 'SIDE_PANEL',
  locale: 'en',
  avatarUrl: null,
  userEmail: null,
  jobTitle: null,
  calendarStartDay: 0,
  timeZone: 'system',
  dateFormat: 'SYSTEM',
  timeFormat: 'SYSTEM',
  searchVector: '',
  numberFormat: 'SYSTEM',
  assignedTasks: [],
  accountOwnerForCompanies: [],
  authoredAttachments: [],
  messageParticipants: [],
  blocklist: [],
  calendarEventParticipants: [],
  timelineActivities: [],
  agentMessages: [],
  agentChatThreads: [],
  agentChatThreadParticipants: [],
  agentMessageReactions: [],
  assignedAgentChatThreads: [],
  ownedOpportunities: [],
};

describe('buildWorkspaceAccessGroups', () => {
  it('should report a role it cannot compute and still build the others', () => {
    const { accessGroups, hasFailures } = buildWorkspaceAccessGroups({
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      userWorkspaceRoleMap: { 'user-workspace': BROKEN_ROLE_ID },
      flatWorkspaceMemberMaps: {
        idByUserWorkspaceId: { 'user-workspace': workspaceMember.id },
        byId: { [workspaceMember.id]: workspaceMember },
      },
    });

    expect(accessGroups.map(({ roleId }) => roleId)).toEqual(['healthy']);
    expect(hasFailures).toBe(true);
  });
});
