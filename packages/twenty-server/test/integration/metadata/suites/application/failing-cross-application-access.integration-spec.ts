import crypto from 'crypto';
import { findApplicationRegistrationVariables } from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';
import { findApplicationRegistrationByUniversalIdentifier } from 'test/integration/metadata/suites/application-registration/utils/find-application-registration-by-universal-identifier.util';
import { findApplicationRegistrationStats } from 'test/integration/metadata/suites/application-registration/utils/find-application-registration-stats.util';
import { findApplicationRegistrationTarballUrl } from 'test/integration/metadata/suites/application-registration/utils/find-application-registration-tarball-url.util';
import { findManyApplicationRegistrations } from 'test/integration/metadata/suites/application-registration/utils/find-many-application-registrations.util';
import { findOneApplicationRegistration } from 'test/integration/metadata/suites/application-registration/utils/find-one-application-registration.util';
import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { findOneAgent } from 'test/integration/metadata/suites/agent/utils/find-one-agent.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { completeApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads.util';
import { createApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { installMarketplaceApp } from 'test/integration/metadata/suites/application/utils/install-marketplace-app.util';
import { runApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-application-health-check.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { triggerInstallApplicationJob } from 'test/integration/metadata/suites/application/utils/trigger-install-application-job.util';
import { triggerUninstallApplicationJob } from 'test/integration/metadata/suites/application/utils/trigger-uninstall-application-job.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateApplication } from 'test/integration/metadata/suites/application/utils/update-application.util';
import { upgradeApplication } from 'test/integration/metadata/suites/application/utils/upgrade-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { findApplicationConnectedAccounts } from 'test/integration/metadata/suites/connected-account/utils/find-application-connected-accounts.util';
import { findApplicationConnectionProviders } from 'test/integration/metadata/suites/connection-provider/utils/find-application-connection-providers.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { findManyLogicFunctions } from 'test/integration/metadata/suites/logic-function/utils/find-many-logic-functions.util';
import { findOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/find-one-logic-function.util';
import { getLogicFunctionSourceCode } from 'test/integration/metadata/suites/logic-function/utils/get-logic-function-source-code.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { findSkill } from 'test/integration/metadata/suites/skill/utils/find-skill.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  callingApplication: ApplicationWithResources;
  otherApplication: ApplicationWithResources;
  userBoundToken: string;
  unboundToken: string;
};

type TokenTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type EndpointTestContext = {
  requestOtherApplication: (params: {
    otherApplication: ApplicationWithResources;
    token: string;
  }) => Promise<{ errors: BaseGraphQLError[] }>;
};

type ListEndpointTestContext = {
  listApplicationIds: (token: string) => Promise<(string | undefined)[]>;
  expectedApplicationIds: (globalContext: GlobalTestContext) => string[];
};

const tokenTestCases: EachTestingContext<TokenTestContext>[] = [
  {
    title: 'with a user-bound application token',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token without user binding',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

const singleTargetEndpointTestCases: EachTestingContext<EndpointTestContext>[] =
  [
    {
      title: 'findApplicationRegistrationByUniversalIdentifier',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findApplicationRegistrationByUniversalIdentifier({
            input: {
              universalIdentifier: otherApplication.universalIdentifier,
            },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'findOneApplicationRegistration',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findOneApplicationRegistration({
            input: { id: otherApplication.applicationRegistrationId },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'findApplicationRegistrationStats',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findApplicationRegistrationStats({
            input: { id: otherApplication.applicationRegistrationId },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'findApplicationRegistrationVariables',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findApplicationRegistrationVariables({
            applicationRegistrationId:
              otherApplication.applicationRegistrationId,
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'applicationRegistrationTarballUrl',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findApplicationRegistrationTarballUrl({
            input: { id: otherApplication.applicationRegistrationId },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'exportApplication',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          exportApplication({
            universalIdentifier: otherApplication.universalIdentifier,
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'findOneLogicFunction',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findOneLogicFunction({
            input: { id: otherApplication.logicFunctionId },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'getLogicFunctionSourceCode',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          getLogicFunctionSourceCode({
            input: { id: otherApplication.logicFunctionId },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'updateOneLogicFunction',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          updateLogicFunctionSource({
            input: {
              id: otherApplication.logicFunctionId,
              update: {
                sourceHandlerCode: 'export const handler = () => "pwned";',
              },
            },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'runApplicationHealthCheck',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          runApplicationHealthCheck({
            input: { applicationId: otherApplication.id },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'applicationConnectionProviders',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findApplicationConnectionProviders({
            input: { applicationId: otherApplication.id },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'applicationConnectedAccounts',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findApplicationConnectedAccounts({
            input: { applicationId: otherApplication.id },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'findOneAgent',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findOneAgent({
            input: { id: otherApplication.agentId },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'skill',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          findSkill({
            input: { id: otherApplication.skillId },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'syncApplication',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          syncApplication({
            manifest: buildBaseManifest({
              appId: otherApplication.universalIdentifier,
              roleId: crypto.randomUUID(),
            }),
            dryRun: true,
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'uploadApplicationFile',
      context: {
        requestOtherApplication: async ({ otherApplication, token }) => {
          jest.useRealTimers();

          try {
            return await uploadApplicationFile({
              applicationUniversalIdentifier:
                otherApplication.universalIdentifier,
              fileFolder: 'BuiltLogicFunction',
              filePath: 'dist/handler.mjs',
              fileBuffer: Buffer.from('export const handler = () => {};'),
              filename: 'handler.mjs',
              contentType: 'application/javascript',
              token,
              expectToFail: true,
            });
          } finally {
            jest.useFakeTimers();
          }
        },
      },
    },
    {
      title: 'createApplicationFileUploads',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          createApplicationFileUploads({
            applicationUniversalIdentifier:
              otherApplication.universalIdentifier,
            files: [
              {
                fileFolder: 'BuiltLogicFunction',
                filePath: 'dist/handler.mjs',
                size: 32,
              },
            ],
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'completeApplicationFileUploads',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          completeApplicationFileUploads({
            applicationUniversalIdentifier:
              otherApplication.universalIdentifier,
            fileIds: [crypto.randomUUID()],
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'installApplication',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          installApplication({
            input: {
              universalIdentifier: otherApplication.universalIdentifier,
            },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'installMarketplaceApp',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          installMarketplaceApp({
            input: {
              universalIdentifier: otherApplication.universalIdentifier,
            },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'triggerInstallApplicationJob',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          triggerInstallApplicationJob({
            input: {
              universalIdentifier: otherApplication.universalIdentifier,
            },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'uninstallApplication',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          uninstallApplication({
            universalIdentifier: otherApplication.universalIdentifier,
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'triggerUninstallApplicationJob',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          triggerUninstallApplicationJob({
            input: {
              universalIdentifier: otherApplication.universalIdentifier,
            },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'updateApplication',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          updateApplication({
            input: { id: otherApplication.id, autoUpgrade: false },
            token,
            expectToFail: true,
          }),
      },
    },
    {
      title: 'upgradeApplication',
      context: {
        requestOtherApplication: ({ otherApplication, token }) =>
          upgradeApplication({
            input: {
              appRegistrationId: otherApplication.applicationRegistrationId,
              targetVersion: '1.0.0',
            },
            token,
            expectToFail: true,
          }),
      },
    },
  ];

const listEndpointTestCases: EachTestingContext<ListEndpointTestContext>[] = [
  {
    title: 'findManyApplicationRegistrations',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findManyApplicationRegistrations({
          token,
          expectToFail: false,
        });

        return data.findManyApplicationRegistrations.map(({ id }) => id);
      },
      expectedApplicationIds: ({ callingApplication }) => [
        callingApplication.applicationRegistrationId,
      ],
    },
  },
  {
    title: 'findManyLogicFunctions',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findManyLogicFunctions({
          token,
          expectToFail: false,
        });

        return data.findManyLogicFunctions.map(
          ({ applicationId }) => applicationId,
        );
      },
      expectedApplicationIds: ({ callingApplication }) => [
        callingApplication.id,
        callingApplication.id,
      ],
    },
  },
  {
    title: 'frontComponents',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findFrontComponents({
          token,
          expectToFail: false,
        });

        return data.frontComponents.map(({ applicationId }) => applicationId);
      },
      expectedApplicationIds: ({ callingApplication }) => [
        callingApplication.id,
      ],
    },
  },
  {
    title: 'findManyAgents',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findAgents({
          input: undefined,
          token,
          expectToFail: false,
        });

        return data.findManyAgents.map(({ applicationId }) => applicationId);
      },
      expectedApplicationIds: ({ callingApplication }) => [
        callingApplication.id,
      ],
    },
  },
  {
    title: 'skills',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findSkills({
          input: undefined,
          token,
          expectToFail: false,
        });

        return data.skills.map(({ applicationId }) => applicationId);
      },
      expectedApplicationIds: ({ callingApplication }) => [
        callingApplication.id,
      ],
    },
  },
];

describe('Application token access to another application should fail', () => {
  let globalTestContext: GlobalTestContext;
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    const callingApplication = await setupApplicationWithResources({
      name: 'Calling Application',
    });
    const otherApplication = await setupApplicationWithResources({
      name: 'Other Application',
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: callingApplication.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: callingApplication.id,
      }),
    ]);

    globalTestContext = {
      callingApplication,
      otherApplication,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
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
      applicationUniversalIdentifier:
        globalTestContext.callingApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.otherApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(tokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it.each(eachTestingContextFilter(singleTargetEndpointTestCases))(
        'should refuse $title on another application',
        async ({ context }) => {
          const { errors } = await context.requestOtherApplication({
            otherApplication: globalTestContext.otherApplication,
            token: tokenContext.token(globalTestContext),
          });

          expectOneNotInternalServerErrorSnapshot({ errors });
        },
      );

      it('should refuse to run a workflow action of another application', async () => {
        const { errors } = await executeLogicFunction({
          input: {
            id: globalTestContext.otherApplication
              .workflowActionLogicFunctionId,
            payload: {},
          },
          token: tokenContext.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
        expect(executeSpy).not.toHaveBeenCalled();
      });

      it.each(eachTestingContextFilter(listEndpointTestCases))(
        'should only list its own application items from $title',
        async ({ context }) => {
          const applicationIds = await context.listApplicationIds(
            tokenContext.token(globalTestContext),
          );

          expect(applicationIds).toEqual(
            context.expectedApplicationIds(globalTestContext),
          );
        },
      );
    },
  );
});
