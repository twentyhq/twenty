import {
  createWorkspaceCustomApplicationSyncWorkspace,
  type WorkspaceCustomApplicationSyncWorkspace,
} from 'test/integration/metadata/suites/application/utils/create-workspace-custom-application-sync-workspace.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type Manifest,
  type LegacyCompliantRoleManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.universalIdentifier;

type RoleUniversalIdentifiers = {
  role: string;
  rule: string;
  predicate: string;
};

const buildRoleUniversalIdentifiers = (): RoleUniversalIdentifiers => ({
  role: uuidv4(),
  rule: uuidv4(),
  predicate: uuidv4(),
});

const companyNameRulePredicate = (predicateUniversalIdentifier: string) => ({
  universalIdentifier: predicateUniversalIdentifier,
  fieldUniversalIdentifier:
    STANDARD_OBJECTS.company.fields.name.universalIdentifier,
  operand: RowLevelPermissionPredicateOperand.CONTAINS,
  value: 'Acme',
});

// Only the workspace custom application may declare row-level permissions
const buildManifest = ({
  workspace,
  roleUniversalIdentifier,
  role,
}: {
  workspace: WorkspaceCustomApplicationSyncWorkspace;
  roleUniversalIdentifier: string;
  role: Pick<
    LegacyCompliantRoleManifest,
    'objectPermissions' | 'recordsPermissions' | 'rowLevelPermissionPredicates'
  >;
}): Manifest => ({
  ...workspace.manifest,
  roles: [
    ...workspace.manifest.roles,
    {
      universalIdentifier: roleUniversalIdentifier,
      label: 'RLS Rule Test Role',
      ...role,
    },
  ],
});

const buildManifestWithoutRule = ({
  workspace,
  universalIdentifiers,
}: {
  workspace: WorkspaceCustomApplicationSyncWorkspace;
  universalIdentifiers: RoleUniversalIdentifiers;
}) =>
  buildManifest({
    workspace,
    roleUniversalIdentifier: universalIdentifiers.role,
    role: {
      objectPermissions: [
        {
          objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
      rowLevelPermissionPredicates: [
        {
          ...companyNameRulePredicate(universalIdentifiers.predicate),
          objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        },
      ],
    },
  });

const buildManifestWithRule = ({
  workspace,
  universalIdentifiers,
}: {
  workspace: WorkspaceCustomApplicationSyncWorkspace;
  universalIdentifiers: RoleUniversalIdentifiers;
}) =>
  buildManifest({
    workspace,
    roleUniversalIdentifier: universalIdentifiers.role,
    role: {
      recordsPermissions: {
        objects: [
          {
            objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
            canUpdateAllRecords: true,
            rowLevelRecordsPermissions: [
              {
                universalIdentifier: universalIdentifiers.rule,
                canReadRecords: true,
                predicates: [
                  companyNameRulePredicate(universalIdentifiers.predicate),
                ],
              },
            ],
          },
        ],
      },
    },
  });

type RuleRow = {
  universalIdentifier: string;
  canReadRecords: boolean;
  canCreateRecords: boolean;
  canUpdateRecords: boolean;
  canSoftDeleteRecords: boolean;
  canDestroyRecords: boolean;
  canReadObjectRecords: boolean | null;
  canUpdateObjectRecords: boolean | null;
  predicateId: string;
};

const findRuleRows = async ({
  workspaceId,
  roleUniversalIdentifier,
}: {
  workspaceId: string;
  roleUniversalIdentifier: string;
}): Promise<RuleRow[]> =>
  globalThis.testDataSource.query(
    `SELECT rule."universalIdentifier", rule."canReadRecords", rule."canCreateRecords",
            rule."canUpdateRecords", rule."canSoftDeleteRecords", rule."canDestroyRecords",
            "objectPermission"."canReadObjectRecords", "objectPermission"."canUpdateObjectRecords",
            predicate.id AS "predicateId"
     FROM core."rowLevelPermissionRule" rule
     JOIN core."role" role ON role.id = rule."roleId"
     JOIN core."rowLevelPermissionPredicate" predicate
       ON predicate."rowLevelPermissionRuleId" = rule.id AND predicate."deletedAt" IS NULL
     LEFT JOIN core."objectPermission" "objectPermission"
       ON "objectPermission"."roleId" = rule."roleId"
      AND "objectPermission"."objectMetadataId" = rule."objectMetadataId"
     WHERE role."universalIdentifier" = $1 AND rule."workspaceId" = $2`,
    [roleUniversalIdentifier, workspaceId],
  );

describe('Manifest sync - row level permission rules declared on a role', () => {
  let workspace: WorkspaceCustomApplicationSyncWorkspace;

  const sync = async (manifest: Manifest) => {
    const { errors } = await syncApplication({
      manifest,
      inferDeletionFromMissingEntities: true,
      expectToFail: false,
      token: workspace.accessToken,
    });

    expect(errors).toBeUndefined();
  };

  const findRuleRowsOfRole = (universalIdentifiers: RoleUniversalIdentifiers) =>
    findRuleRows({
      workspaceId: workspace.workspaceId,
      roleUniversalIdentifier: universalIdentifiers.role,
    });

  beforeAll(async () => {
    workspace = await createWorkspaceCustomApplicationSyncWorkspace();
  }, 120000);

  afterAll(async () => {
    await workspace.deleteWorkspace();
  }, 120000);

  it('moves the object permission onto the derived rule of predicates declared outside a rule, and keeps it there on re-sync', async () => {
    const universalIdentifiers = buildRoleUniversalIdentifiers();
    const manifestWithoutRule = buildManifestWithoutRule({
      workspace,
      universalIdentifiers,
    });

    await sync(manifestWithoutRule);
    await sync(manifestWithoutRule);

    expect(await findRuleRowsOfRole(universalIdentifiers)).toMatchObject([
      {
        canReadRecords: true,
        canCreateRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: false,
        canDestroyRecords: false,
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
      },
    ]);
  }, 60000);

  it('writes the all records grants of an object and its rule with nested predicates', async () => {
    const universalIdentifiers = buildRoleUniversalIdentifiers();

    await sync(buildManifestWithRule({ workspace, universalIdentifiers }));

    expect(await findRuleRowsOfRole(universalIdentifiers)).toMatchObject([
      {
        universalIdentifier: universalIdentifiers.rule,
        canReadRecords: true,
        canUpdateRecords: false,
        canReadObjectRecords: null,
        canUpdateObjectRecords: true,
      },
    ]);
  }, 60000);

  it('keeps the predicate when a manifest moves it into a rule', async () => {
    const universalIdentifiers = buildRoleUniversalIdentifiers();

    await sync(buildManifestWithoutRule({ workspace, universalIdentifiers }));

    const [{ predicateId }] = await findRuleRowsOfRole(universalIdentifiers);

    await sync(buildManifestWithRule({ workspace, universalIdentifiers }));

    expect(await findRuleRowsOfRole(universalIdentifiers)).toMatchObject([
      {
        universalIdentifier: universalIdentifiers.rule,
        predicateId,
        canReadRecords: true,
      },
    ]);
  }, 60000);
});
