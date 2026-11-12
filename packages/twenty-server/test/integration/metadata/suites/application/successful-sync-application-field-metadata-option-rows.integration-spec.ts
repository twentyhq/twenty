import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type FieldManifest,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'd1b2c3d4-0001-4000-a000-0000000000f1';
const TEST_ROLE_ID = 'd1b2c3d4-0002-4000-a000-0000000000f2';
const TEST_OBJECT_ID = 'd1b2c3d4-0003-4000-a000-0000000000f3';
const NAME_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000f1';
const SELECT_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000f2';
const REPLACEMENT_SELECT_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000f3';
const SECOND_SELECT_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000f4';

const OPEN_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000f1';
const CLOSED_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000f2';
const PAUSED_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000f3';

type SelectFieldOptions = NonNullable<
  Extract<FieldManifest, { type: FieldMetadataType.SELECT }>['options']
>;

const buildManifest = ({
  options,
  selectFieldUniversalIdentifier = SELECT_FIELD_ID,
  extraFields = [],
}: {
  options: SelectFieldOptions;
  selectFieldUniversalIdentifier?: string;
  extraFields?: ObjectManifest['fields'];
}) => {
  const object: ObjectManifest = {
    universalIdentifier: TEST_OBJECT_ID,
    nameSingular: 'optionRowsSubject',
    namePlural: 'optionRowsSubjects',
    labelSingular: 'Option Rows Subject',
    labelPlural: 'Option Rows Subjects',
    labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
    fields: [
      {
        universalIdentifier: NAME_FIELD_ID,
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
      },
      {
        universalIdentifier: selectFieldUniversalIdentifier,
        name: 'status',
        label: 'Status',
        type: FieldMetadataType.SELECT,
        options,
      },
      ...extraFields,
    ],
  };

  return buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [object] },
  });
};

const findOptionRowsOwnedByTestApp = async (
  fieldUniversalIdentifier = SELECT_FIELD_ID,
) =>
  globalThis.testDataSource.query(
    `SELECT option."universalIdentifier", option.value, option.label, option.color, option.position
      FROM core."fieldMetadataOption" option
      JOIN core."fieldMetadata" field ON field.id = option."fieldMetadataId"
      JOIN core.application application ON application.id = option."applicationId"
      WHERE option."workspaceId" = $1
        AND field."universalIdentifier" = $2
        AND application."universalIdentifier" = $3
      ORDER BY option.position`,
    [SEED_APPLE_WORKSPACE_ID, fieldUniversalIdentifier, TEST_APP_ID],
  );

describe('Sync application keeps field option rows in step with its manifest', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Field Option Rows App',
      description: 'App for testing field option rows on sync',
      sourcePath: 'test-field-option-rows',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates, updates and removes the app option rows', async () => {
    await syncApplication({
      manifest: buildManifest({
        options: [
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
        ],
      }),
      expectToFail: false,
    });

    expect(await findOptionRowsOwnedByTestApp()).toEqual([
      {
        universalIdentifier: OPEN_OPTION_ID,
        value: 'OPEN',
        label: 'Open',
        color: 'green',
        position: 0,
      },
      {
        universalIdentifier: CLOSED_OPTION_ID,
        value: 'CLOSED',
        label: 'Closed',
        color: 'red',
        position: 1,
      },
    ]);

    await syncApplication({
      manifest: buildManifest({
        options: [
          {
            id: OPEN_OPTION_ID,
            value: 'OPEN',
            label: 'In progress',
            color: 'blue',
            position: 0,
          },
          {
            id: PAUSED_OPTION_ID,
            value: 'PAUSED',
            label: 'Paused',
            color: 'gray',
            position: 1,
          },
        ],
      }),
      expectToFail: false,
    });

    expect(await findOptionRowsOwnedByTestApp()).toEqual([
      {
        universalIdentifier: OPEN_OPTION_ID,
        value: 'OPEN',
        label: 'In progress',
        color: 'blue',
        position: 0,
      },
      {
        universalIdentifier: PAUSED_OPTION_ID,
        value: 'PAUSED',
        label: 'Paused',
        color: 'gray',
        position: 1,
      },
    ]);
  }, 60000);

  it('syncs two fields of one manifest that share an option id, the second without its row', async () => {
    const sharedOption: SelectFieldOptions[number] = {
      id: OPEN_OPTION_ID,
      value: 'OPEN',
      label: 'Open',
      color: 'green',
      position: 0,
    };

    const { errors } = await syncApplication({
      manifest: buildManifest({
        options: [sharedOption],
        extraFields: [
          {
            universalIdentifier: SECOND_SELECT_FIELD_ID,
            name: 'priority',
            label: 'Priority',
            type: FieldMetadataType.SELECT,
            options: [sharedOption],
          },
        ],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findOptionRowsOwnedByTestApp()).toEqual([
      {
        universalIdentifier: OPEN_OPTION_ID,
        value: 'OPEN',
        label: 'Open',
        color: 'green',
        position: 0,
      },
    ]);
    expect(await findOptionRowsOwnedByTestApp(SECOND_SELECT_FIELD_ID)).toEqual(
      [],
    );
  }, 60000);

  it('rejects a replacement field that reuses the option ids', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        options: [
          {
            id: OPEN_OPTION_ID,
            value: 'OPEN',
            label: 'In progress',
            color: 'blue',
            position: 0,
          },
        ],
        selectFieldUniversalIdentifier: REPLACEMENT_SELECT_FIELD_ID,
      }),
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'fieldMetadataOption property \\"fieldMetadataUniversalIdentifier\\" cannot be updated',
    );
  }, 60000);

  it('keeps syncing a manifest with legacy option ids, without rows for that field', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        options: [
          {
            id: OPEN_OPTION_ID.toUpperCase(),
            value: 'OPEN',
            label: 'Open',
            color: 'green',
            position: 0,
          },
        ],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findOptionRowsOwnedByTestApp()).toEqual([]);
  }, 60000);
});
