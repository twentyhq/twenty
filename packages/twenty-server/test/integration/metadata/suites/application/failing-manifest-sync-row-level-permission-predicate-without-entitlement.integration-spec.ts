import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import {
  type BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_OBJECT_PERMISSION_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const TEST_PREDICATE_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const personScopingFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'integrationRlsEntitlementColumn',
  label: 'Integration RLS Entitlement Column',
  description: 'Custom field a row-level predicate scopes on',
  icon: 'IconLock',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

const buildManifestWithPredicateValues = (values: string[]): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      fields: [personScopingFieldManifest],
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'RLS Entitlement Test Role',
          description: 'Role declaring row-level predicates',
          objectPermissions: [
            {
              universalIdentifier: TEST_OBJECT_PERMISSION_ID,
              objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
          ],
          rowLevelPermissionPredicates: values.map((value) => ({
            universalIdentifier: TEST_PREDICATE_ID,
            objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
            fieldUniversalIdentifier: TEST_FIELD_ID,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value,
          })),
        },
      ],
    },
  });

type PredicateRow = {
  id: string;
  value: string;
};

const findActivePredicateRows = async (): Promise<PredicateRow[]> =>
  globalThis.testDataSource.query(
    `SELECT id, value
     FROM core."rowLevelPermissionPredicate"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2 AND "deletedAt" IS NULL`,
    [TEST_PREDICATE_ID, TEST_WORKSPACE_ID],
  );

const mockEnterprisePlanAsInvalid = () =>
  jest
    .spyOn(
      getAppProviderByClassName<EnterprisePlanService>('EnterprisePlanService'),
      'isValid',
    )
    .mockReturnValue(false);

const setupTestApplication = () =>
  setupApplicationForSync({
    applicationUniversalIdentifier: TEST_APP_ID,
    name: 'Test RLS Entitlement Application',
    description: 'App for testing row-level predicate sync without entitlement',
    sourcePath: 'test-manifest-rls-predicate-without-entitlement',
  });

const installWithPredicateThenLoseEntitlement = async (): Promise<string> => {
  await setupTestApplication();

  await syncApplication({
    manifest: buildManifestWithPredicateValues(['Apple']),
    expectToFail: false,
  });

  const predicateRows = await findActivePredicateRows();

  expect(predicateRows).toHaveLength(1);

  mockEnterprisePlanAsInvalid();

  return predicateRows[0].id;
};

const cleanupTestApplication = async () => {
  jest.restoreAllMocks();

  await cleanupApplicationAndAppRegistration({
    applicationUniversalIdentifier: TEST_APP_ID,
  });
};

const expectRowLevelPermissionFeatureDisabledError = (
  errors: BaseGraphQLError[],
) => {
  expect(errors[0].extensions).toMatchObject({
    code: ErrorCode.BAD_USER_INPUT,
    subCode: ApplicationExceptionCode.ROW_LEVEL_PERMISSION_FEATURE_DISABLED,
  });

  expectOneNotInternalServerErrorSnapshot({ errors });
};

describe('Manifest sync - row level permission predicates without the entitlement', () => {
  describe('when installing an app that declares a predicate', () => {
    beforeAll(async () => {
      await setupTestApplication();

      mockEnterprisePlanAsInvalid();
    }, 60000);

    afterAll(cleanupTestApplication);

    it('refuses the sync and creates no predicate', async () => {
      const { errors } = await syncApplication({
        manifest: buildManifestWithPredicateValues(['Apple']),
        expectToFail: true,
      });

      expectRowLevelPermissionFeatureDisabledError(errors);

      expect(await findActivePredicateRows()).toHaveLength(0);
    }, 60000);
  });

  describe('when the app was installed with the entitlement', () => {
    let predicateId: string;

    beforeAll(async () => {
      predicateId = await installWithPredicateThenLoseEntitlement();
    }, 60000);

    afterAll(cleanupTestApplication);

    it('accepts a re-sync that leaves the predicate unchanged', async () => {
      const { errors } = await syncApplication({
        manifest: buildManifestWithPredicateValues(['Apple']),
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(await findActivePredicateRows()).toEqual([
        { id: predicateId, value: 'Apple' },
      ]);
    }, 60000);

    it('refuses a re-sync that changes the predicate value', async () => {
      const { errors } = await syncApplication({
        manifest: buildManifestWithPredicateValues(['Microsoft']),
        expectToFail: true,
      });

      expectRowLevelPermissionFeatureDisabledError(errors);

      expect(await findActivePredicateRows()).toEqual([
        { id: predicateId, value: 'Apple' },
      ]);
    }, 60000);

    it('accepts a re-sync that drops the predicate', async () => {
      const { errors } = await syncApplication({
        manifest: buildManifestWithPredicateValues([]),
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(await findActivePredicateRows()).toHaveLength(0);
    }, 60000);
  });

  describe('when uninstalling an app that holds a predicate', () => {
    beforeAll(async () => {
      await installWithPredicateThenLoseEntitlement();
    }, 60000);

    afterAll(cleanupTestApplication);

    it('uninstalls the app and removes the predicate', async () => {
      const { errors } = await uninstallApplication({
        universalIdentifier: TEST_APP_ID,
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
      expect(await findActivePredicateRows()).toHaveLength(0);
    }, 60000);
  });
});
