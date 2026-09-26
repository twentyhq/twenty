import { type RoleManifest } from '@/application/roleManifestType';
import { getRoleManifestGrantsNotCoveredBy } from '@/application/utils/getRoleManifestGrantsNotCoveredBy';
import { SystemPermissionFlag } from '@/constants';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '@/types';

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

    expect(
      getRoleManifestGrantsNotCoveredBy({
        role,
        superset,
        toolPermissionFlagUniversalIdentifiers: [],
      }),
    ).toEqual([]);
  });

  it('reports role-level flags the superset lacks', () => {
    const role = buildRole({
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canUpdateAllSettings: true,
      canAccessAllTools: true,
    });
    const superset = buildRole({ canReadAllObjectRecords: true });

    expect(
      getRoleManifestGrantsNotCoveredBy({
        role,
        superset,
        toolPermissionFlagUniversalIdentifiers: [],
      }),
    ).toEqual([
      { type: 'ALL_OBJECT_RECORDS', action: 'canUpdateObjectRecords' },
      { type: 'ALL_SETTINGS' },
      { type: 'ALL_TOOLS' },
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

    expect(
      getRoleManifestGrantsNotCoveredBy({
        role,
        superset,
        toolPermissionFlagUniversalIdentifiers: [],
      }),
    ).toEqual([
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

    expect(
      getRoleManifestGrantsNotCoveredBy({
        role,
        superset,
        toolPermissionFlagUniversalIdentifiers: [],
      }),
    ).toEqual([
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
        toolPermissionFlagUniversalIdentifiers: [],
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

    expect(
      getRoleManifestGrantsNotCoveredBy({
        role,
        superset,
        toolPermissionFlagUniversalIdentifiers: [],
      }),
    ).toEqual([
      {
        type: 'FIELD_VALUE',
        objectUniversalIdentifier: PERSON,
        fieldUniversalIdentifier: EMAIL_FIELD,
        action: 'canReadFieldValue',
      },
    ]);
  });

  describe('row-level restrictions', () => {
    const readablePerson = {
      objectUniversalIdentifier: PERSON,
      canReadObjectRecords: true,
    };

    const buildRestrictedRole = ({
      universalIdentifier,
      operand,
      logicalOperator = RowLevelPermissionPredicateGroupLogicalOperator.AND,
      value,
    }: {
      universalIdentifier: string;
      operand: RowLevelPermissionPredicateOperand;
      logicalOperator?: RowLevelPermissionPredicateGroupLogicalOperator;
      value?: string;
    }) =>
      buildRole({
        universalIdentifier,
        objectPermissions: [readablePerson],
        rowLevelPermissionPredicateGroups: [
          {
            universalIdentifier: `${universalIdentifier}-group`,
            objectUniversalIdentifier: PERSON,
            logicalOperator,
          },
        ],
        rowLevelPermissionPredicates: [
          {
            universalIdentifier: `${universalIdentifier}-predicate`,
            objectUniversalIdentifier: PERSON,
            fieldUniversalIdentifier: EMAIL_FIELD,
            operand,
            value,
            predicateGroupUniversalIdentifier: `${universalIdentifier}-group`,
          },
        ],
      });

    const superset = buildRestrictedRole({
      universalIdentifier: 'superset',
      operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
    });

    it('reports an object the superset narrows while the role reaches it unnarrowed', () => {
      const role = buildRole({ objectPermissions: [readablePerson] });

      expect(
        getRoleManifestGrantsNotCoveredBy({
          role,
          superset,
          toolPermissionFlagUniversalIdentifiers: [],
        }),
      ).toEqual([
        { type: 'ROW_LEVEL_RESTRICTION', objectUniversalIdentifier: PERSON },
      ]);
    });

    it('accepts the same restriction under different identifiers', () => {
      const role = buildRestrictedRole({
        universalIdentifier: 'role',
        operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
      });

      expect(
        getRoleManifestGrantsNotCoveredBy({
          role,
          superset,
          toolPermissionFlagUniversalIdentifiers: [],
        }),
      ).toEqual([]);
    });

    it('reports a restriction that differs by operand or value', () => {
      const differentOperand = buildRestrictedRole({
        universalIdentifier: 'role',
        operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
      });
      const differentValue = buildRestrictedRole({
        universalIdentifier: 'role',
        operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
        value: 'x',
      });

      for (const role of [differentOperand, differentValue]) {
        expect(
          getRoleManifestGrantsNotCoveredBy({
            role,
            superset,
            toolPermissionFlagUniversalIdentifiers: [],
          }),
        ).toEqual([
          { type: 'ROW_LEVEL_RESTRICTION', objectUniversalIdentifier: PERSON },
        ]);
      }
    });

    it('reports a restriction whose group nests differently', () => {
      const role = buildRestrictedRole({
        universalIdentifier: 'role',
        operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
      });

      expect(
        getRoleManifestGrantsNotCoveredBy({
          role,
          superset,
          toolPermissionFlagUniversalIdentifiers: [],
        }),
      ).toEqual([
        { type: 'ROW_LEVEL_RESTRICTION', objectUniversalIdentifier: PERSON },
      ]);
    });

    it('accepts a role that narrows an object the superset leaves open', () => {
      const role = buildRestrictedRole({
        universalIdentifier: 'role',
        operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
      });

      expect(
        getRoleManifestGrantsNotCoveredBy({
          role,
          superset: buildRole({ objectPermissions: [readablePerson] }),
          toolPermissionFlagUniversalIdentifiers: [],
        }),
      ).toEqual([]);
    });
  });
});
