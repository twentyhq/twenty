import crypto from 'crypto';
import gql from 'graphql-tag';
import request from 'supertest';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { findApplicationRegistrationByUniversalIdentifier } from 'test/integration/metadata/suites/application-registration/utils/find-application-registration-by-universal-identifier.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { findManyLogicFunctions } from 'test/integration/metadata/suites/logic-function/utils/find-many-logic-functions.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ToolCategory } from 'twenty-shared/ai';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const CLI_CALLBACK_URL = 'http://127.0.0.1:53682/callback';

// Same browser flow as `twenty remote add`: authorize the CLI client with PKCE
// as the workspace admin, then exchange the code for the CLI access token.
const loginAsTwentyCli = async (): Promise<string> => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  const discovery = await request(baseUrl)
    .get('/.well-known/oauth-authorization-server')
    .expect(200);

  const clientId: string = discovery.body.cli_client_id;
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  const authorizeResponse = await makeMetadataApiRequest({
    query: gql`
      mutation AuthorizeApp(
        $clientId: String!
        $codeChallenge: String
        $redirectUrl: String!
      ) {
        authorizeApp(
          clientId: $clientId
          codeChallenge: $codeChallenge
          redirectUrl: $redirectUrl
        ) {
          redirectUrl
        }
      }
    `,
    variables: { clientId, codeChallenge, redirectUrl: CLI_CALLBACK_URL },
  });

  expect(authorizeResponse.body.errors).toBeUndefined();

  const code = new URL(
    authorizeResponse.body.data.authorizeApp.redirectUrl,
  ).searchParams.get('code');

  const tokenResponse = await request(baseUrl)
    .post('/oauth/token')
    .send({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri: CLI_CALLBACK_URL,
      client_id: clientId,
    })
    .expect(200);

  return tokenResponse.body.access_token;
};

describe('OAuth-only client access to installed applications should succeed', () => {
  let installedApplication: ApplicationWithResources;
  let cliToken: string;
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    installedApplication = await setupApplicationWithResources({
      name: 'Installed Application',
    });

    cliToken = await loginAsTwentyCli();
  }, 120000);

  beforeEach(() => {
    executeSpy = jest
      .spyOn(
        getAppProviderByClassName<LogicFunctionExecutorService>(
          'LogicFunctionExecutorService',
        ),
        'execute',
      )
      .mockResolvedValue({
        data: { ran: true },
        duration: 1,
        billedDurationMs: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.SUCCESS,
      });
  });

  afterEach(() => {
    executeSpy.mockRestore();
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: installedApplication.universalIdentifier,
    });
    await uninstallApplication({
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      expectToFail: false,
    });
  });

  it('should find the registration of the application it develops', async () => {
    const { data } = await findApplicationRegistrationByUniversalIdentifier({
      input: { universalIdentifier: installedApplication.universalIdentifier },
      token: cliToken,
      expectToFail: false,
    });

    expect(data.findApplicationRegistrationByUniversalIdentifier).toMatchObject(
      { id: installedApplication.applicationRegistrationId },
    );
  });

  it('should export the application it develops', async () => {
    const { data } = await exportApplication({
      universalIdentifier: installedApplication.universalIdentifier,
      token: cliToken,
      expectToFail: false,
    });

    expect(data.exportApplication.application.universalIdentifier).toBe(
      installedApplication.universalIdentifier,
    );
  });

  it('should list and run the logic functions of the application it develops', async () => {
    const { data } = await findManyLogicFunctions({
      token: cliToken,
      expectToFail: false,
    });

    expect(data.findManyLogicFunctions.map(({ id }) => id)).toContain(
      installedApplication.logicFunctionId,
    );

    const { errors } = await executeLogicFunction({
      input: { id: installedApplication.logicFunctionId, payload: {} },
      token: cliToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(executeSpy).toHaveBeenCalledTimes(1);
  });

  it('should sync and upload files for the application it develops', async () => {
    const { errors: syncErrors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: installedApplication.universalIdentifier,
        roleId: crypto.randomUUID(),
      }),
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      token: cliToken,
      expectToFail: false,
    });

    expect(syncErrors).toBeUndefined();

    const { data } = await createApplicationFileUploads({
      applicationUniversalIdentifier: installedApplication.universalIdentifier,
      files: [
        {
          fileFolder: 'BuiltLogicFunction',
          filePath: 'dist/handler.mjs',
          size: 32,
        },
      ],
      token: cliToken,
      expectToFail: false,
    });

    expect(data.createApplicationFileUploads.targets).toHaveLength(1);
  });

  it('should install the application it develops', async () => {
    const { data } = await installApplication({
      input: { universalIdentifier: installedApplication.universalIdentifier },
      token: cliToken,
      expectToFail: false,
    });

    expect(data.installApplication.id).toBe(installedApplication.id);
  });

  it('should see the tools of installed applications over MCP', async () => {
    const catalog = await getMcpToolCatalog({ token: cliToken });

    expect(
      catalog[ToolCategory.LOGIC_FUNCTION]?.map(({ name }) => name),
    ).toContain('app_installed_application_handler');
  });
});
