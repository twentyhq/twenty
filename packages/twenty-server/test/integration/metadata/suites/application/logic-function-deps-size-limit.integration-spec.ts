import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The local yarn install spawns real child processes and the config override
// takes effect at build time, so the whole suite needs real timers.
jest.useRealTimers();

jest.setTimeout(120000);

const APP_UNIVERSAL_IDENTIFIER = '1e2f983f-5c1a-4c60-a3c8-7d0e2a4a11e2';
const ROLE_UNIVERSAL_IDENTIFIER = '2f3f983f-5c1a-4c60-a3c8-7d0e2a4a22f3';
const FUNCTION_UNIVERSAL_IDENTIFIER = '3a4f983f-5c1a-4c60-a3c8-7d0e2a4a33a4';

// Unique checksum so this application gets its own dependency layer: the
// build (and with it the size gate) must run for this suite instead of
// reusing a layer another suite already built.
const YARN_LOCK_CHECKSUM = 'deps-size-limit-spec-checksum-1e2f983f';

const BUILT_HANDLER_CODE = `export const main = async () => ({ status: 'ok' });
`;

const logicFunctionManifest: LogicFunctionManifest = {
  universalIdentifier: FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'deps-size-limit-function',
  handlerName: 'main',
  sourceHandlerPath: 'src/deps-size-limit-function.ts',
  builtHandlerPath: 'dist/deps-size-limit-function.mjs',
  builtHandlerChecksum: 'checksum-deps-size-limit-function',
};

describe('Logic function dependencies size limit (integration)', () => {
  let logicFunctionId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Deps Size Limit Test App',
      description: 'App for testing the dependency size limit',
      sourcePath: 'deps-size-limit-test-app',
    });

    jest.useRealTimers();

    // Overwrite the default package.json with one carrying a real dependency
    // so the installed tree is larger than the 1MB limit set below.
    await uploadApplicationFile({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'Dependencies',
      filePath: 'package.json',
      fileBuffer: Buffer.from(
        JSON.stringify({
          name: 'deps-size-limit-test-app',
          version: '1.0.0',
          dependencies: { lodash: '4.17.21' },
        }),
      ),
      filename: 'package.json',
      expectToFail: false,
    });

    await uploadApplicationFile({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: logicFunctionManifest.builtHandlerPath,
      fileBuffer: Buffer.from(BUILT_HANDLER_CODE),
      filename: 'deps-size-limit-function.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });

    const manifest = buildBaseManifest({
      appId: APP_UNIVERSAL_IDENTIFIER,
      roleId: ROLE_UNIVERSAL_IDENTIFIER,
      overrides: { logicFunctions: [logicFunctionManifest] },
    });

    manifest.application.yarnLockChecksum = YARN_LOCK_CHECKSUM;

    await syncApplication({ manifest, expectToFail: false });

    const logicFunction = await getCoreRepository<LogicFunctionEntity>(
      LogicFunctionEntity,
    ).findOneOrFail({
      where: {
        universalIdentifier: FUNCTION_UNIVERSAL_IDENTIFIER,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      },
    });

    logicFunctionId = logicFunction.id;

    jest.useRealTimers();
  }, 120000);

  afterAll(async () => {
    try {
      await deleteConfigVariable({
        input: { key: 'LOGIC_FUNCTION_MAX_DEPS_SIZE_MB' },
        expectToFail: true,
      });
    } catch {
      // Already deleted by the test itself.
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('should reject the dependency layer build when the installed tree exceeds the configured limit, then succeed once the limit is lifted', async () => {
    await createConfigVariable({
      input: { key: 'LOGIC_FUNCTION_MAX_DEPS_SIZE_MB', value: 1 },
      expectToFail: false,
    });

    try {
      const { errors } = await executeLogicFunction({
        input: { id: logicFunctionId, payload: {} },
        expectToFail: true,
      });

      expect(JSON.stringify(errors)).toContain('Dependencies size exceeded');
    } finally {
      await deleteConfigVariable({
        input: { key: 'LOGIC_FUNCTION_MAX_DEPS_SIZE_MB' },
        expectToFail: false,
      });
    }

    const { data } = await executeLogicFunction({
      input: { id: logicFunctionId, payload: {} },
      expectToFail: false,
    });

    expect(data.executeOneLogicFunction.status).toBe(
      LogicFunctionExecutionStatus.SUCCESS,
    );
    expect(data.executeOneLogicFunction.data).toEqual({ status: 'ok' });
  });
});
