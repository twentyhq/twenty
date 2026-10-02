import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildRolesPermissions } from 'src/engine/metadata-modules/role/utils/build-roles-permissions.util';

type RoleRow = {
  id: string;
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
};

type ObjectMetadataRow = {
  id: string;
  isSystem: boolean;
  universalIdentifier: string;
  labelIdentifierFieldMetadataId: string | null;
};

type ObjectPermissionRow = {
  roleId: string;
  objectMetadataId: string;
  canReadObjectRecords?: boolean | null;
  canUpdateObjectRecords?: boolean | null;
  canSoftDeleteObjectRecords?: boolean | null;
  canDestroyObjectRecords?: boolean | null;
};

type FieldPermissionRow = {
  roleId: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  canReadFieldValue?: boolean | null;
  canUpdateFieldValue?: boolean | null;
};

type RolePermissionFlagRow = {
  roleId: string;
  permissionFlagId: string;
  flag?: PermissionFlagType;
};

type PermissionFlagRow = { id: string; universalIdentifier: string };

type RolesPermissionsFixture = {
  role: RoleRow[];
  objectMetadata: ObjectMetadataRow[];
  objectPermission: ObjectPermissionRow[];
  fieldPermission: FieldPermissionRow[];
  rolePermissionFlag: RolePermissionFlagRow[];
  permissionFlag: PermissionFlagRow[];
  rowLevelPermissionPredicate: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroup: RowLevelPermissionPredicateGroup[];
};

const groupByRoleId = <TRow extends { roleId: string }>(rows: TRow[]) => {
  const rowsByRoleId = new Map<string, TRow[]>();

  for (const row of rows) {
    rowsByRoleId.set(row.roleId, [
      ...(rowsByRoleId.get(row.roleId) ?? []),
      row,
    ]);
  }

  return { byRoleId: rowsByRoleId };
};

// The linear-scan build that pre-indexing replaced, used as the equivalence oracle
const computeRolesPermissionsWithLinearScans = (
  fixture: RolesPermissionsFixture,
): ObjectsPermissionsByRoleId => {
  const workflowObjectUniversalIdentifiers: string[] = [
    STANDARD_OBJECTS.workflow.universalIdentifier,
    STANDARD_OBJECTS.workflowRun.universalIdentifier,
    STANDARD_OBJECTS.workflowVersion.universalIdentifier,
  ];

  const hasPermissionFlag = (
    roleRolePermissionFlags: RolePermissionFlagRow[],
    permissionFlagType: PermissionFlagType,
  ) =>
    roleRolePermissionFlags.some(
      (rolePermissionFlag) =>
        (fixture.permissionFlag.find(
          (permissionFlag) =>
            permissionFlag.id === rolePermissionFlag.permissionFlagId,
        )?.universalIdentifier ??
          SystemPermissionFlag[
            rolePermissionFlag.flag as PermissionFlagType
          ]) === SystemPermissionFlag[permissionFlagType],
    );

  const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

  for (const role of fixture.role) {
    const isOwnedByRole = (row: { roleId: string }) => row.roleId === role.id;
    const roleObjectPermissions =
      fixture.objectPermission.filter(isOwnedByRole);
    const roleFieldPermissions = fixture.fieldPermission.filter(isOwnedByRole);
    const roleRolePermissionFlags =
      fixture.rolePermissionFlag.filter(isOwnedByRole);
    const rolePredicates =
      fixture.rowLevelPermissionPredicate.filter(isOwnedByRole);
    const rolePredicateGroups =
      fixture.rowLevelPermissionPredicateGroup.filter(isOwnedByRole);

    const objectRecordsPermissions: ObjectsPermissions = {};

    for (const objectMetadata of fixture.objectMetadata) {
      let canRead = role.canReadAllObjectRecords;
      let canUpdate = role.canUpdateAllObjectRecords;
      let canSoftDelete = role.canSoftDeleteAllObjectRecords;
      let canDestroy = role.canDestroyAllObjectRecords;
      const restrictedFields: RestrictedFieldsPermissions = {};

      if (
        workflowObjectUniversalIdentifiers.includes(
          objectMetadata.universalIdentifier,
        )
      ) {
        const hasWorkflowsPermissions =
          role.canUpdateAllSettings ||
          hasPermissionFlag(
            roleRolePermissionFlags,
            PermissionFlagType.WORKFLOWS,
          );

        canRead = hasWorkflowsPermissions;
        canUpdate = hasWorkflowsPermissions;
        canSoftDelete = hasWorkflowsPermissions;
        canDestroy = hasWorkflowsPermissions;
      } else {
        if (
          objectMetadata.universalIdentifier ===
          STANDARD_OBJECTS.workspaceMember.universalIdentifier
        ) {
          const hasWorkspaceMembersPermissions =
            role.canUpdateAllSettings ||
            hasPermissionFlag(
              roleRolePermissionFlags,
              PermissionFlagType.WORKSPACE_MEMBERS,
            );

          canRead = true;
          canUpdate = hasWorkspaceMembersPermissions;
          canSoftDelete = hasWorkspaceMembersPermissions;
          canDestroy = hasWorkspaceMembersPermissions;
        } else {
          const override = roleObjectPermissions.find(
            (objectPermission) =>
              objectPermission.objectMetadataId === objectMetadata.id,
          );
          const getPermissionValue = (
            overrideValue: boolean | null | undefined,
            defaultValue: boolean,
          ) => overrideValue ?? (objectMetadata.isSystem ? true : defaultValue);

          canRead = getPermissionValue(override?.canReadObjectRecords, canRead);
          canUpdate = getPermissionValue(
            override?.canUpdateObjectRecords,
            canUpdate,
          );
          canSoftDelete = getPermissionValue(
            override?.canSoftDeleteObjectRecords,
            canSoftDelete,
          );
          canDestroy = getPermissionValue(
            override?.canDestroyObjectRecords,
            canDestroy,
          );
        }

        for (const fieldPermission of roleFieldPermissions.filter(
          (fieldPermission) =>
            fieldPermission.objectMetadataId === objectMetadata.id,
        )) {
          if (
            isDefined(fieldPermission.canReadFieldValue) ||
            isDefined(fieldPermission.canUpdateFieldValue)
          ) {
            restrictedFields[fieldPermission.fieldMetadataId] = {
              canRead:
                fieldPermission.fieldMetadataId ===
                objectMetadata.labelIdentifierFieldMetadataId
                  ? true
                  : fieldPermission.canReadFieldValue,
              canUpdate: fieldPermission.canUpdateFieldValue,
            };
          }
        }
      }

      if (
        objectMetadata.universalIdentifier ===
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ) {
        const hasAiPermission =
          role.canAccessAllTools ||
          hasPermissionFlag(roleRolePermissionFlags, PermissionFlagType.AI);

        canRead = canRead && hasAiPermission;
        canUpdate = canUpdate && hasAiPermission;
        canSoftDelete = canSoftDelete && hasAiPermission;
        canDestroy = canDestroy && hasAiPermission;
      }

      objectRecordsPermissions[objectMetadata.id] = {
        canReadObjectRecords: canRead,
        canUpdateObjectRecords: canUpdate,
        canSoftDeleteObjectRecords: canSoftDelete,
        canDestroyObjectRecords: canDestroy,
        restrictedFields,
        rowLevelPermissionPredicates: rolePredicates.filter(
          (predicate) => predicate.objectMetadataId === objectMetadata.id,
        ),
        rowLevelPermissionPredicateGroups: rolePredicateGroups.filter(
          (predicateGroup) =>
            predicateGroup.objectMetadataId === objectMetadata.id,
        ),
      };
    }

    permissionsByRoleId[role.id] = objectRecordsPermissions;
  }

  return permissionsByRoleId;
};

const buildPredicate = ({
  id,
  roleId,
  objectMetadataId,
}: Pick<
  RowLevelPermissionPredicate,
  'id' | 'roleId' | 'objectMetadataId'
>): RowLevelPermissionPredicate => ({
  id,
  roleId,
  objectMetadataId,
  fieldMetadataId: `${objectMetadataId}-owner`,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
});

const buildPredicateGroup = ({
  id,
  roleId,
  objectMetadataId,
}: Pick<
  RowLevelPermissionPredicateGroup,
  'id' | 'roleId' | 'objectMetadataId'
>): RowLevelPermissionPredicateGroup => ({
  id,
  roleId,
  objectMetadataId,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  parentRowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: null,
});

const NO_RECORD_ACCESS = {
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
};

const FIXTURE: RolesPermissionsFixture = {
  role: [
    {
      id: 'admin',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      canUpdateAllSettings: true,
      canAccessAllTools: true,
    },
    {
      ...NO_RECORD_ACCESS,
      id: 'member',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
    },
    { ...NO_RECORD_ACCESS, id: 'restricted' },
    { ...NO_RECORD_ACCESS, id: 'aiAgent', canReadAllObjectRecords: true },
  ],
  objectMetadata: [
    {
      id: 'company',
      isSystem: false,
      universalIdentifier: 'company-universal-identifier',
      labelIdentifierFieldMetadataId: 'company-name',
    },
    {
      id: 'person',
      isSystem: false,
      universalIdentifier: 'person-universal-identifier',
      labelIdentifierFieldMetadataId: null,
    },
    {
      id: 'auditLog',
      isSystem: true,
      universalIdentifier: 'audit-log-universal-identifier',
      labelIdentifierFieldMetadataId: null,
    },
    {
      id: 'workflow',
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
      labelIdentifierFieldMetadataId: 'workflow-name',
    },
    {
      id: 'workflowRun',
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
      labelIdentifierFieldMetadataId: null,
    },
    {
      id: 'workspaceMember',
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.workspaceMember.universalIdentifier,
      labelIdentifierFieldMetadataId: 'workspace-member-name',
    },
    {
      id: 'agentChatThread',
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      labelIdentifierFieldMetadataId: null,
    },
  ],
  objectPermission: [
    {
      roleId: 'member',
      objectMetadataId: 'company',
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: true,
    },
    {
      roleId: 'member',
      objectMetadataId: 'company',
      canReadObjectRecords: false,
    },
    {
      roleId: 'member',
      objectMetadataId: 'workflow',
      canReadObjectRecords: false,
    },
    {
      roleId: 'member',
      objectMetadataId: 'auditLog',
      canDestroyObjectRecords: false,
    },
    {
      roleId: 'restricted',
      objectMetadataId: 'person',
      canReadObjectRecords: true,
      canUpdateObjectRecords: null,
    },
    {
      roleId: 'restricted',
      objectMetadataId: 'workspaceMember',
      canReadObjectRecords: false,
    },
    {
      roleId: 'aiAgent',
      objectMetadataId: 'agentChatThread',
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermission: [
    {
      roleId: 'member',
      objectMetadataId: 'company',
      fieldMetadataId: 'company-name',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
    {
      roleId: 'member',
      objectMetadataId: 'company',
      fieldMetadataId: 'company-revenue',
      canReadFieldValue: false,
    },
    {
      roleId: 'member',
      objectMetadataId: 'company',
      fieldMetadataId: 'company-domain',
      canReadFieldValue: null,
      canUpdateFieldValue: null,
    },
    {
      roleId: 'member',
      objectMetadataId: 'workflow',
      fieldMetadataId: 'workflow-name',
      canUpdateFieldValue: false,
    },
    {
      roleId: 'restricted',
      objectMetadataId: 'workspaceMember',
      fieldMetadataId: 'workspace-member-email',
      canReadFieldValue: false,
    },
    {
      roleId: 'restricted',
      objectMetadataId: 'person',
      fieldMetadataId: 'person-phone',
      canUpdateFieldValue: false,
    },
  ],
  rolePermissionFlag: [
    { roleId: 'member', permissionFlagId: 'workflows' },
    {
      roleId: 'restricted',
      permissionFlagId: 'not-loaded',
      flag: PermissionFlagType.WORKSPACE_MEMBERS,
    },
    { roleId: 'aiAgent', permissionFlagId: 'ai' },
  ],
  permissionFlag: [
    {
      id: 'workflows',
      universalIdentifier: SystemPermissionFlag[PermissionFlagType.WORKFLOWS],
    },
    {
      id: 'ai',
      universalIdentifier: SystemPermissionFlag[PermissionFlagType.AI],
    },
  ],
  rowLevelPermissionPredicate: [
    buildPredicate({
      id: 'predicate-1',
      roleId: 'restricted',
      objectMetadataId: 'person',
    }),
    buildPredicate({
      id: 'predicate-2',
      roleId: 'restricted',
      objectMetadataId: 'company',
    }),
    buildPredicate({
      id: 'predicate-3',
      roleId: 'restricted',
      objectMetadataId: 'person',
    }),
    buildPredicate({
      id: 'predicate-4',
      roleId: 'member',
      objectMetadataId: 'workflow',
    }),
  ],
  rowLevelPermissionPredicateGroup: [
    buildPredicateGroup({
      id: 'group-1',
      roleId: 'restricted',
      objectMetadataId: 'person',
    }),
    buildPredicateGroup({
      id: 'group-2',
      roleId: 'member',
      objectMetadataId: 'company',
    }),
  ],
};

const computeWithIndexedBuild = (
  fixture: RolesPermissionsFixture,
): ObjectsPermissionsByRoleId =>
  buildRolesPermissions({
    role: fixture.role,
    objectMetadata: fixture.objectMetadata,
    permissionFlag: fixture.permissionFlag,
    objectPermission: groupByRoleId(fixture.objectPermission),
    fieldPermission: groupByRoleId(fixture.fieldPermission),
    rolePermissionFlag: groupByRoleId(fixture.rolePermissionFlag),
    rowLevelPermissionPredicate: groupByRoleId(
      fixture.rowLevelPermissionPredicate,
    ),
    rowLevelPermissionPredicateGroup: groupByRoleId(
      fixture.rowLevelPermissionPredicateGroup,
    ),
  });

describe('buildRolesPermissions', () => {
  it('builds the same matrix as the per-object linear scan', () => {
    expect(computeWithIndexedBuild(FIXTURE)).toEqual(
      computeRolesPermissionsWithLinearScans(FIXTURE),
    );
  });

  it('builds an entry for every role and object', () => {
    const permissionsByRoleId = computeWithIndexedBuild(FIXTURE);

    expect(Object.keys(permissionsByRoleId)).toEqual([
      'admin',
      'member',
      'restricted',
      'aiAgent',
    ]);
    expect(Object.keys(permissionsByRoleId.member)).toEqual([
      'company',
      'person',
      'auditLog',
      'workflow',
      'workflowRun',
      'workspaceMember',
      'agentChatThread',
    ]);
  });

  it('uses the first object override and keeps field and row level rules per object', () => {
    const permissionsByRoleId = computeWithIndexedBuild(FIXTURE);

    expect(permissionsByRoleId.member.company).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
      restrictedFields: {
        'company-name': { canRead: true, canUpdate: false },
        'company-revenue': { canRead: false, canUpdate: undefined },
      },
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [
        buildPredicateGroup({
          id: 'group-2',
          roleId: 'member',
          objectMetadataId: 'company',
        }),
      ],
    });
    expect(
      permissionsByRoleId.restricted.person.rowLevelPermissionPredicates,
    ).toEqual([
      buildPredicate({
        id: 'predicate-1',
        roleId: 'restricted',
        objectMetadataId: 'person',
      }),
      buildPredicate({
        id: 'predicate-3',
        roleId: 'restricted',
        objectMetadataId: 'person',
      }),
    ]);
  });
});
