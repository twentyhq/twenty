import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type FieldManifest,
  type ObjectManifest,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'd1b2c3d4-0001-4000-a000-0000000000e1';
const TEST_ROLE_ID = 'd1b2c3d4-0002-4000-a000-0000000000e2';
const TEST_OBJECT_ID = 'd1b2c3d4-0003-4000-a000-0000000000e3';
const NAME_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000e1';
const SELECT_FIELD_ID = 'd1b2c3d4-0100-4000-a000-0000000000e2';

const OPEN_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000e1';
const CLOSED_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000e2';

const ARCHIVED_OPTION_ID = 'd1b2c3d4-0200-4000-a000-0000000000e3';
const ARCHIVED_OPTION = {
  id: ARCHIVED_OPTION_ID,
  value: 'ARCHIVED',
  label: 'Archived',
  color: 'gray',
  position: 2,
} as const;

type SelectFieldOptions = NonNullable<
  Extract<FieldManifest, { type: FieldMetadataType.SELECT }>['options']
>;

const OPEN_OPTION = {
  id: OPEN_OPTION_ID,
  value: 'OPEN',
  label: 'Open',
  color: 'green',
  position: 0,
} as const;
const CLOSED_OPTION = {
  id: CLOSED_OPTION_ID,
  value: 'CLOSED',
  label: 'Closed',
  color: 'red',
  position: 1,
} as const;

const buildManifest = (options: SelectFieldOptions) => {
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

const manifest = buildManifest([OPEN_OPTION, CLOSED_OPTION]);

const APP_OPTION_ROWS = [
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
];

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

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const findSubjectTableName = async (): Promise<string> => {
  const [{ table_name: tableName }] = await globalThis.testDataSource.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = $1 AND table_name ILIKE '%workspaceEditedOptionsSubject'`,
    [WORKSPACE_SCHEMA],
  );

  return tableName;
};

const createSubjectWithStatus = async (status: string): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `INSERT INTO "${WORKSPACE_SCHEMA}"."${await findSubjectTableName()}" (status, "createdByName", "updatedByName")
      VALUES ($1, 'Test', 'Test') RETURNING id`,
    [status],
  );

  return id;
};

const findSubjectStatus = async (id: string): Promise<string | null> => {
  const [{ status }] = await globalThis.testDataSource.query(
    `SELECT status FROM "${WORKSPACE_SCHEMA}"."${await findSubjectTableName()}"
      WHERE id = $1`,
    [id],
  );

  return status;
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

  const updateSelectFieldOptions = async (
    options: {
      id?: string;
      value: string;
      label: string;
      color: string;
      position: number;
    }[],
  ) =>
    updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: await findSelectFieldId(),
        updatePayload: { options },
      },
    });

  beforeEach(async () => {
    await syncApplication({ manifest, expectToFail: false });

    expect(await findSelectFieldOptionRows()).toEqual(APP_OPTION_ROWS);
  }, 60000);

  it('keeps the app option rows when a workspace edit sends no option ids', async () => {
    await updateSelectFieldOptions([
      { value: 'CLOSED', label: 'Closed', color: 'blue', position: 0 },
      { value: 'OPEN', label: 'Open', color: 'purple', position: 1 },
    ]);

    expect(await findSelectFieldOptionRows()).toEqual(APP_OPTION_ROWS);
  }, 60000);

  it('replaces a workspace option whose value a later version of the app ships', async () => {
    await updateSelectFieldOptions([
      OPEN_OPTION,
      CLOSED_OPTION,
      { value: 'ARCHIVED', label: 'Archived', color: 'gray', position: 2 },
    ]);

    expect(await findSelectFieldOptionRows()).toMatchObject([
      ...APP_OPTION_ROWS,
      { value: 'ARCHIVED', isOwnedByTestApp: false },
    ]);

    const archivedSubjectId = await createSubjectWithStatus('ARCHIVED');

    const { errors } = await syncApplication({
      manifest: buildManifest([OPEN_OPTION, CLOSED_OPTION, ARCHIVED_OPTION]),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await findSelectFieldOptionRows()).toEqual([
      ...APP_OPTION_ROWS,
      {
        universalIdentifier: ARCHIVED_OPTION_ID,
        value: 'ARCHIVED',
        color: 'gray',
        position: 2,
        isOwnedByTestApp: true,
      },
    ]);
    expect(await findSubjectStatus(archivedSubjectId)).toBe('ARCHIVED');
  }, 60000);

  it('fails when another application holds a value the app now ships', async () => {
    const invalidateOptionCaches = () =>
      getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
        'flatFieldMetadataOptionMaps',
      ]);

    await globalThis.testDataSource.query(
      `INSERT INTO core."fieldMetadataOption"
          ("workspaceId", "universalIdentifier", "fieldMetadataId", "applicationId", value, label, color, position)
        SELECT field."workspaceId", gen_random_uuid(), field.id, application.id, 'ARCHIVED', 'Archived', 'gray', 2
        FROM core."fieldMetadata" field
        JOIN core.application application
          ON application."workspaceId" = field."workspaceId"
          AND application."universalIdentifier" = $3
        WHERE field."workspaceId" = $1 AND field."universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        SELECT_FIELD_ID,
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      ],
    );
    await invalidateOptionCaches();

    try {
      const { errors } = await syncApplication({
        manifest: buildManifest([OPEN_OPTION, CLOSED_OPTION, ARCHIVED_OPTION]),
        expectToFail: true,
      });

      expect(errors?.[0]?.message).toBe(
        `Option value ARCHIVED of field status is already used by an option of application ${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}`,
      );
      expect(await findSelectFieldOptionRows()).toMatchObject([
        ...APP_OPTION_ROWS,
        { value: 'ARCHIVED', isOwnedByTestApp: false },
      ]);
    } finally {
      await globalThis.testDataSource.query(
        `DELETE FROM core."fieldMetadataOption"
          WHERE "workspaceId" = $1 AND value = 'ARCHIVED'
            AND "fieldMetadataId" = $2`,
        [SEED_APPLE_WORKSPACE_ID, await findSelectFieldId()],
      );
      await invalidateOptionCaches();
    }
  }, 60000);
  it('accepts a workspace label edit resending the options after an app took a workspace option position', async () => {
    await updateSelectFieldOptions([
      OPEN_OPTION,
      CLOSED_OPTION,
      { value: 'PENDING', label: 'Pending', color: 'yellow', position: 2 },
    ]);

    try {
      await syncApplication({
        manifest: buildManifest([OPEN_OPTION, CLOSED_OPTION, ARCHIVED_OPTION]),
        expectToFail: false,
      });

      expect(
        (await findSelectFieldOptionRows()).map(
          ({ position }: { position: number }) => position,
        ),
      ).toEqual([0, 1, 2, 2]);

      const { fields } = await findManyFieldsMetadata({
        expectToFail: false,
        input: {
          filter: { id: { eq: await findSelectFieldId() } },
          paging: { first: 1 },
        },
        gqlFields: 'id options',
      });
      const returnedOptions: {
        id: string;
        value: string;
        label: string;
        color: string;
        position: number;
      }[] = fields[0].node.options;

      expect(returnedOptions.map(({ position }) => position)).toEqual([
        0, 1, 2, 3,
      ]);

      const { errors } = await updateSelectFieldOptions(
        returnedOptions.map((option) =>
          option.value === 'PENDING' ? { ...option, label: 'Waiting' } : option,
        ),
      );

      expect(errors).toBeUndefined();

      const { errors: resyncErrors } = await syncApplication({
        manifest: buildManifest([OPEN_OPTION, CLOSED_OPTION, ARCHIVED_OPTION]),
        expectToFail: false,
      });

      expect(resyncErrors).toBeUndefined();
      expect(await findSelectFieldOptionRows()).toEqual(
        expect.arrayContaining([
          {
            universalIdentifier: ARCHIVED_OPTION_ID,
            value: 'ARCHIVED',
            color: 'gray',
            position: 2,
            isOwnedByTestApp: true,
          },
          expect.objectContaining({
            value: 'PENDING',
            isOwnedByTestApp: false,
          }),
        ]),
      );
    } finally {
      await syncApplication({ manifest, expectToFail: false });
      await updateSelectFieldOptions([OPEN_OPTION, CLOSED_OPTION]);
    }
  }, 60000);
});
