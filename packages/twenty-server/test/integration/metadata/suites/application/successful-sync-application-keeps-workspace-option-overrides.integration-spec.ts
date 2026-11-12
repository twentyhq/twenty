import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  type FieldManifest,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'd1b2c3d4-0001-4000-a000-0000000000d1';
const TEST_ROLE_ID = 'd1b2c3d4-0002-4000-a000-0000000000d2';
const TEST_OBJECT_ID = 'd1b2c3d4-0003-4000-a000-0000000000d3';
const NAME_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000d1';
const SELECT_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000d2';

const OPEN_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000d1';
const CLOSED_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000d2';
const PAUSED_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000d3';
const PENDING_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000d4';

type SelectFieldOptions = NonNullable<
  Extract<FieldManifest, { type: FieldMetadataType.SELECT }>['options']
>;

const buildManifest = (options: SelectFieldOptions) => {
  const object: ObjectManifest = {
    universalIdentifier: TEST_OBJECT_ID,
    nameSingular: 'optionOverridesSubject',
    namePlural: 'optionOverridesSubjects',
    labelSingular: 'Option Overrides Subject',
    labelPlural: 'Option Overrides Subjects',
    labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
    fields: [
      {
        universalIdentifier: NAME_FIELD_ID,
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
      },
      {
        universalIdentifier: SELECT_FIELD_ID,
        name: 'status',
        label: 'Status',
        type: FieldMetadataType.SELECT,
        options,
      },
    ],
  };

  return buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [object] },
  });
};

const MANIFEST_OPTIONS: SelectFieldOptions = [
  {
    id: OPEN_OPTION_ID,
    value: 'OPEN',
    label: 'Open',
    color: 'green',
    position: 0,
  },
  {
    id: CLOSED_OPTION_ID,
    value: 'CLOSED',
    label: 'Closed',
    color: 'red',
    position: 1,
  },
  {
    id: PAUSED_OPTION_ID,
    value: 'PAUSED',
    label: 'Paused',
    color: 'gray',
    position: 2,
  },
];

const findSelectField = async (): Promise<{
  id: string;
  options: { value: string }[];
}> => {
  const [selectField] = await globalThis.testDataSource.query(
    `SELECT id, options FROM core."fieldMetadata"
      WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, SELECT_FIELD_ID],
  );

  return selectField;
};

const findSelectFieldOptionRows = async () =>
  globalThis.testDataSource.query(
    `SELECT option.value, option.label, option.color, option.position,
        application."universalIdentifier" = $3 AS "isOwnedByTestApp",
        option.overrides IS NOT NULL AS "hasOverrides"
      FROM core."fieldMetadataOption" option
      JOIN core."fieldMetadata" field ON field.id = option."fieldMetadataId"
      JOIN core.application application ON application.id = option."applicationId"
      WHERE option."workspaceId" = $1 AND field."universalIdentifier" = $2
      ORDER BY option.value`,
    [SEED_APPLE_WORKSPACE_ID, SELECT_FIELD_ID, TEST_APP_ID],
  );

const findStatusEnumLabels = async (): Promise<string[]> => {
  const enumLabels: { enumlabel: string }[] =
    await globalThis.testDataSource.query(
      `SELECT DISTINCT enum.enumlabel FROM pg_enum enum
        JOIN pg_type type ON type.oid = enum.enumtypid
        WHERE type.typname ILIKE '%optionOverridesSubject_status_enum'
        ORDER BY enum.enumlabel`,
    );

  return enumLabels.map(({ enumlabel }) => enumlabel);
};

describe('Sync application keeps the option edits a workspace made on its fields', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Option Overrides App',
      description: 'App for testing workspace option overrides across syncs',
      sourcePath: 'test-option-overrides',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('keeps overrides, deactivations and workspace options across syncs', async () => {
    await syncApplication({
      manifest: buildManifest(MANIFEST_OPTIONS),
      expectToFail: false,
    });

    const { id: selectFieldId } = await findSelectField();

    // Sent without ids, the edit that used to re-key the app rows into workspace rows.
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: selectFieldId,
        updatePayload: {
          options: [
            { value: 'CLOSED', label: 'Done', color: 'blue', position: 0 },
            { value: 'OPEN', label: 'Open', color: 'green', position: 1 },
            {
              value: 'ARCHIVED',
              label: 'Archived',
              color: 'purple',
              position: 2,
            },
            {
              value: 'PAUSED',
              label: 'Paused',
              color: 'gray',
              position: 3,
              isActive: false,
            },
          ],
        },
      },
    });

    const workspaceEditedOptions = (await findSelectField()).options;
    const workspaceEditedRows = await findSelectFieldOptionRows();

    expect(workspaceEditedRows).toEqual([
      {
        value: 'ARCHIVED',
        label: 'Archived',
        color: 'purple',
        position: 2,
        isOwnedByTestApp: false,
        hasOverrides: false,
      },
      {
        value: 'CLOSED',
        label: 'Closed',
        color: 'red',
        position: 1,
        isOwnedByTestApp: true,
        hasOverrides: true,
      },
      {
        value: 'OPEN',
        label: 'Open',
        color: 'green',
        position: 0,
        isOwnedByTestApp: true,
        hasOverrides: true,
      },
      {
        value: 'PAUSED',
        label: 'Paused',
        color: 'gray',
        position: 2,
        isOwnedByTestApp: true,
        hasOverrides: true,
      },
    ]);

    await syncApplication({
      manifest: buildManifest(MANIFEST_OPTIONS),
      expectToFail: false,
    });

    expect((await findSelectField()).options).toEqual(workspaceEditedOptions);
    expect(await findSelectFieldOptionRows()).toEqual(workspaceEditedRows);

    await syncApplication({
      manifest: buildManifest([
        { ...MANIFEST_OPTIONS[0], label: 'Opened' },
        MANIFEST_OPTIONS[1],
        MANIFEST_OPTIONS[2],
        {
          id: PENDING_OPTION_ID,
          value: 'PENDING',
          label: 'Pending',
          color: 'yellow',
          position: 3,
        },
      ]),
      expectToFail: false,
    });

    expect(
      (await findSelectField()).options.map((option) => ({
        ...option,
        id: undefined,
      })),
    ).toEqual(
      [
        { value: 'CLOSED', label: 'Done', color: 'blue' },
        { value: 'OPEN', label: 'Opened', color: 'green' },
        {
          value: 'ARCHIVED',
          label: 'Archived',
          color: 'purple',
        },
        { value: 'PAUSED', label: 'Paused', color: 'gray', isActive: false },
        { value: 'PENDING', label: 'Pending', color: 'yellow' },
      ].map((option, position) => ({ ...option, position, id: undefined })),
    );
    expect(await findStatusEnumLabels()).toEqual([
      'ARCHIVED',
      'CLOSED',
      'OPEN',
      'PAUSED',
      'PENDING',
    ]);
  }, 120000);
});
