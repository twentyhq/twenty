import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { runTransferApplicationToWorkspaceCustomApplicationCommand } from 'test/integration/metadata/suites/application/utils/run-transfer-application-to-workspace-custom-application-command.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type ApplicationOwnedRow,
  buildTransferredApplicationManifest,
  buildTransferredObjectNameSingular,
  findApplicationId,
  findRowsOwnedByApplication,
  findWorkspaceCustomApplication,
  installTransferredApplication,
  TRANSFERRED_BUILT_HANDLER_PATH,
  TRANSFERRED_SECRET_VARIABLE_KEY,
} from 'test/integration/metadata/suites/application/utils/transferred-application.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import gql from 'graphql-tag';
import {
  getFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  SYSTEM_VIEW_KEYS,
} from 'twenty-shared/application';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SECRET_VARIABLE_VALUE = 'transferred-secret-value';

const NON_COPIED_FILE_FOLDERS: string[] = [
  FileFolder.Dependencies,
  FileFolder.GeneratedSdkClient,
];

const recreateDevelopmentApplication = (
  applicationUniversalIdentifier: string,
) =>
  makeMetadataApiRequest({
    query: gql`
      mutation CreateDevelopmentApplication(
        $universalIdentifier: String!
        $name: String!
      ) {
        createDevelopmentApplication(
          universalIdentifier: $universalIdentifier
          name: $name
        ) {
          id
        }
      }
    `,
    variables: {
      universalIdentifier: applicationUniversalIdentifier,
      name: 'Transferred Application',
    },
  });

describe('Transfer an application to the workspace custom application', () => {
  const applicationUniversalIdentifier = uuidv4();
  const roleUniversalIdentifier = uuidv4();
  const objectUniversalIdentifier = uuidv4();
  const nameSingular = buildTransferredObjectNameSingular('transferTicket');
  const manifest = buildTransferredApplicationManifest({
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectUniversalIdentifier,
    nameSingular,
  });

  let workspaceCustomApplication: Awaited<
    ReturnType<typeof findWorkspaceCustomApplication>
  >;
  let sourceApplicationId: string;
  let rowsOwnedBeforeTransfer: ApplicationOwnedRow[];
  let objectMetadataId: string;
  const createdRecordIds: string[] = [];

  beforeAll(async () => {
    workspaceCustomApplication = await findWorkspaceCustomApplication();
    sourceApplicationId = await installTransferredApplication({
      applicationUniversalIdentifier,
      manifest,
    });

    await updateOneApplicationVariable({
      input: {
        key: TRANSFERRED_SECRET_VARIABLE_KEY,
        value: SECRET_VARIABLE_VALUE,
        applicationId: sourceApplicationId,
      },
      expectToFail: false,
    });

    for (const summary of ['First ticket', 'Second ticket']) {
      const {
        data: { createOneResponse },
      } = await createOneOperation({
        objectMetadataSingularName: nameSingular,
        input: { summary },
        expectToFail: false,
      });

      createdRecordIds.push(createOneResponse.id);
    }

    rowsOwnedBeforeTransfer =
      await findRowsOwnedByApplication(sourceApplicationId);

    objectMetadataId = rowsOwnedBeforeTransfer.find(
      ({ tableName, universalIdentifier }) =>
        tableName === 'objectMetadata' &&
        universalIdentifier === objectUniversalIdentifier,
    )?.id as string;
  }, 120000);

  afterAll(async () => {
    const transferredRowIds = new Set(
      rowsOwnedBeforeTransfer.map(({ id }) => id),
    );
    const rowsLeftOver = (
      await findRowsOwnedByApplication(workspaceCustomApplication.id)
    ).filter(({ id }) => transferredRowIds.has(id));

    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });

    for (const { tableName, id } of rowsLeftOver) {
      await globalThis.testDataSource.query(
        `DELETE FROM core."${tableName}" WHERE "id" = $1`,
        [id],
      );
    }

    await getAppProviderByClassName<FileStorageService>(
      'FileStorageService',
    ).deleteFileObject({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier:
        workspaceCustomApplication.universalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: TRANSFERRED_BUILT_HANDLER_PATH,
    });

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatApplicationMaps',
      'flatLogicFunctionMaps',
      'flatRoleMaps',
      'flatApplicationVariableMaps',
      'userApplicationVariableValueMaps',
      'rolesPermissions',
    ]);

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  }, 120000);

  it('should only report on a dry run', async () => {
    const { exitCode, output } =
      await runTransferApplicationToWorkspaceCustomApplicationCommand({
        applicationUniversalIdentifier,
        isDryRun: true,
      });

    expect({ exitCode, output }).toEqual({
      exitCode: 0,
      output: expect.stringContaining('[DRY RUN] Transfer report'),
    });
    expect(await findRowsOwnedByApplication(sourceApplicationId)).toEqual(
      expect.arrayContaining(rowsOwnedBeforeTransfer),
    );
  }, 120000);

  it('should move every row into the custom application without deleting any', async () => {
    const { exitCode, output } =
      await runTransferApplicationToWorkspaceCustomApplicationCommand({
        applicationUniversalIdentifier,
      });

    expect({ exitCode, output }).toEqual({
      exitCode: 0,
      output: expect.any(String),
    });
    expect(await findApplicationId(applicationUniversalIdentifier)).toBe(
      undefined,
    );

    const rowAfterTransferById = new Map(
      (await findRowsOwnedByApplication(workspaceCustomApplication.id)).map(
        (row) => [row.id, row],
      ),
    );

    const rowsNotMoved = rowsOwnedBeforeTransfer.filter(
      ({ id, tableName }) =>
        rowAfterTransferById.get(id)?.tableName !== tableName,
    );

    expect(
      rowsNotMoved.filter(
        ({ tableName, path }) =>
          tableName !== 'file' ||
          !NON_COPIED_FILE_FOLDERS.includes(path?.split('/')[0] ?? ''),
      ),
    ).toEqual([]);

    expect(
      [...rowAfterTransferById.values()].map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual(
      expect.arrayContaining([
        objectUniversalIdentifier,
        roleUniversalIdentifier,
        manifest.logicFunctions[0].universalIdentifier,
        manifest.application.applicationVariables?.[
          TRANSFERRED_SECRET_VARIABLE_KEY
        ]?.universalIdentifier,
      ]),
    );
    expect((await findWorkspaceCustomApplication()).defaultRoleId).toBe(
      workspaceCustomApplication.defaultRoleId,
    );
  }, 180000);

  it('should keep the records of the transferred object', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: nameSingular,
        objectMetadataPluralName: `${nameSingular}s`,
        gqlFields: 'id',
      }),
    );

    expect(
      response.body.data[`${nameSingular}s`].edges
        .map(({ node }: { node: { id: string } }) => node.id)
        .sort(),
    ).toEqual([...createdRecordIds].sort());
  });

  it('should re-derive engine identifiers from the custom application', async () => {
    const [idField] = await globalThis.testDataSource.query(
      `SELECT "universalIdentifier", "applicationId" FROM core."fieldMetadata"
       WHERE "objectMetadataId" = $1 AND "name" = 'id'`,
      [objectMetadataId],
    );

    expect(idField).toEqual({
      universalIdentifier: getFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          workspaceCustomApplication.universalIdentifier,
        objectUniversalIdentifier,
        name: 'id',
      }),
      applicationId: workspaceCustomApplication.id,
    });
  });

  it('should keep the secret application variable readable', async () => {
    const [applicationVariable] = await globalThis.testDataSource.query(
      `SELECT "value", "applicationId" FROM core."applicationVariable"
       WHERE "key" = $1 AND "workspaceId" = $2`,
      [TRANSFERRED_SECRET_VARIABLE_KEY, SEED_APPLE_WORKSPACE_ID],
    );

    expect(applicationVariable.applicationId).toBe(
      workspaceCustomApplication.id,
    );
    expect(
      getAppProviderByClassName<SecretEncryptionService>(
        'SecretEncryptionService',
      ).decryptVersionedOrThrow(applicationVariable.value, {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    ).toBe(SECRET_VARIABLE_VALUE);
  });

  it('should copy the stored files under the custom application', async () => {
    expect(
      await getAppProviderByClassName<FileStorageService>(
        'FileStorageService',
      ).checkFileExists({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationUniversalIdentifier:
          workspaceCustomApplication.universalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: TRANSFERRED_BUILT_HANDLER_PATH,
      }),
    ).toBe(true);
  });

  it('should let engine side effects find the re-derived system rows', async () => {
    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'priority',
        label: 'Priority',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const indexViewFields = await globalThis.testDataSource.query(
      `SELECT view_field."id" FROM core."viewField" view_field
       JOIN core."view" view ON view."id" = view_field."viewId"
       WHERE view_field."fieldMetadataId" = $1 AND view."universalIdentifier" = $2`,
      [
        createOneField.id,
        getSystemViewUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            workspaceCustomApplication.universalIdentifier,
          objectUniversalIdentifier,
          viewKey: SYSTEM_VIEW_KEYS.INDEX,
        }),
      ],
    );

    expect(indexViewFields).toHaveLength(1);
  });

  it('should refuse to sync the transferred manifest again', async () => {
    await recreateDevelopmentApplication(applicationUniversalIdentifier);

    jest.useRealTimers();
    await uploadApplicationFile({
      applicationUniversalIdentifier,
      fileFolder: 'Dependencies',
      filePath: 'package.json',
      fileBuffer: Buffer.from(
        JSON.stringify({ name: 'transferred', version: '1.0.0' }),
      ),
      filename: 'package.json',
      expectToFail: false,
    });
    jest.useFakeTimers();

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toMatch(/universal ?identifier/i);
  });
});
