import gql from 'graphql-tag';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { findObjectMetadataIdByName } from 'test/integration/graphql/suites/application-role-intersection/utils/find-object-metadata-id-by-name.util';
import { captureAgentRunExecution } from 'test/integration/graphql/suites/user-session/utils/capture-agent-run-execution.util';
import { captureCodeInterpreterSandboxToken } from 'test/integration/graphql/suites/user-session/utils/capture-code-interpreter-sandbox-token.util';
import { listMcpTools } from 'test/integration/graphql/suites/user-session/utils/list-mcp-tools.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createFileUploadMutation } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  DEFAULT_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type GlobalTestContext = {
  agentId: string;
  agentRoleId: string;
  agentUniversalIdentifier: string;
  applicationRoleId: string;
  applicationToken: string;
  attachmentFileFieldMetadataId: string;
};

const captureSandboxTokenForAgentRun = async ({
  globalTestContext,
  token,
  isAgentPassed = true,
}: {
  globalTestContext: GlobalTestContext;
  token: string;
  isAgentPassed?: boolean;
}): Promise<string> => {
  const sandboxToken = await captureCodeInterpreterSandboxToken({
    authContext: (
      await captureAgentRunExecution({
        agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
        token,
      })
    ).executionContext.authContext,
    roleId: globalTestContext.agentRoleId,
    rolePermissionConfig: {
      intersectionOf: { agentRoleId: globalTestContext.agentRoleId },
    },
    agentId: isAgentPassed ? globalTestContext.agentId : undefined,
  });

  if (!isDefined(sandboxToken)) {
    throw new Error('Expected the sandbox to receive a token');
  }

  return sandboxToken;
};

const canFindRecordsThroughMcp = async ({
  token,
  toolName,
}: {
  token: string;
  toolName: string;
}): Promise<boolean> => {
  const result = await callMcpTool({
    toolName: 'execute_tool',
    toolArguments: { toolName, arguments: { select: ['id'], limit: 1 } },
    token,
  });

  return !result.isError && JSON.parse(result.content[0].text).success === true;
};

const createAttachmentFileUpload = ({
  globalTestContext,
  token,
}: {
  globalTestContext: GlobalTestContext;
  token: string;
}) =>
  makeMetadataApiRequest(
    {
      query: createFileUploadMutation,
      variables: {
        filename: 'agent-role-restriction.txt',
        size: 10,
        fileFolder: 'FilesField',
        fieldMetadataId: globalTestContext.attachmentFileFieldMetadataId,
      },
    },
    token,
  );

const findRecordsThroughGraphql = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  token,
}: {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  token: string;
}) =>
  makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      first: 1,
    }),
    token,
  );

// The application and the member can read people and the application can upload files; the agent's role only reads companies
describe('Code interpreter sandbox token beyond the agent role should be refused', () => {
  let application: ApplicationWithResources;
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Agent Role Restriction Probe',
      canReadAndUpdateAllObjectRecords: true,
      permissionFlagUniversalIdentifiers: [
        ...DEFAULT_PERMISSION_FLAG_UNIVERSAL_IDENTIFIERS,
        SystemPermissionFlag.UPLOAD_FILE,
      ],
    });

    const [{ universalIdentifier: agentUniversalIdentifier }] =
      await globalThis.testDataSource.query(
        `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
        [application.agentId],
      );

    const [{ defaultRoleId: applicationRoleId }] =
      await globalThis.testDataSource.query(
        `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
        [application.id],
      );

    const { data } = await createOneRole({
      input: {
        label: 'Agent role restriction probe',
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToAgents: true,
      },
      expectToFail: false,
    });

    const agentRoleId = data.createOneRole.id;

    await upsertObjectPermissions({
      input: {
        roleId: agentRoleId,
        objectPermissions: [
          {
            objectMetadataId: await findObjectMetadataIdByName('company'),
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
      expectToFail: false,
    });

    const assignResponse = await makeMetadataApiRequest({
      query: gql`
        mutation AssignRoleToAgent($agentId: UUID!, $roleId: UUID!) {
          assignRoleToAgent(agentId: $agentId, roleId: $roleId)
        }
      `,
      variables: { agentId: application.agentId, roleId: agentRoleId },
    });

    expect(assignResponse.body.errors).toBeUndefined();

    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });

    const [{ id: attachmentFileFieldMetadataId }] =
      await globalThis.testDataSource.query(
        `SELECT "fieldMetadata".id FROM core."fieldMetadata"
          JOIN core."objectMetadata" ON "objectMetadata".id = "fieldMetadata"."objectMetadataId"
          WHERE "objectMetadata"."nameSingular" = 'attachment'
            AND "fieldMetadata".name = 'file'
            AND "fieldMetadata"."workspaceId" = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    globalTestContext = {
      agentId: application.agentId,
      agentRoleId,
      agentUniversalIdentifier,
      applicationRoleId,
      applicationToken: applicationAccessToken.token,
      attachmentFileFieldMetadataId,
    };
  }, 120000);

  afterAll(async () => {
    if (isDefined(application)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }

    if (isDefined(globalTestContext)) {
      await deleteOneRole({
        input: { idToDelete: globalTestContext.agentRoleId },
        expectToFail: false,
      });
    }
  });

  it('should let a member run read people from the sandbox when no agent restricts it', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      isAgentPassed: false,
    });

    expect(
      await canFindRecordsThroughMcp({
        token: sandboxToken,
        toolName: 'find_many_people',
      }),
    ).toBe(true);
  });

  it('should refuse a member run people through MCP when the agent role denies them', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(
      await canFindRecordsThroughMcp({
        token: sandboxToken,
        toolName: 'find_many_people',
      }),
    ).toBe(false);
    expect(
      await canFindRecordsThroughMcp({
        token: sandboxToken,
        toolName: 'find_many_companies',
      }),
    ).toBe(true);
  });

  it('should refuse a member run people through GraphQL when the agent role denies them', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const [peopleResponse, companiesResponse] = await Promise.all([
      findRecordsThroughGraphql({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        token: sandboxToken,
      }),
      findRecordsThroughGraphql({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        token: sandboxToken,
      }),
    ]);

    expect(peopleResponse.body.errors).toBeDefined();
    expect(companiesResponse.body.errors).toBeUndefined();
  });

  it('should list and run MCP tools within the agent role from the application own run', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: globalTestContext.applicationToken,
    });

    const { status, body } = await listMcpTools({ token: sandboxToken });

    expect(status).toBe(200);
    expect(body.error).toBeUndefined();
    expect(body.result.tools.length).toBeGreaterThan(0);

    expect(
      await canFindRecordsThroughMcp({
        token: sandboxToken,
        toolName: 'find_many_companies',
      }),
    ).toBe(true);
    expect(
      await canFindRecordsThroughMcp({
        token: sandboxToken,
        toolName: 'find_many_people',
      }),
    ).toBe(false);
  });

  it('should let the application own run upload a file when no agent restricts it', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: globalTestContext.applicationToken,
      isAgentPassed: false,
    });

    const response = await createAttachmentFileUpload({
      globalTestContext,
      token: sandboxToken,
    });

    expect(response.body.errors).toBeUndefined();
  });

  it('should refuse a file upload from the application own run when the agent role lacks the permission', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: globalTestContext.applicationToken,
    });

    const response = await createAttachmentFileUpload({
      globalTestContext,
      token: sandboxToken,
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.FORBIDDEN,
    );
  });
});
