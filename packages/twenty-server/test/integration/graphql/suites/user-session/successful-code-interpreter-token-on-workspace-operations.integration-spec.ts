import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { pingMcp } from 'test/integration/graphql/suites/user-session/utils/ping-mcp.util';
import {
  type CodeInterpreterSandboxTokens,
  captureCodeInterpreterSandboxTokens,
} from 'test/integration/graphql/suites/user-session/utils/capture-code-interpreter-sandbox-tokens.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type TestContext = {
  token: (globalContext: CodeInterpreterSandboxTokens) => string;
};

const sandboxTokenTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'for an agent an application runs as Jane',
    context: {
      token: (globalContext) => globalContext.applicationRunAsJaneToken,
    },
  },
  {
    title: 'for Jane running the interpreter directly',
    context: { token: (globalContext) => globalContext.janeDirectRunToken },
  },
];

describe('Workspace operations with a code interpreter sandbox token should succeed', () => {
  let application: ApplicationWithVariable;
  let globalTestContext: CodeInterpreterSandboxTokens;
  const createdCompanyIds: string[] = [];

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Code Interpreter Workspace Probe',
      variableKey: 'CODE_INTERPRETER_WORKSPACE_PROBE',
    });

    globalTestContext = await captureCodeInterpreterSandboxTokens({
      applicationId: application.id,
    });
  }, 120000);

  afterAll(async () => {
    await deleteRecordsByIds('company', createdCompanyIds);

    if (!isDefined(application)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(sandboxTokenTestCases))(
    '$title',
    ({ context }) => {
      it('should authenticate on the MCP endpoint', async () => {
        const { status, body } = await pingMcp({
          token: context.token(globalTestContext),
        });

        expect(status).toBe(200);
        expect(body.error).toBeUndefined();
        expect(body.result).toEqual({});
      });
    },
  );

  it('should run a workspace tool through MCP as Jane from a direct run', async () => {
    const result = await callMcpTool({
      toolName: 'execute_tool',
      toolArguments: {
        toolName: 'find_many_companies',
        arguments: { select: ['id'], limit: 1 },
      },
      token: globalTestContext.janeDirectRunToken,
    });

    expect(result.isError).toBe(false);
    expect(JSON.parse(result.content[0].text).success).toBe(true);
  });

  it('should credit a record created from a direct run to Jane', async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: `
          id
          createdBy {
            source
            workspaceMemberId
          }
        `,
        data: { name: 'Code Interpreter Sandbox Company' },
      }),
      globalTestContext.janeDirectRunToken,
    );

    expect(response.body.errors).toBeUndefined();

    const company = response.body.data.createCompany;

    createdCompanyIds.push(company.id);

    expect(company.createdBy.workspaceMemberId).toBe(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    );
  });
});
