import { SystemPermissionFlag } from '../../constants';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '../../types';
import { type RoleManifest } from '../roleManifestType';
import { getRoleManifestGrantsNotCoveredBy } from '../utils/getRoleManifestGrantsNotCoveredBy';

const PERSON = 'object-person';
const COMPANY = 'object-company';
const EMAIL_FIELD = 'field-email';

const buildRole = (overrides: Partial<RoleManifest> = {}): RoleManifest => ({
  universalIdentifier: 'role',
  label: 'Role',
  ...overrides,
});

describe('getRoleManifestGrantsNotCoveredBy', () => {
  it('returns nothing when the superset covers the role', () => {
    const role = buildRole({
      objectPermissions: [
        {
          objectUniversalIdentifier: PERSON,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
    });
    const superset = buildRole({
      canReadAllObjectRecords: true,
      objectPermissions: [
        { objectUniversalIdentifier: PERSON, canUpdateObjectRecords: true },
      ],
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
    });

    expect(getRoleManifestGrantsNotCoveredBy({ role, superset })).toEqual([]);
  });

  it('reports role-level flags the superset lacks', () => {
    const role = buildRole({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canUpdateAllSettings: true,
    });
    const superset = buildRole({ canReadAllObjectRecords: true });

    expect(getRoleManifestGrantsNotCoveredBy({ role, superset })).toEqual([
      { type: 'ALL_OBJECT_RECORDS', action: 'canUpdateObjectRecords' },
      { type: 'ALL_SETTINGS', flag: 'canUpdateAllSettings' },
    ]);
  });

  it('reports per-object actions the superset lacks', () => {
    const role = buildRole({
      objectPermissions: [
        {
          objectUniversalIdentifier: PERSON,
          canReadObjectRecords: true,
          canSoftDeleteObjectRecords: true,
        },
        { objectUniversalIdentifier: COMPANY, canReadObjectRecords: true },
      ],
    });
    const superset = buildRole({
      objectPermissions: [
        { objectUniversalIdentifier: PERSON, canReadObjectRecords: true },
      ],
    });

    expect(getRoleManifestGrantsNotCoveredBy({ role, superset })).toEqual([
      {
        type: 'OBJECT_RECORDS',
        objectUniversalIdentifier: PERSON,
        action: 'canSoftDeleteObjectRecords',
      },
      {
        type: 'OBJECT_RECORDS',
        objectUniversalIdentifier: COMPANY,
        action: 'canReadObjectRecords',
      },
    ]);
  });

  it('reports an object the superset denies while the role reaches it through a role-level flag', () => {
    const role = buildRole({ canReadAllObjectRecords: true });
    const superset = buildRole({
      canReadAllObjectRecords: true,
      objectPermissions: [
        { objectUniversalIdentifier: PERSON, canReadObjectRecords: false },
      ],
    });

    expect(getRoleManifestGrantsNotCoveredBy({ role, superset })).toEqual([
      {
        type: 'OBJECT_RECORDS',
        objectUniversalIdentifier: PERSON,
        action: 'canReadObjectRecords',
      },
    ]);
  });

  it('covers a tool flag through canAccessAllTools and a settings flag through canUpdateAllSettings', () => {
    const role = buildRole({
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.AI,
        SystemPermissionFlag.DATA_MODEL,
        'custom-tool-flag',
      ],
    });

    expect(
      getRoleManifestGrantsNotCoveredBy({
        role,
        superset: buildRole({
          canAccessAllTools: true,
          canUpdateAllSettings: true,
        }),
        toolPermissionFlagUniversalIdentifiers: ['custom-tool-flag'],
      }),
    ).toEqual([]);

    expect(
      getRoleManifestGrantsNotCoveredBy({
        role,
        superset: buildRole({ canAccessAllTools: true }),
      }),
    ).toEqual([
      {
        type: 'PERMISSION_FLAG',
        permissionFlagUniversalIdentifier: SystemPermissionFlag.DATA_MODEL,
      },
      {
        type: 'PERMISSION_FLAG',
        permissionFlagUniversalIdentifier: 'custom-tool-flag',
      },
    ]);
  });

  it('reports a field the superset restricts while the role reads it', () => {
    const role = buildRole({
      objectPermissions: [
        {
          objectUniversalIdentifier: PERSON,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
      fieldPermissions: [
        {
          objectUniversalIdentifier: PERSON,
          fieldUniversalIdentifier: EMAIL_FIELD,
          canUpdateFieldValue: false,
        },
      ],
    });
    const superset = buildRole({
      objectPermissions: [
        {
          objectUniversalIdentifier: PERSON,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
      fieldPermissions: [
        {
          objectUniversalIdentifier: PERSON,
          fieldUniversalIdentifier: EMAIL_FIELD,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
      ],
    });

    expect(getRoleManifestGrantsNotCoveredBy({ role, superset })).toEqual([
      {
        type: 'FIELD_VALUE',
        objectUniversalIdentifier: PERSON,
        fieldUniversalIdentifier: EMAIL_FIELD,
        action: 'canReadFieldValue',
      },
    ]);
  });

  it('reports an object the superset narrows by row while the role reaches it unnarrowed', () => {
    const role = buildRole({
      objectPermissions: [
        { objectUniversalIdentifier: PERSON, canReadObjectRecords: true },
      ],
    });
    const superset = buildRole({
      objectPermissions: [
        { objectUniversalIdentifier: PERSON, canReadObjectRecords: true },
      ],
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: 'group',
          objectUniversalIdentifier: PERSON,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
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
    });

    expect(getRoleManifestGrantsNotCoveredBy({ role, superset })).toEqual([
      { type: 'ROW_LEVEL_RESTRICTION', objectUniversalIdentifier: PERSON },
    ]);
  });
});
