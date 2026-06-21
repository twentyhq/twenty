import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_OBJECT_PERMISSION_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const TEST_PREDICATE_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;
const WORKSPACE_MEMBER_ID_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.fields.id.universalIdentifier;

// A custom field contributed to the standard Person object. The predicate scopes on it; using
// an app-owned field keeps the test self-contained and exercises cross-app reference resolution
// (the predicate also points at the standard workspaceMember.id field).
const personScopingFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'integrationRlsScopingColumn',
  label: 'Integration RLS Scoping Column',
  description: 'Custom field a row-level predicate scopes on',
  icon: 'IconLock',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

const buildManifestWithPredicates = (
  predicates: NonNullable<
    Manifest['roles'][number]['rowLevelPermissionPredicates']
  >,
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      fields: [personScopingFieldManifest],
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'RLS Test Role',
          description: 'Role exercising declarative row-level predicates',
          objectPermissions: [
            {
              universalIdentifier: TEST_OBJECT_PERMISSION_ID,
              objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
          ],
          rowLevelPermissionPredicates: predicates,
        },
      ],
    },
  });

const partnerUserStylePredicate = (
  operand: RowLevelPermissionPredicateOperand,
) => ({
  universalIdentifier: TEST_PREDICATE_ID,
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  fieldUniversalIdentifier: TEST_FIELD_ID,
  operand,
  workspaceMemberFieldUniversalIdentifier:
    WORKSPACE_MEMBER_ID_FIELD_UNIVERSAL_IDENTIFIER,
});

type PredicateRow = {
  id: string;
  operand: string;
  roleId: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  workspaceMemberFieldMetadataId: string | null;
  applicationId: string;
};

const findActivePredicateRows = async (): Promise<PredicateRow[]> =>
  globalThis.testDataSource.query(
    `SELECT id, operand, "roleId", "objectMetadataId", "fieldMetadataId",
            "workspaceMemberFieldMetadataId", "applicationId"
     FROM core."rowLevelPermissionPredicate"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2 AND "deletedAt" IS NULL`,
    [TEST_PREDICATE_ID, TEST_WORKSPACE_ID],
  );

const findApplicationId = async (): Promise<string> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [TEST_APP_ID, TEST_WORKSPACE_ID],
  );

  return rows[0]?.id;
};

const findRoleId = async (): Promise<string> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."role"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [TEST_ROLE_ID, TEST_WORKSPACE_ID],
  );

  return rows[0]?.id;
};

const findPersonObjectId = async (): Promise<string> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."objectMetadata"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [PERSON_OBJECT_UNIVERSAL_IDENTIFIER, TEST_WORKSPACE_ID],
  );

  return rows[0]?.id;
};

describe('Manifest sync - row level permission predicates declared on a role', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test RLS Predicate Application',
      description: 'App for testing declarative row-level predicate sync',
      sourcePath: 'test-manifest-rls-predicate',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates a row-level predicate owned by the app and pointing at the declared role/object/field', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithPredicates([
        partnerUserStylePredicate(RowLevelPermissionPredicateOperand.IS),
      ]),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const [applicationId, roleId, personObjectId, predicateRows] =
      await Promise.all([
        findApplicationId(),
        findRoleId(),
        findPersonObjectId(),
        findActivePredicateRows(),
      ]);

    expect(predicateRows).toHaveLength(1);

    const predicate = predicateRows[0];

    expect(predicate.operand).toBe(RowLevelPermissionPredicateOperand.IS);
    expect(predicate.roleId).toBe(roleId);
    expect(predicate.objectMetadataId).toBe(personObjectId);
    expect(predicate.fieldMetadataId).toBeTruthy();
    expect(predicate.workspaceMemberFieldMetadataId).toBeTruthy();
    // The whole point of declarative RLS: the predicate is owned by the app that ships the
    // role, not by the workspace's generic custom-application bucket.
    expect(predicate.applicationId).toBe(applicationId);
  }, 60000);

  it('updates the predicate in place on re-sync and removes it when dropped from the manifest', async () => {
    await syncApplication({
      manifest: buildManifestWithPredicates([
        partnerUserStylePredicate(RowLevelPermissionPredicateOperand.IS),
      ]),
      expectToFail: false,
    });

    const createdRows = await findActivePredicateRows();

    expect(createdRows).toHaveLength(1);
    const predicateId = createdRows[0].id;

    // Re-sync with a changed operand and the same universalIdentifier: the existing predicate
    // row is updated, not duplicated.
    await syncApplication({
      manifest: buildManifestWithPredicates([
        partnerUserStylePredicate(RowLevelPermissionPredicateOperand.IS_NOT),
      ]),
      expectToFail: false,
    });

    const updatedRows = await findActivePredicateRows();

    expect(updatedRows).toHaveLength(1);
    expect(updatedRows[0].id).toBe(predicateId);
    expect(updatedRows[0].operand).toBe(
      RowLevelPermissionPredicateOperand.IS_NOT,
    );

    // Drop the predicate from the manifest: inferred deletion removes it.
    await syncApplication({
      manifest: buildManifestWithPredicates([]),
      expectToFail: false,
    });

    expect(await findActivePredicateRows()).toHaveLength(0);
  }, 60000);

  it('removes the predicate on uninstall', async () => {
    await syncApplication({
      manifest: buildManifestWithPredicates([
        partnerUserStylePredicate(RowLevelPermissionPredicateOperand.IS),
      ]),
      expectToFail: false,
    });

    expect(await findActivePredicateRows()).toHaveLength(1);

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    expect(await findActivePredicateRows()).toHaveLength(0);
  }, 60000);
});
