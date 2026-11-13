import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findLogicFunctionId } from 'test/integration/server-route-trigger/utils/find-logic-function-id.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import {
  LOGIC_FUNCTION_HTTP_RESPONSE_MARKER,
  type LogicFunctionHttpResponse,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type HttpResponseLogicFunctionApplication = {
  applicationId: string;
  applicationRegistrationId: string;
  applicationUniversalIdentifier: string;
  logicFunctionId: string;
  logicFunctionUniversalIdentifier: string;
};

export const setupHttpResponseLogicFunctionApplication = async ({
  name,
  response,
  triggerSettings,
}: {
  name: string;
  response: Omit<LogicFunctionHttpResponse, '__twentyHttpResponse'>;
  triggerSettings: Pick<
    LogicFunctionManifest,
    'httpRouteTriggerSettings' | 'serverRouteTriggerSettings'
  >;
}): Promise<HttpResponseLogicFunctionApplication> => {
  const applicationUniversalIdentifier = uuidv4();
  const logicFunctionUniversalIdentifier = uuidv4();
  const builtHandlerCode = `export const main = async () => (${JSON.stringify({
    [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
    ...response,
  })});\n`;

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: `${name} answering a fixed HTTP response`,
    sourcePath: `test-${applicationUniversalIdentifier}`,
  });

  jest.useRealTimers();
  await uploadApplicationFile({
    applicationUniversalIdentifier,
    fileFolder: 'BuiltLogicFunction',
    filePath: 'dist/http-response.mjs',
    fileBuffer: Buffer.from(builtHandlerCode),
    filename: 'http-response.mjs',
    contentType: 'application/javascript',
    expectToFail: false,
  });
  jest.useFakeTimers();

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: uuidv4(),
      overrides: {
        logicFunctions: [
          {
            universalIdentifier: logicFunctionUniversalIdentifier,
            name: 'http-response',
            handlerName: 'main',
            sourceHandlerPath: 'src/http-response.ts',
            builtHandlerPath: 'dist/http-response.mjs',
            builtHandlerChecksum: 'checksum-http-response',
            ...triggerSettings,
          },
        ],
      },
    }),
    expectToFail: false,
  });

  jest.useRealTimers();

  const [{ id: applicationId, applicationRegistrationId }] =
    await globalThis.testDataSource.query(
      `SELECT id, "applicationRegistrationId" FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

  const logicFunctionId = await findLogicFunctionId({
    universalIdentifier: logicFunctionUniversalIdentifier,
    workspaceId: SEED_APPLE_WORKSPACE_ID,
  });

  return {
    applicationId,
    applicationRegistrationId,
    applicationUniversalIdentifier,
    logicFunctionId,
    logicFunctionUniversalIdentifier,
  };
};
