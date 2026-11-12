import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'd1b2c3d4-0001-4000-a000-0000000000e1';
const TEST_ROLE_ID = 'd1b2c3d4-0002-4000-a000-0000000000e2';
const TEST_OBJECT_ID = 'd1b2c3d4-0003-4000-a000-0000000000e3';
const NAME_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000e1';
const SELECT_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000e2';

const OPEN_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000e1';
const CLOSED_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000e2';

const object: ObjectManifest = {
  universalIdentifier: TEST_OBJECT_ID,
  nameSingular: 'workspaceEditedOptionsSubject',
  namePlural: 'workspaceEditedOptionsSubjects',
  labelSingular: 'Workspace Edited Options Subject',
  labelPlural: 'Workspace Edited Options Subjects',
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
    },
  ],
};

const manifest = buildBaseManifest({
  appId: TEST_APP_ID,
  roleId: TEST_ROLE_ID,
  overrides: { objects: [object] },
});

const findSelectFieldOptionRows = async () =>
  globalThis.testDataSource.query(
    `SELECT option."universalIdentifier", option.value, option.color, option.position,
        application."universalIdentifier" = $3 AS "isOwnedByTestApp"
      FROM core."fieldMetadataOption" option
      JOIN core."fieldMetadata" field ON field.id = option."fieldMetadataId"
      JOIN core.application application ON application.id = option."applicationId"
      WHERE option."workspaceId" = $1
        AND field."universalIdentifier" = $2
      ORDER BY option.position`,
    [SEED_APPLE_WORKSPACE_ID, SELECT_FIELD_ID, TEST_APP_ID],
  );

const findSelectFieldId = async (): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `SELECT id FROM core."fieldMetadata"
      WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, SELECT_FIELD_ID],
  );

  return id;
};

describe('Sync application after a workspace edit re-keyed its field options', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Workspace Edited Options App',
      description: 'App for testing sync after workspace option edits',
      sourcePath: 'test-workspace-edited-options',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('replaces the workspace-owned option rows with the app rows', async () => {
    await syncApplication({ manifest, expectToFail: false });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: await findSelectFieldId(),
        updatePayload: {
          options: [
            { value: 'CLOSED', label: 'Closed', color: 'blue', position: 0 },
            { value: 'OPEN', label: 'Open', color: 'purple', position: 1 },
          ],
        },
      },
    });

    const workspaceEditedRows = await findSelectFieldOptionRows();

    expect(workspaceEditedRows).toHaveLength(2);
    expect(
      workspaceEditedRows.every(
        ({ isOwnedByTestApp }: { isOwnedByTestApp: boolean }) =>
          !isOwnedByTestApp,
      ),
    ).toBe(true);

    const { errors } = await syncApplication({
      manifest,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findSelectFieldOptionRows()).toEqual([
      {
        universalIdentifier: OPEN_OPTION_ID,
        value: 'OPEN',
        color: 'green',
        position: 0,
        isOwnedByTestApp: true,
      },
      {
        universalIdentifier: CLOSED_OPTION_ID,
        value: 'CLOSED',
        color: 'red',
        position: 1,
        isOwnedByTestApp: true,
      },
    ]);
  }, 60000);
});
