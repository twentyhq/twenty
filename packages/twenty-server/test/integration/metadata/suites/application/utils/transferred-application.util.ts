import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export type ApplicationOwnedRow = {
  tableName: string;
  id: string;
  universalIdentifier: string | null;
  path: string | null;
};

export const TRANSFERRED_BUILT_HANDLER_PATH = 'dist/handler.mjs';

export const TRANSFERRED_SECRET_VARIABLE_KEY = 'TRANSFER_TEST_SECRET';

// Letters only: resolver names are camel-cased, which splits a digit from the plural "s"
export const buildTransferredObjectNameSingular = (prefix: string): string =>
  `${prefix}${Date.now().toString(36).replace(/[0-9]/g, '')}`;

export const findRowsOwnedByApplication = async (
  applicationId: string,
): Promise<ApplicationOwnedRow[]> => {
  const ownedTables: { tableName: string }[] =
    await globalThis.testDataSource.query(
      `SELECT DISTINCT referencing_table.relname AS "tableName"
       FROM pg_constraint foreign_key
       JOIN pg_class referencing_table ON referencing_table.oid = foreign_key.conrelid
       JOIN pg_attribute referencing_column
         ON referencing_column.attrelid = foreign_key.conrelid
        AND referencing_column.attnum = foreign_key.conkey[1]
       WHERE foreign_key.contype = 'f'
         AND foreign_key.confrelid = 'core.application'::regclass
         AND referencing_column.attname = 'applicationId'`,
    );

  const ownedRowsByTable = await Promise.all(
    ownedTables.map(async ({ tableName }) => {
      const rows: Omit<ApplicationOwnedRow, 'tableName'>[] =
        await globalThis.testDataSource.query(
          `SELECT "id",
                  to_jsonb(owned_row)->>'universalIdentifier' AS "universalIdentifier",
                  to_jsonb(owned_row)->>'path' AS "path"
           FROM core."${tableName}" owned_row WHERE "applicationId" = $1`,
          [applicationId],
        );

      return rows.map((row) => ({ ...row, tableName }));
    }),
  );

  return ownedRowsByTable.flat();
};

export const findWorkspaceCustomApplication = async (): Promise<{
  id: string;
  universalIdentifier: string;
  defaultRoleId: string | null;
}> => {
  const [workspaceCustomApplication] = await globalThis.testDataSource.query(
    `SELECT application."id", application."universalIdentifier", application."defaultRoleId"
     FROM core."workspace" workspace
     JOIN core."application" application ON application."id" = workspace."workspaceCustomApplicationId"
     WHERE workspace."id" = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return workspaceCustomApplication;
};

export const findApplicationId = async (
  universalIdentifier: string,
): Promise<string | undefined> => {
  const [application] = await globalThis.testDataSource.query(
    `SELECT "id" FROM core."application" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return application?.id;
};

export const buildTransferredApplicationManifest = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  objectUniversalIdentifier,
  nameSingular,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  nameSingular: string;
}): Manifest =>
  buildBaseManifest({
    appId: applicationUniversalIdentifier,
    roleId: roleUniversalIdentifier,
    overrides: {
      application: {
        universalIdentifier: applicationUniversalIdentifier,
        defaultRoleUniversalIdentifier: roleUniversalIdentifier,
        displayName: 'Transferred Application',
        description: 'Application transferred into the custom application',
        applicationVariables: {
          [TRANSFERRED_SECRET_VARIABLE_KEY]: {
            universalIdentifier: uuidv4(),
            isSecret: true,
          },
        },
        packageJsonChecksum: null,
        yarnLockChecksum: null,
      },
      objects: [
        buildDefaultObjectManifest({
          applicationUniversalIdentifier,
          universalIdentifier: objectUniversalIdentifier,
          nameSingular,
          namePlural: `${nameSingular}s`,
          labelSingular: 'Transferred Ticket',
          labelPlural: 'Transferred Tickets',
          additionalFields: [
            {
              universalIdentifier: uuidv4(),
              type: FieldMetadataType.TEXT,
              name: 'summary',
              label: 'Summary',
              isNullable: true,
            },
          ],
        }),
      ],
      logicFunctions: [
        {
          universalIdentifier: uuidv4(),
          name: `${nameSingular}-handler`,
          description: 'Handles transferred tickets',
          handlerName: 'handler',
          sourceHandlerPath: 'src/handler.ts',
          builtHandlerPath: TRANSFERRED_BUILT_HANDLER_PATH,
          builtHandlerChecksum: 'handler-checksum',
          toolTriggerSettings: {},
        },
      ],
    },
  });

export const installTransferredApplication = async ({
  applicationUniversalIdentifier,
  manifest,
}: {
  applicationUniversalIdentifier: string;
  manifest: Manifest;
}): Promise<string> => {
  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name: manifest.application.displayName,
    description: 'Application transferred into the custom application',
    sourcePath: `test-${applicationUniversalIdentifier}`,
  });

  jest.useRealTimers();

  await uploadApplicationFile({
    applicationUniversalIdentifier,
    fileFolder: 'BuiltLogicFunction',
    filePath: TRANSFERRED_BUILT_HANDLER_PATH,
    fileBuffer: Buffer.from('export const handler = () => "transferred";'),
    filename: 'handler.mjs',
    contentType: 'application/javascript',
    expectToFail: false,
  });

  jest.useFakeTimers();

  await syncApplication({ manifest, expectToFail: false });

  return (await findApplicationId(applicationUniversalIdentifier)) as string;
};
