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
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { runApplicationHealthCheck } from 'test/integration/metadata/suites/application/utils/run-application-health-check.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateApplication } from 'test/integration/metadata/suites/application/utils/update-application.util';
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
import { findSkill } from 'test/integration/metadata/suites/skill/utils/find-skill.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  application: ApplicationWithResources;
  otherApplication: ApplicationWithResources;
  userBoundToken: string;
  unboundToken: string;
};

type CallerTestContext = {
  token: (globalContext: GlobalTestContext) => string | undefined;
  targetApplication: (
    globalContext: GlobalTestContext,
  ) => ApplicationWithResources;
  hasUser: boolean;
};

type EndpointTestContext = {
  requiresUser?: boolean;
  expectToReach: (params: {
    application: ApplicationWithResources;
    token: string | undefined;
  }) => Promise<void>;
};

const callerTestCases: EachTestingContext<CallerTestContext>[] = [
  {
    title: 'a user-bound application token on its own application',
    context: {
      token: (globalContext) => globalContext.userBoundToken,
      targetApplication: (globalContext) => globalContext.application,
      hasUser: true,
    },
  },
  {
    title: 'an application token without user binding on its own application',
    context: {
      token: (globalContext) => globalContext.unboundToken,
      targetApplication: (globalContext) => globalContext.application,
      hasUser: false,
    },
  },
  {
    title: 'an admin session on an installed application',
    context: {
      token: () => undefined,
      targetApplication: (globalContext) => globalContext.otherApplication,
      hasUser: true,
    },
  },
];

const endpointTestCases: EachTestingContext<EndpointTestContext>[] = [
  {
    title: 'findApplicationRegistrationByUniversalIdentifier',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findApplicationRegistrationByUniversalIdentifier(
          {
            input: { universalIdentifier: application.universalIdentifier },
            token,
            expectToFail: false,
          },
        );

        expect(
          data.findApplicationRegistrationByUniversalIdentifier,
        ).toMatchObject({
          id: application.applicationRegistrationId,
          ownerWorkspaceId: SEED_APPLE_WORKSPACE_ID,
        });
      },
    },
  },
  {
    title: 'findOneApplicationRegistration',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findOneApplicationRegistration({
          input: { id: application.applicationRegistrationId },
          token,
          expectToFail: false,
        });

        expect(data.findOneApplicationRegistration.id).toBe(
          application.applicationRegistrationId,
        );
      },
    },
  },
  {
    title: 'findApplicationRegistrationStats',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findApplicationRegistrationStats({
          input: { id: application.applicationRegistrationId },
          token,
          expectToFail: false,
        });

        expect(data.findApplicationRegistrationStats).toMatchObject({
          activeInstalls: expect.any(Number),
        });
      },
    },
  },
  {
    title: 'findApplicationRegistrationVariables',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findApplicationRegistrationVariables({
          applicationRegistrationId: application.applicationRegistrationId,
          token,
          expectToFail: false,
        });

        expect(data.findApplicationRegistrationVariables).toEqual([]);
      },
    },
  },
  {
    title: 'applicationRegistrationTarballUrl',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findApplicationRegistrationTarballUrl({
          input: { id: application.applicationRegistrationId },
          token,
          expectToFail: false,
        });

        // Development registrations have no tarball to sign
        expect(data.applicationRegistrationTarballUrl).toBeNull();
      },
    },
  },
  {
    title: 'exportApplication',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await exportApplication({
          universalIdentifier: application.universalIdentifier,
          token,
          expectToFail: false,
        });

        expect(data.exportApplication.application.universalIdentifier).toBe(
          application.universalIdentifier,
        );
      },
    },
  },
  {
    title: 'findOneLogicFunction',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findOneLogicFunction({
          input: { id: application.logicFunctionId },
          token,
          expectToFail: false,
        });

        expect(data.findOneLogicFunction).toMatchObject({
          id: application.logicFunctionId,
          applicationId: application.id,
        });
      },
    },
  },
  {
    title: 'executeOneLogicFunction',
    context: {
      requiresUser: true,
      expectToReach: async ({ application, token }) => {
        const { data } = await executeLogicFunction({
          input: { id: application.workflowActionLogicFunctionId, payload: {} },
          token,
          expectToFail: false,
        });

        expect(data.executeOneLogicFunction.data).toEqual({ ran: true });
      },
    },
  },
  {
    title: 'runApplicationHealthCheck',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await runApplicationHealthCheck({
          input: { applicationId: application.id },
          token,
          expectToFail: false,
        });

        expect(data.runApplicationHealthCheck).toBeNull();
      },
    },
  },
  {
    title: 'applicationConnectionProviders',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findApplicationConnectionProviders({
          input: { applicationId: application.id },
          token,
          expectToFail: false,
        });

        expect(
          data.applicationConnectionProviders.map(({ name }) => name),
        ).toEqual([application.connectionProviderName]);
      },
    },
  },
  {
    title: 'applicationConnectedAccounts',
    context: {
      requiresUser: true,
      expectToReach: async ({ application, token }) => {
        const { data } = await findApplicationConnectedAccounts({
          input: { applicationId: application.id },
          token,
          expectToFail: false,
        });

        expect(data.applicationConnectedAccounts).toEqual([]);
      },
    },
  },
  {
    title: 'findOneAgent',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findOneAgent({
          input: { id: application.agentId },
          token,
          expectToFail: false,
        });

        expect(data.findOneAgent.id).toBe(application.agentId);
      },
    },
  },
  {
    title: 'skill',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await findSkill({
          input: { id: application.skillId },
          token,
          expectToFail: false,
        });

        expect(data.skill.id).toBe(application.skillId);
      },
    },
  },
  {
    title: 'syncApplication',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await syncApplication({
          manifest: buildBaseManifest({
            appId: application.universalIdentifier,
            roleId: crypto.randomUUID(),
          }),
          dryRun: true,
          inferDeletionFromMissingEntities: false,
          token,
          expectToFail: false,
        });

        expect(data.syncApplication.applicationUniversalIdentifier).toBe(
          application.universalIdentifier,
        );
      },
    },
  },
  {
    title: 'installApplication',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await installApplication({
          input: { universalIdentifier: application.universalIdentifier },
          token,
          expectToFail: false,
        });

        expect(data.installApplication.id).toBe(application.id);
      },
    },
  },
  {
    title: 'updateApplication',
    context: {
      expectToReach: async ({ application, token }) => {
        const { data } = await updateApplication({
          input: { id: application.id, autoUpgrade: false },
          token,
          expectToFail: false,
        });

        expect(data.updateApplication.id).toBe(application.id);
      },
    },
  },
];

describe('Application resource access should succeed', () => {
  let globalTestContext: GlobalTestContext;
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    const application = await setupApplicationWithResources({
      name: 'Own Application',
    });
    const otherApplication = await setupApplicationWithResources({
      name: 'Installed Application',
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      application,
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
        globalTestContext.application.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.otherApplication.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(callerTestCases))(
    'from $title',
    ({ context: callerContext }) => {
      it.each(
        eachTestingContextFilter(endpointTestCases).filter(
          ({ context }) => callerContext.hasUser || !context.requiresUser,
        ),
      )('should reach $title', async ({ context }) => {
        await context.expectToReach({
          application: callerContext.targetApplication(globalTestContext),
          token: callerContext.token(globalTestContext),
        });
      });
    },
  );

  it('should list every application items from an admin session', async () => {
    const { application, otherApplication } = globalTestContext;
    const applicationIds = [application.id, otherApplication.id];

    const [
      { data: registrationsData },
      { data: logicFunctionsData },
      { data: frontComponentsData },
      { data: agentsData },
      { data: skillsData },
    ] = await Promise.all([
      findManyApplicationRegistrations({ expectToFail: false }),
      findManyLogicFunctions({ expectToFail: false }),
      findFrontComponents({ expectToFail: false }),
      findAgents({ input: undefined, expectToFail: false }),
      findSkills({ input: undefined, expectToFail: false }),
    ]);

    expect(
      registrationsData.findManyApplicationRegistrations.map(({ id }) => id),
    ).toEqual(
      expect.arrayContaining([
        application.applicationRegistrationId,
        otherApplication.applicationRegistrationId,
      ]),
    );
    expect(
      logicFunctionsData.findManyLogicFunctions.map(({ id }) => id),
    ).toEqual(
      expect.arrayContaining([
        application.logicFunctionId,
        otherApplication.logicFunctionId,
      ]),
    );
    expect(
      frontComponentsData.frontComponents.map(
        ({ applicationId }) => applicationId,
      ),
    ).toEqual(expect.arrayContaining(applicationIds));
    expect(
      agentsData.findManyAgents.map(({ applicationId }) => applicationId),
    ).toEqual(expect.arrayContaining(applicationIds));
    expect(skillsData.skills.map(({ applicationId }) => applicationId)).toEqual(
      expect.arrayContaining(applicationIds),
    );
  });
});
