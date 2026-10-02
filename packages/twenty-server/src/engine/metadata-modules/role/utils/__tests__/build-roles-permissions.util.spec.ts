import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type RolesPermissionsBuildRows } from 'src/engine/metadata-modules/role/types/roles-permissions-build-rows.type';
import { buildRolesPermissions } from 'src/engine/metadata-modules/role/utils/build-roles-permissions.util';

const ROLE: RolesPermissionsBuildRows['role'][number] = {
  id: 'role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
};

const COMPANY: RolesPermissionsBuildRows['objectMetadata'][number] = {
  id: 'company',
  isSystem: false,
  universalIdentifier: 'company-universal-identifier',
  labelIdentifierFieldMetadataId: 'company-name',
};

const WORKFLOW: RolesPermissionsBuildRows['objectMetadata'][number] = {
  id: 'workflow',
  isSystem: true,
  universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
  labelIdentifierFieldMetadataId: null,
};

type RolePermissionFlagRow = NonNullable<
  ReturnType<RolesPermissionsBuildRows['rolePermissionFlag']['byRoleId']['get']>
>[number];

const forRole = <TRow>(rows: TRow[]) => ({
  byRoleId: new Map([[ROLE.id, rows]]),
});

const build = (rows: Partial<RolesPermissionsBuildRows>) =>
  buildRolesPermissions({
    role: [ROLE],
    objectMetadata: [COMPANY],
    permissionFlag: [],
    objectPermission: forRole([]),
    fieldPermission: forRole([]),
    rolePermissionFlag: forRole([]),
    rowLevelPermissionPredicate: forRole([]),
    rowLevelPermissionPredicateGroup: forRole([]),
    ...rows,
  });

const PREDICATE: RowLevelPermissionPredicate = {
  id: 'predicate',
  roleId: ROLE.id,
  objectMetadataId: COMPANY.id,
  fieldMetadataId: 'company-owner',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
};

const PREDICATE_GROUP: RowLevelPermissionPredicateGroup = {
  id: 'predicate-group',
  roleId: ROLE.id,
  objectMetadataId: COMPANY.id,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  parentRowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: null,
};

describe('buildRolesPermissions', () => {
  it('builds an entry per role and object from the role defaults', () => {
    const person = { ...COMPANY, id: 'person' };
    const readOnlyRole = {
      ...ROLE,
      id: 'readOnly',
      canUpdateAllObjectRecords: false,
    };
    const defaults = {
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    };

    expect(
      build({ role: [ROLE, readOnlyRole], objectMetadata: [COMPANY, person] }),
    ).toEqual({
      role: {
        company: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          ...defaults,
        },
        person: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          ...defaults,
        },
      },
      readOnly: {
        company: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          ...defaults,
        },
        person: {
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
          ...defaults,
        },
      },
    });
  });

  it('applies the first object override and falls back to the role for unset values', () => {
    expect(
      build({
        objectPermission: forRole([
          {
            objectMetadataId: COMPANY.id,
            canReadObjectRecords: null,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: null,
          },
          {
            objectMetadataId: COMPANY.id,
            canReadObjectRecords: false,
            canUpdateObjectRecords: null,
            canSoftDeleteObjectRecords: null,
            canDestroyObjectRecords: null,
          },
        ]),
      }).role.company,
    ).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
    });
  });

  it('keeps field restrictions and row level rules on their object, with the label identifier always readable', () => {
    const permissions = build({
      objectMetadata: [COMPANY, { ...COMPANY, id: 'person' }],
      fieldPermission: forRole([
        {
          objectMetadataId: COMPANY.id,
          fieldMetadataId: 'company-name',
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
        {
          objectMetadataId: COMPANY.id,
          fieldMetadataId: 'company-revenue',
          canReadFieldValue: false,
          canUpdateFieldValue: null,
        },
        {
          objectMetadataId: COMPANY.id,
          fieldMetadataId: 'company-domain',
          canReadFieldValue: null,
          canUpdateFieldValue: null,
        },
      ]),
      rowLevelPermissionPredicate: forRole([PREDICATE]),
      rowLevelPermissionPredicateGroup: forRole([PREDICATE_GROUP]),
    });

    expect(permissions.role.company).toMatchObject({
      restrictedFields: {
        'company-name': { canRead: true, canUpdate: false },
        'company-revenue': { canRead: false, canUpdate: null },
      },
      rowLevelPermissionPredicates: [PREDICATE],
      rowLevelPermissionPredicateGroups: [PREDICATE_GROUP],
    });
    expect(permissions.role.person).toMatchObject({
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
  });

  it.each<
    [
      string,
      RolePermissionFlagRow[],
      RolesPermissionsBuildRows['permissionFlag'],
      boolean,
    ]
  >([
    ['without the workflows flag', [], [], false],
    [
      'with the workflows flag',
      [{ permissionFlagId: 'workflows' }],
      [
        {
          id: 'workflows',
          universalIdentifier:
            SystemPermissionFlag[PermissionFlagType.WORKFLOWS],
        },
      ],
      true,
    ],
    [
      'with the workflows flag only in the legacy flag column',
      [{ permissionFlagId: 'not-loaded', flag: PermissionFlagType.WORKFLOWS }],
      [],
      true,
    ],
  ])(
    'gates workflow records on the workflows permission, ignoring overrides and field permissions, %s',
    (_, rolePermissionFlags, permissionFlags, hasWorkflowsPermission) => {
      expect(
        build({
          objectMetadata: [WORKFLOW],
          rolePermissionFlag: forRole(rolePermissionFlags),
          permissionFlag: permissionFlags,
          objectPermission: forRole([
            {
              objectMetadataId: WORKFLOW.id,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: true,
            },
          ]),
          fieldPermission: forRole([
            {
              objectMetadataId: WORKFLOW.id,
              fieldMetadataId: 'workflow-name',
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ]),
        }).role.workflow,
      ).toMatchObject({
        canReadObjectRecords: hasWorkflowsPermission,
        canUpdateObjectRecords: hasWorkflowsPermission,
        canSoftDeleteObjectRecords: hasWorkflowsPermission,
        canDestroyObjectRecords: hasWorkflowsPermission,
        restrictedFields: {},
      });
    },
  );
});
