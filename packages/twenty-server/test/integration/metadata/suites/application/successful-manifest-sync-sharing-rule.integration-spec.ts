import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type FieldManifest,
  type Manifest,
  type SharingRuleManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const EVERYONE_RULE_ID = uuidv4();
const ROLE_RULE_ID = uuidv4();
const TEST_PREDICATE_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const personScopingFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'integrationSharingRuleColumn',
  label: 'Integration Sharing Rule Column',
  description: 'Custom field a sharing rule scopes on',
  icon: 'IconLock',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

const everyoneRuleManifest: SharingRuleManifest = {
  universalIdentifier: EVERYONE_RULE_ID,
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'Everyone reads people',
  granteePrincipalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
};

const roleRuleManifest: SharingRuleManifest = {
  universalIdentifier: ROLE_RULE_ID,
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'Role edits flagged people',
  description: 'Rule exercising declarative criteria',
  granteePrincipalType: RecordSharePrincipalType.ROLE,
  granteeRoleUniversalIdentifier: TEST_ROLE_ID,
  accessLevel: RecordShareAccessLevel.READ_WRITE,
  rowLevelPermissionPredicates: [
    {
      universalIdentifier: TEST_PREDICATE_ID,
      objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: TEST_FIELD_ID,
      operand: RowLevelPermissionPredicateOperand.IS,
      value: 'flagged',
    },
  ],
};

const buildManifestWithSharingRules = (
  sharingRules: SharingRuleManifest[],
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      fields: [personScopingFieldManifest],
      sharingRules,
    },
  });

type SharingRuleRow = {
  id: string;
  universalIdentifier: string;
  name: string;
  granteePrincipalType: string;
  granteeRoleId: string | null;
  granteePrincipalId: string | null;
  accessLevel: string;
  isActive: boolean;
  objectMetadataId: string;
  applicationId: string;
};

type PredicateRow = {
  id: string;
  roleId: string | null;
  sharingRuleId: string | null;
  objectMetadataId: string;
};

const findSharingRuleRows = async (): Promise<SharingRuleRow[]> =>
  globalThis.testDataSource.query(
    `SELECT id, "universalIdentifier", name, "granteePrincipalType",
            "granteeRoleId", "granteePrincipalId", "accessLevel", "isActive",
            "objectMetadataId", "applicationId"
     FROM core."sharingRule"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2::uuid[])
     ORDER BY name`,
    [TEST_WORKSPACE_ID, [EVERYONE_RULE_ID, ROLE_RULE_ID]],
  );

const countRolePredicateRows = async (roleId: string): Promise<number> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT count(*)::int AS count FROM core."rowLevelPermissionPredicate"
     WHERE "roleId" = $1 AND "workspaceId" = $2`,
    [roleId, TEST_WORKSPACE_ID],
  );

  return rows[0].count;
};

const findPredicateRows = async (): Promise<PredicateRow[]> =>
  globalThis.testDataSource.query(
    `SELECT id, "roleId", "sharingRuleId", "objectMetadataId"
     FROM core."rowLevelPermissionPredicate"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [TEST_PREDICATE_ID, TEST_WORKSPACE_ID],
  );

const findSingleId = async (table: string, universalIdentifier: string) => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."${table}"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, TEST_WORKSPACE_ID],
  );

  return rows[0]?.id;
};

describe('Manifest sync - sharing rules', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Sharing Rule Application',
      description: 'App for testing declarative sharing rule sync',
      sourcePath: 'test-manifest-sharing-rule',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates the rules and hangs the criteria on the rule rather than a role', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithSharingRules([
        everyoneRuleManifest,
        roleRuleManifest,
      ]),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const [applicationId, roleId, personObjectId, sharingRuleRows] =
      await Promise.all([
        findSingleId('application', TEST_APP_ID),
        findSingleId('role', TEST_ROLE_ID),
        findSingleId('objectMetadata', PERSON_OBJECT_UNIVERSAL_IDENTIFIER),
        findSharingRuleRows(),
      ]);

    expect(sharingRuleRows).toHaveLength(2);

    const [everyoneRule, roleRule] = sharingRuleRows;

    expect(everyoneRule).toMatchObject({
      universalIdentifier: EVERYONE_RULE_ID,
      name: 'Everyone reads people',
      granteePrincipalType: RecordSharePrincipalType.EVERYONE,
      granteeRoleId: null,
      granteePrincipalId: null,
      accessLevel: RecordShareAccessLevel.READ,
      isActive: true,
      objectMetadataId: personObjectId,
      applicationId,
    });
    expect(roleRule).toMatchObject({
      universalIdentifier: ROLE_RULE_ID,
      granteePrincipalType: RecordSharePrincipalType.ROLE,
      granteeRoleId: roleId,
      granteePrincipalId: null,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    const predicateRows = await findPredicateRows();

    expect(predicateRows).toHaveLength(1);
    expect(predicateRows[0]).toMatchObject({
      roleId: null,
      sharingRuleId: roleRule.id,
      objectMetadataId: personObjectId,
    });
    expect(await countRolePredicateRows(roleId)).toBe(0);
  }, 60000);

  it('deletes a rule removed from the manifest and cascades its criteria', async () => {
    await syncApplication({
      manifest: buildManifestWithSharingRules([
        everyoneRuleManifest,
        roleRuleManifest,
      ]),
      expectToFail: false,
    });

    expect(await findPredicateRows()).toHaveLength(1);

    const { errors } = await syncApplication({
      manifest: buildManifestWithSharingRules([everyoneRuleManifest]),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const sharingRuleRows = await findSharingRuleRows();

    expect(sharingRuleRows.map((row) => row.universalIdentifier)).toEqual([
      EVERYONE_RULE_ID,
    ]);
    expect(await findPredicateRows()).toHaveLength(0);
  }, 60000);

  it('refuses a predicate carrying both a role and a sharing rule parent', async () => {
    await syncApplication({
      manifest: buildManifestWithSharingRules([roleRuleManifest]),
      expectToFail: false,
    });

    const [roleId, [sharingRuleRow]] = await Promise.all([
      findSingleId('role', TEST_ROLE_ID),
      findSharingRuleRows(),
    ]);
    const [predicateRow] = await findPredicateRows();

    const predicateRepository = getCoreRepository(
      RowLevelPermissionPredicateEntity,
    );

    await expect(
      predicateRepository.update(
        { id: predicateRow.id },
        { roleId, sharingRuleId: sharingRuleRow.id },
      ),
    ).rejects.toThrow('CHK_RLPP_ROLE_OR_SHARING_RULE');
  }, 60000);
});
