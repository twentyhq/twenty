import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest, type RoleManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_RULE_ID = uuidv4();
const TEST_PREDICATE_ID = uuidv4();

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.universalIdentifier;

const companyNamePredicate = {
  universalIdentifier: TEST_PREDICATE_ID,
  objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  fieldUniversalIdentifier:
    STANDARD_OBJECTS.company.fields.name.universalIdentifier,
  operand: RowLevelPermissionPredicateOperand.CONTAINS,
  value: 'Acme',
};

const buildManifest = (
  role: Pick<
    RoleManifest,
    | 'objectPermissions'
    | 'rowLevelPermissionRules'
    | 'rowLevelPermissionPredicates'
  >,
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'RLS Rule Test Role',
          ...role,
        },
      ],
    },
  });

const manifestWithoutRule = buildManifest({
  objectPermissions: [
    {
      objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    },
  ],
  rowLevelPermissionPredicates: [companyNamePredicate],
});

const {
  objectUniversalIdentifier: _objectUniversalIdentifier,
  ...companyNameRulePredicate
} = companyNamePredicate;

const manifestWithRule = buildManifest({
  rowLevelPermissionRules: [
    {
      universalIdentifier: TEST_RULE_ID,
      objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadRecords: true,
      predicates: [companyNameRulePredicate],
    },
  ],
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

const findRuleRows = async (): Promise<RuleRow[]> =>
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
    [TEST_ROLE_ID, SEED_APPLE_WORKSPACE_ID],
  );

describe('Manifest sync - row level permission rules declared on a role', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test RLS Rule Application',
      description: 'App for testing row level permission rule sync',
      sourcePath: 'test-manifest-rls-rule',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('moves the object permission onto the derived rule of predicates declared outside a rule, and keeps it there on re-sync', async () => {
    await syncApplication({
      manifest: manifestWithoutRule,
      expectToFail: false,
    });
    await syncApplication({
      manifest: manifestWithoutRule,
      expectToFail: false,
    });

    expect(await findRuleRows()).toMatchObject([
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

  it('writes a rule with its grants and nested predicates and leaves the object permission to the manifest', async () => {
    await syncApplication({ manifest: manifestWithRule, expectToFail: false });

    expect(await findRuleRows()).toMatchObject([
      {
        universalIdentifier: TEST_RULE_ID,
        canReadRecords: true,
        canUpdateRecords: false,
        canReadObjectRecords: null,
      },
    ]);
  }, 60000);

  it('keeps the predicate when a manifest moves it into a rule', async () => {
    await syncApplication({
      manifest: manifestWithoutRule,
      expectToFail: false,
    });

    const [{ predicateId }] = await findRuleRows();

    await syncApplication({ manifest: manifestWithRule, expectToFail: false });

    expect(await findRuleRows()).toMatchObject([
      { universalIdentifier: TEST_RULE_ID, predicateId, canReadRecords: true },
    ]);
  }, 60000);
});
