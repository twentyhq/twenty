import { type RoleManifest } from '../roleManifestType';
import { computeRoleManifestUnion } from '../utils/computeRoleManifestUnion';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '../../types';

const PERSON = 'object-person';
const COMPANY = 'object-company';
const EMAIL_FIELD = 'field-email';

const buildRole = (overrides: Partial<RoleManifest> = {}): RoleManifest => ({
  universalIdentifier: 'role',
  label: 'Role',
  ...overrides,
});

describe('computeRoleManifestUnion', () => {
  it('keeps the identity of the base role', () => {
    const baseRole = buildRole({
      universalIdentifier: 'base',
      label: 'Base',
      description: 'Base description',
      icon: 'IconBase',
    });

    const union = computeRoleManifestUnion({ baseRole, roles: [] });

    expect(union).toMatchObject({
      universalIdentifier: 'base',
      label: 'Base',
      description: 'Base description',
      icon: 'IconBase',
    });
  });

  it('ors every role-level flag', () => {
    const union = computeRoleManifestUnion({
      baseRole: buildRole({ canReadAllObjectRecords: true }),
      roles: [
        buildRole({ canUpdateAllSettings: true }),
        buildRole({ canAccessAllTools: true, canBeAssignedToAgents: true }),
      ],
    });

    expect(union).toMatchObject({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canUpdateAllSettings: true,
      canAccessAllTools: true,
      canBeAssignedToAgents: true,
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
    });
  });

  it('merges object permissions action by action', () => {
    const union = computeRoleManifestUnion({
      baseRole: buildRole({
        objectPermissions: [
          {
            universalIdentifier: 'base-person',
            objectUniversalIdentifier: PERSON,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      }),
      roles: [
        buildRole({
          objectPermissions: [
            {
              objectUniversalIdentifier: PERSON,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: false,
            },
            {
              objectUniversalIdentifier: COMPANY,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        }),
      ],
    });

    expect(union.objectPermissions).toEqual([
      {
        universalIdentifier: 'base-person',
        objectUniversalIdentifier: PERSON,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: false,
      },
      {
        objectUniversalIdentifier: COMPANY,
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ]);
  });

  it('lets a role-level flag grant an action another role denies per object', () => {
    const union = computeRoleManifestUnion({
      baseRole: buildRole({
        canReadAllObjectRecords: true,
        objectPermissions: [
          {
            objectUniversalIdentifier: PERSON,
            canReadObjectRecords: false,
          },
        ],
      }),
      roles: [buildRole({ canReadAllObjectRecords: true })],
    });

    expect(union.objectPermissions).toEqual([
      {
        objectUniversalIdentifier: PERSON,
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ]);
  });

  it('keeps a field restriction only when every role reaching the object applies it', () => {
    const readablePerson = {
      objectUniversalIdentifier: PERSON,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    };

    const union = computeRoleManifestUnion({
      baseRole: buildRole({
        objectPermissions: [readablePerson],
        fieldPermissions: [
          {
            universalIdentifier: 'base-email',
            objectUniversalIdentifier: PERSON,
            fieldUniversalIdentifier: EMAIL_FIELD,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      }),
      roles: [
        buildRole({
          objectPermissions: [readablePerson],
          fieldPermissions: [
            {
              objectUniversalIdentifier: PERSON,
              fieldUniversalIdentifier: EMAIL_FIELD,
              canUpdateFieldValue: false,
            },
          ],
        }),
        buildRole({
          objectPermissions: [
            { objectUniversalIdentifier: COMPANY, canReadObjectRecords: true },
          ],
        }),
      ],
    });

    expect(union.fieldPermissions).toEqual([
      {
        universalIdentifier: 'base-email',
        objectUniversalIdentifier: PERSON,
        fieldUniversalIdentifier: EMAIL_FIELD,
        canUpdateFieldValue: false,
      },
    ]);
  });

  it('drops a field restriction when a role reaching the object does not apply it', () => {
    const union = computeRoleManifestUnion({
      baseRole: buildRole({
        canReadAllObjectRecords: true,
        fieldPermissions: [
          {
            objectUniversalIdentifier: PERSON,
            fieldUniversalIdentifier: EMAIL_FIELD,
            canReadFieldValue: false,
          },
        ],
      }),
      roles: [buildRole({ canReadAllObjectRecords: true })],
    });

    expect(union.fieldPermissions).toEqual([]);
  });

  it('unions permission flags and drops row-level predicates', () => {
    const union = computeRoleManifestUnion({
      baseRole: buildRole({
        permissionFlagUniversalIdentifiers: ['flag-a', 'flag-b'],
        rowLevelPermissionPredicateGroups: [
          {
            universalIdentifier: 'group',
            objectUniversalIdentifier: PERSON,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        rowLevelPermissionPredicates: [
          {
            universalIdentifier: 'predicate',
            objectUniversalIdentifier: PERSON,
            fieldUniversalIdentifier: EMAIL_FIELD,
            operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
          },
        ],
      }),
      roles: [
        buildRole({ permissionFlagUniversalIdentifiers: ['flag-b', 'flag-c'] }),
      ],
    });

    expect(union.permissionFlagUniversalIdentifiers).toEqual([
      'flag-a',
      'flag-b',
      'flag-c',
    ]);
    expect(union.rowLevelPermissionPredicates).toEqual([]);
    expect(union.rowLevelPermissionPredicateGroups).toEqual([]);
  });
});
