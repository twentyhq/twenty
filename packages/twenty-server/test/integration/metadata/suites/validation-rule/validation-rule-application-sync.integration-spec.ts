import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  createValidationRule,
  findValidationRules,
} from 'test/integration/metadata/suites/validation-rule/utils/validation-rule-api.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type FieldManifest } from 'twenty-shared/application';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const REFERENCE_FIELD_ID = uuidv4();
const PRIORITY_FIELD_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'validationRuleSyncTicket',
  namePlural: 'validationRuleSyncTickets',
  labelSingular: 'Validation Rule Sync Ticket',
  labelPlural: 'Validation Rule Sync Tickets',
  description: 'Object used to test validation rules across application syncs',
});

const PRIORITY_FIELD: FieldManifest = {
  universalIdentifier: PRIORITY_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'priority',
  label: 'Priority',
  icon: 'IconFlag',
  isNullable: true,
  objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
};

const buildManifest = ({
  name = 'reference',
  label = 'Reference',
  withPriority = false,
}: { name?: string; label?: string; withPriority?: boolean } = {}) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [TEST_OBJECT],
      fields: [
        {
          universalIdentifier: REFERENCE_FIELD_ID,
          type: FieldMetadataType.TEXT,
          name,
          label,
          icon: 'IconId',
          isNullable: true,
          objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
        },
        ...(withPriority ? [PRIORITY_FIELD] : []),
      ],
    },
  });

const findValidationRuleRow = async (validationRuleId: string) => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."validationRule" WHERE id = $1`,
    [validationRuleId],
  );

  return rows[0];
};

describe('Validation rules across application syncs', () => {
  let objectMetadataId: string;
  let validationRuleId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
      value: true,
      expectToFail: false,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Validation Rule Sync App',
      description: 'App owning the object a workspace rule checks',
      sourcePath: 'test-validation-rule-sync',
    });

    await syncApplication({ manifest: buildManifest(), expectToFail: false });

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });
    const object = objects.find(
      (candidate) =>
        candidate.universalIdentifier === TEST_OBJECT.universalIdentifier,
    );

    jestExpectToBeDefined(object);
    objectMetadataId = object.id;

    const response = await createValidationRule({
      objectMetadataId,
      name: 'Ticket has a reference',
      expression: 'isNonEmptyString(reference)',
      message: 'A ticket needs a reference',
    });

    jestExpectToBeDefined(response.body.data?.createValidationRule);
    validationRuleId = response.body.data.createValidationRule.id;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should keep a workspace rule when the application owning its object is synced again', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({ label: 'Ticket reference' }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRules(objectMetadataId)).toMatchObject([
      {
        id: validationRuleId,
        expression: 'isNonEmptyString($f1)',
        bindings: { $f1: REFERENCE_FIELD_ID },
        isActive: true,
      },
    ]);
  }, 60000);

  it('should leave a workspace rule untouched when the application renames a field it reads', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({ name: 'code' }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRules(objectMetadataId)).toMatchObject([
      {
        id: validationRuleId,
        expression: 'isNonEmptyString($f1)',
        bindings: { $f1: REFERENCE_FIELD_ID },
        isActive: true,
      },
    ]);
  }, 60000);

  it('should apply every field change of one sync to a rule reading several fields', async () => {
    await syncApplication({
      manifest: buildManifest({ name: 'code', withPriority: true }),
      expectToFail: false,
    });

    const response = await createValidationRule({
      objectMetadataId,
      name: 'Ticket has a code or a priority',
      expression: 'isNonEmptyString(code) or isNonEmptyString(priority)',
      message: 'A ticket needs a code or a priority',
    });
    const twoFieldValidationRuleId =
      response.body.data?.createValidationRule?.id;

    jestExpectToBeDefined(twoFieldValidationRuleId);

    const { errors } = await syncApplication({
      manifest: buildManifest({ name: 'ticketCode' }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const validationRuleById = new Map(
      (await findValidationRules(objectMetadataId)).map((validationRule) => [
        validationRule.id,
        validationRule,
      ]),
    );

    expect(validationRuleById.get(twoFieldValidationRuleId)).toMatchObject({
      expression: 'isNonEmptyString($f1) or isNonEmptyString($f2)',
      bindings: { $f1: REFERENCE_FIELD_ID, $f2: PRIORITY_FIELD_ID },
      isActive: false,
    });
    expect(validationRuleById.get(validationRuleId)).toMatchObject({
      expression: 'isNonEmptyString($f1)',
      bindings: { $f1: REFERENCE_FIELD_ID },
      isActive: true,
    });
  }, 60000);

  it('should delete a workspace rule when the application owning its object is uninstalled', async () => {
    const { errors } = await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRuleRow(validationRuleId)).toBeUndefined();
  }, 60000);
});
