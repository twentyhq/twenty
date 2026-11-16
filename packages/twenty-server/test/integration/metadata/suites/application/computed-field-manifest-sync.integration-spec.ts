import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { type FieldManifest } from 'twenty-shared/application';
import {
  FeatureFlagKey,
  type FieldMetadataComputation,
  FieldMetadataType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const RATE_FIELD_ID = uuidv4();
const TOTAL_FIELD_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'computedFieldManifestProject',
  namePlural: 'computedFieldManifestProjects',
  labelSingular: 'Computed Field Manifest Project',
  labelPlural: 'Computed Field Manifest Projects',
  description: 'Object used to test computed fields declared in a manifest',
});

const RATE_FIELD: FieldManifest = {
  universalIdentifier: RATE_FIELD_ID,
  type: FieldMetadataType.NUMBER,
  name: 'rate',
  label: 'Rate',
  icon: 'IconPercentage',
  isNullable: true,
  objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
};

const buildTotalField = (expression: string): FieldManifest => ({
  universalIdentifier: TOTAL_FIELD_ID,
  type: FieldMetadataType.NUMBER,
  name: 'total',
  label: 'Total',
  icon: 'IconCalculator',
  isNullable: true,
  objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
  computation: { kind: 'FORMULA', expression },
});

const buildManifest = (fields: FieldManifest[]) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [TEST_OBJECT], fields },
  });

const syncTotalField = ({
  expression,
  expectToFail = false,
}: {
  expression: string;
  expectToFail?: boolean;
}) =>
  syncApplication({
    manifest: buildManifest([RATE_FIELD, buildTotalField(expression)]),
    expectToFail,
  });

type FieldRow = {
  id: string;
  name: string;
  computation: FieldMetadataComputation | null;
};

const findFieldRow = async (universalIdentifier: string): Promise<FieldRow> => {
  const rows: FieldRow[] = await globalThis.testDataSource.query(
    `SELECT id, name, computation FROM core."fieldMetadata" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return rows[0];
};

const renameField = async ({
  fieldMetadataId,
  name,
}: {
  fieldMetadataId: string;
  name: string;
}) => {
  const { errors } = await updateOneFieldMetadata({
    input: { idToUpdate: fieldMetadataId, updatePayload: { name } },
    gqlFields: 'id name',
    expectToFail: false,
  });

  expect(errors).toBeUndefined();
};

describe('Computed fields declared in an application manifest', () => {
  let budgetFieldMetadataId = '';
  let budgetFieldUniversalIdentifier = '';

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_COMPUTED_FIELDS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Computed Field Manifest App',
      description: 'App declaring a computed field',
      sourcePath: 'test-computed-field-manifest',
    });
    await syncApplication({
      manifest: buildManifest([RATE_FIELD]),
      expectToFail: false,
    });

    const objectRows: { id: string }[] = await globalThis.testDataSource.query(
      `SELECT id FROM core."objectMetadata" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [TEST_OBJECT.universalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

    // Owned by the workspace: the application names its own fields, so only a field outside it keeps a workspace rename
    const { data } = await createOneFieldMetadata({
      input: {
        name: 'budget',
        label: 'Budget',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: objectRows[0].id,
      },
      gqlFields: 'id universalIdentifier',
      expectToFail: false,
    });

    budgetFieldMetadataId = data.createOneField.id;
    budgetFieldUniversalIdentifier = data.createOneField.universalIdentifier;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });

    const remainingFields: unknown[] = await globalThis.testDataSource.query(
      `SELECT id FROM core."fieldMetadata" WHERE id = $1`,
      [budgetFieldMetadataId],
    );

    expect(remainingFields).toEqual([]);
  }, 60000);

  it('should create the computed field with bindings computed from its formula', async () => {
    const { errors } = await syncTotalField({ expression: 'budget * rate' });

    expect(errors).toBeUndefined();
    expect(await findFieldRow(TOTAL_FIELD_ID)).toMatchObject({
      name: 'total',
      computation: {
        kind: 'FORMULA',
        expression: 'budget * rate',
        bindings: {
          budget: budgetFieldUniversalIdentifier,
          rate: RATE_FIELD_ID,
        },
      },
    });
  }, 60000);

  it('should follow a workspace rename, and refuse a manifest that still reads the old name', async () => {
    await renameField({ fieldMetadataId: budgetFieldMetadataId, name: 'cost' });

    expect((await findFieldRow(TOTAL_FIELD_ID)).computation).toEqual({
      kind: 'FORMULA',
      expression: 'cost * rate',
      bindings: { cost: budgetFieldUniversalIdentifier, rate: RATE_FIELD_ID },
    });

    const { errors } = await syncTotalField({
      expression: 'budget * rate',
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  }, 60000);

  it('should give a field of the application its manifest name back, in the formula too', async () => {
    const { id: rateFieldMetadataId } = await findFieldRow(RATE_FIELD_ID);

    await renameField({ fieldMetadataId: rateFieldMetadataId, name: 'ratio' });

    expect((await findFieldRow(TOTAL_FIELD_ID)).computation).toMatchObject({
      expression: 'cost * ratio',
    });

    const { errors } = await syncTotalField({ expression: 'cost * rate * 2' });

    expect(errors).toBeUndefined();
    expect(await findFieldRow(RATE_FIELD_ID)).toMatchObject({ name: 'rate' });
    expect((await findFieldRow(TOTAL_FIELD_ID)).computation).toEqual({
      kind: 'FORMULA',
      expression: 'cost * rate * 2',
      bindings: { cost: budgetFieldUniversalIdentifier, rate: RATE_FIELD_ID },
    });
  }, 60000);
});
