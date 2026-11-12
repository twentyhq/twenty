import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  type ObjectRecordsPermissions,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { buildPermissionsSQLCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-sql-condition.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';

jest.mock(
  'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util',
);
jest.mock(
  'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util',
);

const APPLICATION_ID = 'application-id';
const APPLICATION_ROLE_ID = 'application-role';
const FULL_ACCESS_ROLE_ID = 'role-1';
const ROLE_WITHOUT_PERMISSION_ID = 'role-without-permission';
const NOTE_FILTER = { title: { eq: 'restricted' } };

const buildObject = ({ id }: { id: string }): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id,
    nameSingular: id,
    namePlural: `${id}s`,
    universalIdentifier: `${id}-universal-identifier`,
    applicationId: APPLICATION_ID,
    isSystem: false,
  } as Parameters<typeof getFlatObjectMetadataMock>[0]);

const note = buildObject({ id: 'note' });
const person: FlatObjectMetadata = {
  ...buildObject({ id: 'person' }),
  universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
};

const fullAccess: ObjectRecordsPermissions = {
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  unreadableFields: [],
  uneditableFields: [],
};
const fullAccessByObjectId = {
  ...NO_ROLE_RECORDS_PERMISSIONS,
  objects: Object.fromEntries(
    ['note', 'person', 'company'].map((objectMetadataId) => [
      objectMetadataId,
      fullAccess,
    ]),
  ),
};

const metadataMaps: PermissionsMetadataMaps = {
  flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
  flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
  rolesPermissions: {
    [FULL_ACCESS_ROLE_ID]: fullAccessByObjectId,
    [APPLICATION_ROLE_ID]: fullAccessByObjectId,
  },
  featureFlagsMap: { [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: true },
};
const buildSQLCondition = (
  request: Omit<
    Parameters<typeof buildPermissionsSQLCondition>[0],
    'recordShareTableExpression'
  >,
) =>
  buildPermissionsSQLCondition({
    ...request,
    recordShareTableExpression: '"workspace"."recordShare"',
  });

const sharingMetadataMaps = {
  ...metadataMaps,
  featureFlagsMap: {
    ...metadataMaps.featureFlagsMap,
    [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
  },
};

const buildSQLConditionOutcome = (
  args: Parameters<typeof buildSQLCondition>[0],
):
  | { kind: 'open' | 'denied' }
  | { kind: 'gated'; sqlCondition: SQLCondition } => {
  const sqlCondition = buildSQLCondition(args);

  if (typeof sqlCondition === 'boolean') {
    return { kind: sqlCondition ? 'open' : 'denied' };
  }

  return { kind: 'gated', sqlCondition };
};

const readEverything: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: {
    type: 'workspaceMember',
    roleId: FULL_ACCESS_ROLE_ID,
    workspaceMemberId: 'member-1',
  },
  applicationPrincipal: { type: 'customApplication' },
};

const owningApplication: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: {
    type: 'application',
    roleId: APPLICATION_ROLE_ID,
    applicationId: APPLICATION_ID,
  },
  applicationPrincipal: {
    type: 'application',
    roleId: APPLICATION_ROLE_ID,
    applicationId: APPLICATION_ID,
  },
};

const withoutObjectPermission: PermissionsPrincipalsWithRolesContext = {
  ...readEverything,
  mainPrincipal: {
    type: 'workspaceMember',
    roleId: ROLE_WITHOUT_PERMISSION_ID,
    workspaceMemberId: 'member-1',
  },
  applicationPrincipal: { type: 'customApplication' },
};

const build = ({
  principals,
  flatObjectMetadata,
  policyMetadataMaps = metadataMaps,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  flatObjectMetadata: FlatObjectMetadata;
  policyMetadataMaps?: typeof metadataMaps;
}) =>
  buildSQLConditionOutcome({
    principals,
    metadataMaps: policyMetadataMaps,
    tableAlias: flatObjectMetadata.nameSingular,
    flatObjectMetadata,
    operationType: 'read',
  });

const gatedSql = ({
  principals,
  flatObjectMetadata,
  policyMetadataMaps = metadataMaps,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  flatObjectMetadata: FlatObjectMetadata;
  policyMetadataMaps?: typeof metadataMaps;
}): string => {
  const policy = build({ principals, flatObjectMetadata, policyMetadataMaps });

  expect(policy.kind).toBe('gated');

  return policy.kind === 'gated' ? policy.sqlCondition.sql : '';
};

describe('buildPermissionsSQLCondition', () => {
  beforeEach(() => {
    (renderRowLevelPermissionFilterToSql as jest.Mock).mockImplementation(
      ({ tableAlias }: { tableAlias: string }) => ({
        sql: `"${tableAlias}"."title" = :restricted`,
        parameters: { restricted: 'restricted' },
      }),
    );
    (resolveRlsRuleRecordFilter as jest.Mock).mockReturnValue(null);
  });

  it('keeps records of an object that disables reading to its owning application', () => {
    const object = {
      ...note,
      disabledObjectPermissionActions: ['canReadObjectRecords' as const],
    };
    expect(
      build({ principals: readEverything, flatObjectMetadata: object }),
    ).toEqual({ kind: 'denied' });
    expect(
      build({
        principals: owningApplication,
        flatObjectMetadata: object,
      }),
    ).toMatchObject({ kind: 'gated' });
  });

  it('keeps private sqlConditions without a share block when only private records are on', () => {
    const policy = buildSQLConditionOutcome({
      principals: readEverything,
      metadataMaps,
      tableAlias: 'company',
      flatObjectMetadata: buildObject({ id: 'company' }),
      operationType: 'read',
    });

    expect(policy).toMatchObject({
      kind: 'gated',
      sqlCondition: { sql: expect.stringContaining('_isPrivate') },
    });
    expect(
      policy.kind === 'gated' ? policy.sqlCondition.sql : '',
    ).not.toContain('recordShare');
  });

  it('adds nothing for private records and shares with both flags off', () => {
    const company = buildObject({ id: 'company' });

    expect(
      buildSQLCondition({
        principals: readEverything,
        metadataMaps: { ...metadataMaps, featureFlagsMap: {} },
        tableAlias: 'company',
        flatObjectMetadata: company,
        operationType: 'read',
      }),
    ).toBe(true);
  });

  it('keeps private records to their creator and shares once record sharing is enabled', () => {
    const company = buildObject({ id: 'company' });
    const policy = buildSQLConditionOutcome({
      principals: readEverything,
      metadataMaps: sharingMetadataMaps,
      tableAlias: 'company',
      flatObjectMetadata: company,
      operationType: 'read',
    });

    expect(policy.kind).toBe('gated');
    if (policy.kind !== 'gated') {
      throw new Error('Expected a privacy gate');
    }
    expect(policy.sqlCondition.sql).toContain(
      '("company"."_isPrivate" = FALSE) OR',
    );
    expect(policy.sqlCondition.sql).toContain('"workspace"."recordShare"');
  });

  it('gates every object on private records once they are enabled, without record sharing', () => {
    expect(
      gatedSql({
        principals: readEverything,
        flatObjectMetadata: person,
      }),
    ).toContain('recordShare');
  });

  it('gates a system object on private records too', () => {
    expect(
      buildSQLConditionOutcome({
        principals: readEverything,
        metadataMaps: sharingMetadataMaps,
        tableAlias: 'note',
        flatObjectMetadata: { ...note, isSystem: true },
        operationType: 'read',
      }).kind,
    ).toBe('gated');
  });

  it('leaves an object open to inserts when record sharing is enabled', () => {
    expect(
      buildSQLConditionOutcome({
        principals: readEverything,
        metadataMaps: sharingMetadataMaps,
        tableAlias: 'note',
        flatObjectMetadata: note,
        operationType: 'create',
      }),
    ).toEqual({ kind: 'open' });
  });

  describe('with a record shared beyond the role', () => {
    const company = buildObject({ id: 'company' });
    const buildForCompany = (
      principals: PermissionsPrincipalsWithRolesContext,
      operationType: 'read' | 'update' | 'destroy' = 'read',
    ) =>
      buildSQLConditionOutcome({
        principals,
        metadataMaps: sharingMetadataMaps,
        tableAlias: 'company',
        flatObjectMetadata: company,
        operationType,
      });
    const withoutCompanyPermission: PermissionsPrincipalsWithRolesContext = {
      ...readEverything,
      limitingPrincipal: {
        type: 'agent',
        roleId: FULL_ACCESS_ROLE_ID,
        agentId: 'agent-1',
      },
      mainPrincipal: {
        type: 'workspaceMember',
        roleId: 'role-3',
        workspaceMemberId: 'member-1',
      },
      applicationPrincipal: { type: 'customApplication' },
    };
    const withLimitingRoleWithoutCompanyPermission: PermissionsPrincipalsWithRolesContext =
      {
        ...withoutCompanyPermission,
        limitingPrincipal: {
          type: 'agent',
          roleId: ROLE_WITHOUT_PERMISSION_ID,
          agentId: 'agent-1',
        },
      };

    it('narrows a principal without object permission to the records named for them', () => {
      const policy = buildForCompany(withoutCompanyPermission);

      expect(policy.kind).toBe('gated');
      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(policy.sqlCondition.sql).toMatch(
        /^"company"."id" = ANY\(ARRAY\(SELECT "company_recordShare"."recordId" FROM "workspace"."recordShare"/,
      );
      expect(Object.values(policy.sqlCondition.parameters)).toContainEqual([
        'member-1',
        FULL_ACCESS_ROLE_ID,
        'role-3',
      ]);
    });

    it('narrows edits of a principal without object permission to the records named for editing', () => {
      const policy = buildForCompany(withoutCompanyPermission, 'update');

      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(Object.values(policy.sqlCondition.parameters)).toEqual(
        expect.arrayContaining([
          ['member-1', FULL_ACCESS_ROLE_ID, 'role-3'],
          [RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL],
        ]),
      );
    });

    it('never lets general access reach beyond the role', () => {
      const policy = buildForCompany(withoutObjectPermission);

      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(Object.values(policy.sqlCondition.parameters)).toContainEqual([
        'member-1',
        ROLE_WITHOUT_PERMISSION_ID,
      ]);
      expect(
        Object.values(policy.sqlCondition.parameters).flat(),
      ).not.toContain(EVERYONE_PRINCIPAL_ID);
    });

    it.each(['read', 'update'] as const)(
      'denies %s on records named for a principal whose limiting role lacks all records',
      (operationType) => {
        expect(
          buildForCompany(
            withLimitingRoleWithoutCompanyPermission,
            operationType,
          ),
        ).toEqual({ kind: 'denied' });
      },
    );

    it('narrows deletion by a principal without object permission to the records named with full access', () => {
      const policy = buildForCompany(withoutCompanyPermission, 'destroy');

      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(Object.values(policy.sqlCondition.parameters)).toContainEqual([
        RecordShareAccessLevel.FULL,
      ]);
    });

    it('lets a named grant bypass the row filter of the role', () => {
      (resolveRlsRuleRecordFilter as jest.Mock).mockReturnValue(NOTE_FILTER);
      const policy = buildForCompany(readEverything);

      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(policy.sqlCondition.sql).toMatch(
        /^\(\(\("company"."title" = :restricted\) AND \("company"."_isPrivate" = FALSE\)\) OR \("company"."id" = ANY\(ARRAY\(SELECT "company_recordShare"."recordId"/,
      );
    });
  });

  it('denies an object the principal has no permission on', () => {
    expect(
      build({
        principals: withoutObjectPermission,
        flatObjectMetadata: note,
      }),
    ).toEqual({
      kind: 'denied',
    });
  });

  it('gates records on their share rows', () => {
    expect(
      gatedSql({
        principals: readEverything,
        flatObjectMetadata: person,
      }),
    ).toContain(
      '"person"."id" = ANY(ARRAY(SELECT "person_recordShare"."recordId"',
    );
  });

  it('opens records to shares naming the member or their roles', () => {
    const sqlCondition = buildSQLCondition({
      principals: readEverything,
      metadataMaps,
      flatObjectMetadata: person,
      operationType: 'read',
    });

    if (typeof sqlCondition === 'boolean') {
      throw new Error('Expected a share sqlCondition');
    }
    expect(sqlCondition.sql).toContain(
      '"person"."id" = ANY(ARRAY(SELECT "person_recordShare"."recordId"',
    );
    expect(sqlCondition.sql).not.toContain('"person"."_isPrivate" = TRUE');
    expect(Object.values(sqlCondition.parameters)).toContainEqual([
      'member-1',
      'role-1',
    ]);
  });

  it('lets a share on a private by default object bypass the row filter of the role with record sharing off', () => {
    (resolveRlsRuleRecordFilter as jest.Mock).mockReturnValue(NOTE_FILTER);
    const sql = gatedSql({
      principals: readEverything,
      flatObjectMetadata: person,
    });

    expect(sql).toMatch(
      /^\(\(\("person"."title" = :restricted\) AND \("person"."_isPrivate" = FALSE\)\) OR \("person"."id" = ANY\(ARRAY\(SELECT "person_recordShare"."recordId"/,
    );
  });

  it('checks the role rule through the caller access groups when given', () => {
    (resolveRlsRuleRecordFilter as jest.Mock).mockReturnValue(NOTE_FILTER);
    const policy = buildSQLConditionOutcome({
      principals: readEverything,
      metadataMaps,
      tableAlias: 'person',
      flatObjectMetadata: person,
      operationType: 'read',
      callerAccessGroupCompactIds: [42, 43],
    });

    if (policy.kind !== 'gated') {
      throw new Error('Expected a grant gate');
    }
    expect(policy.sqlCondition.sql).toContain(
      '"person"."_accessGroupIds" && CAST(',
    );
    expect(policy.sqlCondition.sql).not.toContain('"person"."title"');
    expect(Object.values(policy.sqlCondition.parameters)).toContainEqual([
      42, 43,
    ]);
  });

  it('also grants the records holding a group inherited through a related record path', () => {
    (resolveRlsRuleRecordFilter as jest.Mock).mockReturnValue(NOTE_FILTER);
    const policy = buildSQLConditionOutcome({
      principals: readEverything,
      metadataMaps,
      tableAlias: 'person',
      flatObjectMetadata: person,
      operationType: 'read',
      callerAccessGroupCompactIds: [42],
      callerRelatedRecordPathAccessGroupCompactIds: [7],
    });

    if (policy.kind !== 'gated') {
      throw new Error('Expected a grant gate');
    }
    expect(
      policy.sqlCondition.sql.split('"person"."_accessGroupIds" && CAST('),
    ).toHaveLength(3);
    expect(Object.values(policy.sqlCondition.parameters)).toEqual(
      expect.arrayContaining([[42], [7]]),
    );
  });

  it('keeps the role rule when the object is not listed through access groups', () => {
    (resolveRlsRuleRecordFilter as jest.Mock).mockReturnValue(NOTE_FILTER);

    expect(
      gatedSql({ principals: readEverything, flatObjectMetadata: person }),
    ).not.toContain('_accessGroupIds');
  });

  it('keeps private records gated regardless of the sharing UI flag', () => {
    const policy = buildSQLConditionOutcome({
      principals: readEverything,
      metadataMaps,
      tableAlias: 'person',
      flatObjectMetadata: person,
      operationType: 'read',
    });
    expect(policy.kind).toBe('gated');
    if (policy.kind !== 'gated') {
      throw new Error('Expected a grant gate');
    }
    expect(policy.sqlCondition.sql).toContain('recordShare');
    expect(policy.sqlCondition.sql).not.toContain('rowCause');
  });
  describe('with a prospective named share', () => {
    const prospectiveShareArguments = {
      principals: readEverything,
      metadataMaps: sharingMetadataMaps,
      tableAlias: person.nameSingular,
      flatObjectMetadata: person,
      operationType: 'update',
      hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ_WRITE,
    } satisfies Parameters<typeof buildSQLConditionOutcome>[0];

    it('requires an edit-level share to preview update access', () => {
      expect(buildSQLConditionOutcome(prospectiveShareArguments)).toEqual({
        kind: 'open',
      });
      const readOnly = buildSQLConditionOutcome({
        ...prospectiveShareArguments,
        hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ,
      });

      expect(readOnly.kind).toBe('gated');
    });

    it('opens the operation for a prospective share on a private by default object with record sharing off', () => {
      expect(
        buildSQLConditionOutcome({
          ...prospectiveShareArguments,
          metadataMaps,
          operationType: 'softDelete',
          hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.FULL,
        }),
      ).toEqual({ kind: 'open' });
    });

    it('preserves a disabled edit action', () => {
      expect(
        buildSQLConditionOutcome({
          ...prospectiveShareArguments,
          flatObjectMetadata: {
            ...person,
            disabledObjectPermissionActions: [
              'canUpdateObjectRecords' as const,
            ],
          },
        }),
      ).toEqual({ kind: 'denied' });
    });

    it('honors ownership for an object that disables editing', () => {
      expect(
        buildSQLConditionOutcome({
          ...prospectiveShareArguments,
          principals: owningApplication,
          flatObjectMetadata: {
            ...person,
            disabledObjectPermissionActions: [
              'canUpdateObjectRecords' as const,
            ],
          },
        }),
      ).toEqual({ kind: 'open' });
    });

    it('does not use a prospective share to bypass a disabled read action', () => {
      expect(
        buildSQLConditionOutcome({
          ...prospectiveShareArguments,
          operationType: 'read',
          flatObjectMetadata: {
            ...person,
            disabledObjectPermissionActions: ['canReadObjectRecords' as const],
          },
        }),
      ).toEqual({ kind: 'denied' });
    });

    it('reaches beyond missing role access only when record sharing is enabled', () => {
      const noteShareArguments = {
        ...prospectiveShareArguments,
        tableAlias: note.nameSingular,
        flatObjectMetadata: note,
        principals: withoutObjectPermission,
      };

      expect(
        buildSQLConditionOutcome({ ...noteShareArguments, metadataMaps }),
      ).toEqual({ kind: 'denied' });
      expect(buildSQLConditionOutcome(noteShareArguments)).toEqual({
        kind: 'open',
      });
    });
  });

  describe('with private records created by members', () => {
    const createdByField = getFlatFieldMetadataMock({
      objectMetadataId: 'company',
      type: FieldMetadataType.ACTOR,
      name: 'createdBy',
      universalIdentifier: 'company-created-by-field-universal-id',
    });
    const company = {
      ...buildObject({ id: 'company' }),
      fieldIds: [createdByField.id],
    };
    const emptyFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
      createEmptyFlatEntityMaps();
    const creatorMetadataMaps = {
      ...sharingMetadataMaps,
      flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: createdByField,
        flatEntityMaps: emptyFlatFieldMetadataMaps,
      }),
    };
    const buildForCreator = (
      principals: PermissionsPrincipalsWithRolesContext,
    ) =>
      buildSQLConditionOutcome({
        principals,
        metadataMaps: creatorMetadataMaps,
        tableAlias: 'company',
        flatObjectMetadata: company,
        operationType: 'read',
      });

    it('grants a private record to its creator next to its shares and the role', () => {
      const policy = buildForCreator(readEverything);

      if (policy.kind !== 'gated') {
        throw new Error('Expected a privacy gate');
      }
      expect(policy.sqlCondition.sql).toMatch(
        /^\(\("company"."_isPrivate" = FALSE\) OR \("company"."id" = ANY\(ARRAY\(.*\)\)\) OR \(\("company"."_isPrivate" = TRUE\) AND \("company"."createdByWorkspaceMemberId" = :recordCreatedByWorkspaceMemberId_[0-9a-f]{10}\)\)\)$/,
      );
      expect(Object.values(policy.sqlCondition.parameters)).toContain(
        'member-1',
      );
    });

    it('grants a private record to its creator outside the row filter of the role', () => {
      (resolveRlsRuleRecordFilter as jest.Mock).mockReturnValue(NOTE_FILTER);
      const policy = buildSQLConditionOutcome({
        principals: readEverything,
        metadataMaps: {
          ...creatorMetadataMaps,
          featureFlagsMap: metadataMaps.featureFlagsMap,
        },
        tableAlias: 'company',
        flatObjectMetadata: company,
        operationType: 'read',
      });

      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(
        policy.sqlCondition.sql.match(/"company"\."title" = :restricted/g),
      ).toHaveLength(1);
      expect(policy.sqlCondition.sql).toContain(
        '("company"."_isPrivate" = TRUE) AND ("company"."createdByWorkspaceMemberId" = :',
      );
    });

    it('lets the creator of a private record in whatever their role', () => {
      const policy = buildForCreator(withoutObjectPermission);

      if (policy.kind !== 'gated') {
        throw new Error('Expected a grant gate');
      }
      expect(policy.sqlCondition.sql).toContain(
        '("company"."_isPrivate" = TRUE) AND ("company"."createdByWorkspaceMemberId" = :',
      );
    });
  });
});
