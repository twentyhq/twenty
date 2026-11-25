/* @license Enterprise */

import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { updateValidationRule } from 'test/integration/metadata/suites/validation-rule/utils/validation-rule-api.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { type ValidationRuleManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const REFERENCE_FIELD_ID = uuidv4();
const VALIDATION_RULE_ID = uuidv4();
const OUTSIDE_VALIDATION_RULE_ID = uuidv4();
const OVERRIDE_VALIDATION_RULE_ID = uuidv4();
const GENERATED_FIELD_VALIDATION_RULE_ID = uuidv4();

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.universalIdentifier;

const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'validationRuleManifestTicket',
  namePlural: 'validationRuleManifestTickets',
  labelSingular: 'Validation Rule Manifest Ticket',
  labelPlural: 'Validation Rule Manifest Tickets',
  description: 'Object used to test validation rules declared in a manifest',
});

const FRESH_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'validationRuleManifestFreshTicket',
  namePlural: 'validationRuleManifestFreshTickets',
  labelSingular: 'Validation Rule Manifest Fresh Ticket',
  labelPlural: 'Validation Rule Manifest Fresh Tickets',
  description: 'Object created by the sync that declares its rule',
});

const buildValidationRuleManifest = (
  overrides: Partial<ValidationRuleManifest> = {},
): ValidationRuleManifest => ({
  universalIdentifier: VALIDATION_RULE_ID,
  objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
  name: 'Ticket has a reference',
  expression: 'isNonEmptyString(reference)',
  message: 'A ticket needs a reference',
  errorFieldUniversalIdentifier: REFERENCE_FIELD_ID,
  ...overrides,
});

const buildManifest = ({
  fieldName = 'reference',
  hasReferenceField = true,
  objects = [TEST_OBJECT],
  validationRules = [buildValidationRuleManifest()],
}: {
  fieldName?: string;
  hasReferenceField?: boolean;
  objects?: (typeof TEST_OBJECT)[];
  validationRules?: ValidationRuleManifest[];
} = {}) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects,
      fields: hasReferenceField
        ? [
            {
              universalIdentifier: REFERENCE_FIELD_ID,
              type: FieldMetadataType.TEXT,
              name: fieldName,
              label: 'Reference',
              icon: 'IconId',
              isNullable: true,
              objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
            },
          ]
        : [],
      validationRules,
    },
  });

const findValidationRuleRow = async (
  validationRuleId: string = VALIDATION_RULE_ID,
) => {
  const rows = await globalThis.testDataSource.query(
    `SELECT vr.name, vr.expression, vr.bindings, vr.message, vr."isActive",
       errorField."universalIdentifier" AS "errorFieldUniversalIdentifier",
       app."universalIdentifier" AS "applicationUniversalIdentifier"
     FROM core."validationRule" vr
     JOIN core."application" app ON app.id = vr."applicationId"
     LEFT JOIN core."fieldMetadata" errorField ON errorField.id = vr."errorFieldMetadataId"
     WHERE vr."universalIdentifier" = $1`,
    [validationRuleId],
  );

  return rows[0];
};

const findValidationRuleIdentifiers = async () => {
  const rows: { id: string }[] = await globalThis.testDataSource.query(
    `SELECT id FROM core."validationRule" WHERE "universalIdentifier" = $1`,
    [VALIDATION_RULE_ID],
  );

  return rows[0];
};

const findObjectMetadataId = async (objectUniversalIdentifier: string) => {
  const rows: { id: string }[] = await globalThis.testDataSource.query(
    `SELECT id FROM core."objectMetadata" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [objectUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return rows[0].id;
};

describe('Validation rules declared in an application manifest', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Validation Rule Manifest App',
      description: 'App declaring a validation rule',
      sourcePath: 'test-validation-rule-manifest',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should create the rule with bindings compiled from the expression', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRuleRow()).toEqual({
      name: 'Ticket has a reference',
      expression: 'isNonEmptyString(reference)',
      bindings: { reference: REFERENCE_FIELD_ID },
      message: 'A ticket needs a reference',
      isActive: true,
      errorFieldUniversalIdentifier: REFERENCE_FIELD_ID,
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  }, 60000);

  it('should follow a field rename declared in the same sync', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        fieldName: 'code',
        validationRules: [
          buildValidationRuleManifest({
            expression: 'isNonEmptyString(code)',
          }),
        ],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRuleRow()).toMatchObject({
      expression: 'isNonEmptyString(code)',
      bindings: { code: REFERENCE_FIELD_ID },
      isActive: true,
    });
  }, 60000);

  it('should reject an expression reading a field the object does not have', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        fieldName: 'code',
        validationRules: [
          buildValidationRuleManifest({
            expression: 'isNonEmptyString(reference)',
          }),
        ],
      }),
      expectToFail: true,
    });

    expect(errors?.[0]?.message).toContain('Unknown field "reference"');
    expect(await findValidationRuleRow()).toMatchObject({
      expression: 'isNonEmptyString(code)',
    });
  }, 60000);

  it('should keep a rule the workspace turned off when the application syncs again', async () => {
    const { id } = await findValidationRuleIdentifiers();

    await updateValidationRule(id, { isActive: false });

    const { errors } = await syncApplication({
      manifest: buildManifest({
        fieldName: 'code',
        validationRules: [
          buildValidationRuleManifest({
            expression: 'isNonEmptyString(code)',
          }),
        ],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRuleRow()).toMatchObject({ isActive: false });

    await updateValidationRule(id, { isActive: true });
  }, 60000);

  it('should fail clearly when the application removes a field its rule reads', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        fieldName: 'code',
        hasReferenceField: false,
        validationRules: [
          buildValidationRuleManifest({
            expression: 'isNonEmptyString(code)',
            errorFieldUniversalIdentifier: undefined,
          }),
        ],
      }),
      expectToFail: true,
    });

    expect(errors?.[0]?.message).toContain(
      'uses the field "code", which no longer exists',
    );
  }, 60000);

  it('should leave the rule off when the workspace deleted a field outside the application', async () => {
    const companyObjectMetadataId = await findObjectMetadataId(
      COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    const { data } = await createOneFieldMetadata({
      input: {
        name: 'validationRuleManifestScore',
        label: 'Validation Rule Manifest Score',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: companyObjectMetadataId,
      },
      gqlFields: 'id universalIdentifier',
      expectToFail: false,
    });
    const fieldId = data.createOneField.id;
    const outsideRule = buildValidationRuleManifest({
      universalIdentifier: OUTSIDE_VALIDATION_RULE_ID,
      objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      expression: 'validationRuleManifestScore > 0',
      errorFieldUniversalIdentifier: data.createOneField.universalIdentifier,
    });
    const manifest = buildManifest({
      fieldName: 'code',
      validationRules: [outsideRule],
    });

    await syncApplication({ manifest, expectToFail: false });

    await updateOneFieldMetadata({
      input: { idToUpdate: fieldId, updatePayload: { isActive: false } },
      gqlFields: 'id',
      expectToFail: false,
    });

    await syncApplication({ manifest, expectToFail: false });

    expect(
      await findValidationRuleRow(OUTSIDE_VALIDATION_RULE_ID),
    ).toMatchObject({ isActive: false });

    await deleteOneFieldMetadata({
      input: { idToDelete: fieldId },
      expectToFail: false,
    });

    await syncApplication({ manifest, expectToFail: false });

    expect(
      await findValidationRuleRow(OUTSIDE_VALIDATION_RULE_ID),
    ).toMatchObject({
      isActive: false,
      errorFieldUniversalIdentifier: null,
    });
  }, 120000);

  it('should accept a rule reading a field Twenty generates, on a new and on an existing object', async () => {
    const manifest = buildManifest({
      fieldName: 'code',
      objects: [TEST_OBJECT, FRESH_OBJECT],
      validationRules: [
        buildValidationRuleManifest({
          universalIdentifier: GENERATED_FIELD_VALIDATION_RULE_ID,
          objectUniversalIdentifier: FRESH_OBJECT.universalIdentifier,
          expression: 'isDefined(createdAt)',
          errorFieldUniversalIdentifier: undefined,
        }),
      ],
    });

    for (const sync of ['object created', 'object exists']) {
      const { errors } = await syncApplication({
        manifest,
        expectToFail: false,
      });

      expect([sync, errors]).toEqual([sync, undefined]);
    }
    expect(
      await findValidationRuleRow(GENERATED_FIELD_VALIDATION_RULE_ID),
    ).toMatchObject({ isActive: true });
  }, 60000);

  it('should leave the rule off when the workspace deactivated a standard field through an override', async () => {
    const personObjectMetadataId = await findObjectMetadataId(
      STANDARD_OBJECTS.person.universalIdentifier,
    );
    const rows: { id: string }[] = await globalThis.testDataSource.query(
      `SELECT id FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND name = 'jobTitle'`,
      [personObjectMetadataId],
    );
    const standardFieldId = rows[0].id;
    const manifest = buildManifest({
      fieldName: 'code',
      validationRules: [
        buildValidationRuleManifest({
          universalIdentifier: OVERRIDE_VALIDATION_RULE_ID,
          objectUniversalIdentifier:
            STANDARD_OBJECTS.person.universalIdentifier,
          expression: 'isNonEmptyString(jobTitle)',
          errorFieldUniversalIdentifier: undefined,
        }),
      ],
    });

    await syncApplication({ manifest, expectToFail: false });

    expect(
      await findValidationRuleRow(OVERRIDE_VALIDATION_RULE_ID),
    ).toMatchObject({ isActive: true });

    try {
      await updateOneFieldMetadata({
        input: {
          idToUpdate: standardFieldId,
          updatePayload: { isActive: false },
        },
        gqlFields: 'id',
        expectToFail: false,
      });

      await syncApplication({ manifest, expectToFail: false });

      expect(
        await findValidationRuleRow(OVERRIDE_VALIDATION_RULE_ID),
      ).toMatchObject({ isActive: false });
    } finally {
      await updateOneFieldMetadata({
        input: {
          idToUpdate: standardFieldId,
          updatePayload: { isActive: true },
        },
        gqlFields: 'id',
        expectToFail: false,
      });
    }
  }, 120000);

  it('should delete the rule once the manifest no longer declares it', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({ fieldName: 'code', validationRules: [] }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRuleRow()).toBeUndefined();
  }, 60000);

  it('should delete the rule when the application is uninstalled', async () => {
    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });
    expect(await findValidationRuleRow()).toBeDefined();

    const { errors } = await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findValidationRuleRow()).toBeUndefined();
  }, 60000);
});
