import { randomUUID } from 'node:crypto';

import { gql } from 'graphql-tag';
import request from 'supertest';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FileFolder } from 'twenty-shared/types';

/**
 * End-to-end coverage for the create_file_upload / complete_file_upload action
 * tools over the MCP JSON-RPC surface.
 *
 * The MCP server never lists action tools directly: tools/list only exposes the
 * meta-tools, so both upload tools are reached through execute_tool and
 * discovered through get_tool_catalog. Every call below therefore goes through
 * the same path a real MCP client would take.
 */

const baseUrl = `http://localhost:${APP_PORT}`;

// A real 1x1 PNG: the completion step sniffs magic bytes, so only actual image
// bytes prove the recorded mimeType comes from the content rather than the
// declared extension.
const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const ONE_GIGABYTE = 1024 * 1024 * 1024;

type McpToolCallResult = {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type ToolPayload<TResult> = {
  success: boolean;
  message: string;
  result?: TResult;
  error?: string;
};

type CreateFileUploadResult = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

type CompleteFileUploadResult = {
  fileId: string;
  path: string;
  mimeType: string;
  size: number;
};

type FileRow = {
  id: string;
  path: string;
  mimeType: string;
  size: string;
  status: string;
};

const createdApiKeyIds: string[] = [];
const createdFileIds: string[] = [];
const createdCompanyIds: string[] = [];
const createdAttachmentIds: string[] = [];

const postMcp = (body: Record<string, unknown>, bearer: string) =>
  request(baseUrl)
    .post('/mcp')
    .set('Authorization', `Bearer ${bearer}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify(body));

const callMcpTool = async (
  bearer: string,
  name: string,
  args: Record<string, unknown>,
): Promise<McpToolCallResult> => {
  const id = `call-${randomUUID()}`;
  const response = await postMcp(
    {
      jsonrpc: '2.0',
      method: 'tools/call',
      id,
      params: { name, arguments: args },
    },
    bearer,
  ).expect(200);

  expect(response.body.error).toBeUndefined();

  return response.body.result as McpToolCallResult;
};

const executeTool = async <TResult>(
  bearer: string,
  toolName: string,
  toolArguments: Record<string, unknown>,
): Promise<ToolPayload<TResult>> => {
  const result = await callMcpTool(bearer, 'execute_tool', {
    toolName,
    arguments: toolArguments,
  });

  expect(result.content?.[0]?.type).toBe('text');

  return JSON.parse(
    result.content?.[0]?.text as string,
  ) as ToolPayload<TResult>;
};

const getInstructions = async (bearer: string): Promise<string> => {
  const response = await postMcp(
    { jsonrpc: '2.0', method: 'initialize', id: `init-${randomUUID()}` },
    bearer,
  ).expect(200);

  return response.body.result.instructions as string;
};

const getToolCatalog = async (
  bearer: string,
): Promise<Record<string, Array<{ name: string; description: string }>>> => {
  const result = await callMcpTool(bearer, 'get_tool_catalog', {});

  expect(result.isError).toBe(false);

  return JSON.parse(result.content?.[0]?.text as string).catalog;
};

// Integration tests run on the local storage driver, so the upload url targets
// the server's own streaming endpoint: replay it against the test app.
const putBytesToUploadUrl = async (
  uploadUrl: string,
  contentType: string,
  content: Buffer,
) => {
  const { pathname, search } = new URL(uploadUrl);

  return request(global.app.getHttpServer())
    .put(`${pathname}${search}`)
    .set('Content-Type', contentType)
    .send(content);
};

const readFileRow = async (fileId: string): Promise<FileRow | undefined> => {
  const rows = await global.testDataSource.query(
    'SELECT id, path, "mimeType", size, status FROM core."file" WHERE id = $1',
    [fileId],
  );

  return rows[0];
};

const createApiKeyToken = async (
  roleId: string,
  label: string,
): Promise<string> => {
  const createResponse = await makeMetadataAPIRequest({
    query: gql`
      mutation CreateApiKey($input: CreateApiKeyInput!) {
        createApiKey(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        name: `MCP file upload ${label} key`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        roleId,
      },
    },
  });

  const apiKeyId = createResponse.body.data?.createApiKey?.id;

  jestExpectToBeDefined(apiKeyId);
  createdApiKeyIds.push(apiKeyId);

  const tokenResponse = await generateApiKeyToken({
    apiKeyId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  const token = tokenResponse.body.data?.generateApiKeyToken?.token;

  jestExpectToBeDefined(token);

  return token;
};

const uploadAgentChatFile = async (
  bearer: string,
  filename: string,
  content: Buffer,
): Promise<{
  created: CreateFileUploadResult;
  completed: CompleteFileUploadResult;
}> => {
  const createPayload = await executeTool<CreateFileUploadResult>(
    bearer,
    'create_file_upload',
    { filename, size: content.length },
  );

  expect(createPayload.success).toBe(true);
  jestExpectToBeDefined(createPayload.result);

  const created = createPayload.result;

  createdFileIds.push(created.fileId);

  const putResponse = await putBytesToUploadUrl(
    created.uploadUrl,
    created.contentType,
    content,
  );

  expect(putResponse.status).toBe(204);

  const completePayload = await executeTool<CompleteFileUploadResult>(
    bearer,
    'complete_file_upload',
    { fileId: created.fileId },
  );

  expect(completePayload.success).toBe(true);
  jestExpectToBeDefined(completePayload.result);

  return { created, completed: completePayload.result };
};

describe('MCP file upload tools (integration)', () => {
  let uploaderToken: string;
  let restrictedToken: string;
  let restrictedRoleId: string;

  beforeAll(async () => {
    const rolesResponse = await makeMetadataAPIRequest({
      query: gql`
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    });

    const adminRoleId = rolesResponse.body.data?.getRoles?.find(
      (role: { label: string }) => role.label === 'Admin',
    )?.id;

    jestExpectToBeDefined(adminRoleId);

    // canAccessAllTools short-circuits every tool permission flag, so a role
    // that does not set it is the only way to observe UPLOAD_FILE gating.
    const { data: restrictedRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'MCP File Upload Restricted Role',
        description: 'API-key role without the UPLOAD_FILE permission flag',
        icon: 'IconKey',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
      },
    });

    restrictedRoleId = restrictedRoleData?.createOneRole?.id as string;
    jestExpectToBeDefined(restrictedRoleId);

    uploaderToken = await createApiKeyToken(adminRoleId, 'uploader');
    restrictedToken = await createApiKeyToken(restrictedRoleId, 'restricted');
  });

  afterAll(async () => {
    await deleteRecordsByIds('attachment', createdAttachmentIds);
    await deleteRecordsByIds('company', createdCompanyIds);

    for (const fileId of createdFileIds) {
      await global.testDataSource
        .query('DELETE FROM core."file" WHERE id = $1', [fileId])
        .catch(() => {});
    }

    for (const apiKeyId of createdApiKeyIds) {
      await global.testDataSource
        .query('DELETE FROM core."apiKey" WHERE id = $1', [apiKeyId])
        .catch(() => {});
    }

    if (restrictedRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: restrictedRoleId },
      });
    }
  });

  describe('MCP surface', () => {
    it('should not list the upload tools directly and should refuse a tools/call by name', async () => {
      const listResponse = await postMcp(
        { jsonrpc: '2.0', method: 'tools/list', id: 'list-1' },
        uploaderToken,
      ).expect(200);

      const listedToolNames = (
        listResponse.body.result.tools as Array<{ name: string }>
      ).map((tool) => tool.name);

      expect(listedToolNames).not.toContain('create_file_upload');
      expect(listedToolNames).not.toContain('complete_file_upload');
      expect(listedToolNames).toContain('execute_tool');

      const directCall = await postMcp(
        {
          jsonrpc: '2.0',
          method: 'tools/call',
          id: 'direct-1',
          params: {
            name: 'create_file_upload',
            arguments: { filename: 'direct.png', size: PNG_BYTES.length },
          },
        },
        uploaderToken,
      ).expect(200);

      expect(directCall.body.error?.message).toBe(
        'Unknown tool: create_file_upload',
      );
    });

    it('should teach the upload recipe in the initialize instructions only when the tools are reachable', async () => {
      const uploaderInstructions = await getInstructions(uploaderToken);

      expect(uploaderInstructions).toContain(
        'create_file_upload | complete_file_upload',
      );
      expect(uploaderInstructions).toContain('To attach a file');

      const restrictedInstructions = await getInstructions(restrictedToken);

      expect(restrictedInstructions).not.toContain('create_file_upload');
      expect(restrictedInstructions).not.toContain('complete_file_upload');
      expect(restrictedInstructions).not.toContain('To attach a file');
    });
  });

  describe('happy path', () => {
    it('should create an upload url, accept the bytes and complete the upload', async () => {
      const createPayload = await executeTool<CreateFileUploadResult>(
        uploaderToken,
        'create_file_upload',
        { filename: 'mcp-happy-path.png', size: PNG_BYTES.length },
      );

      expect(createPayload.success).toBe(true);
      jestExpectToBeDefined(createPayload.result);

      const created = createPayload.result;

      createdFileIds.push(created.fileId);

      expect(created.uploadUrl).toContain(
        `/file-upload/${created.fileId}?token=`,
      );
      expect(created.contentType).toBe('application/octet-stream');
      expect(new Date(created.expiresAt).getTime()).toBeGreaterThan(Date.now());

      const pendingRow = await readFileRow(created.fileId);

      jestExpectToBeDefined(pendingRow);
      expect(pendingRow.status).toBe('PENDING');
      expect(pendingRow.path.startsWith(`${FileFolder.AgentChat}/`)).toBe(true);

      const putResponse = await putBytesToUploadUrl(
        created.uploadUrl,
        created.contentType,
        PNG_BYTES,
      );

      expect(putResponse.status).toBe(204);

      const completePayload = await executeTool<CompleteFileUploadResult>(
        uploaderToken,
        'complete_file_upload',
        { fileId: created.fileId },
      );

      expect(completePayload.success).toBe(true);
      jestExpectToBeDefined(completePayload.result);

      const completed = completePayload.result;

      expect(completed.fileId).toBe(created.fileId);
      expect(completed.path.startsWith(`${FileFolder.AgentChat}/`)).toBe(true);
      // The declared extension is a client claim; the recorded type has to come
      // from the bytes that were actually stored.
      expect(completed.mimeType).toBe('image/png');
      expect(completed.mimeType).not.toBe('application/octet-stream');
      expect(completed.size).toBe(PNG_BYTES.length);

      const uploadedRow = await readFileRow(created.fileId);

      jestExpectToBeDefined(uploadedRow);
      expect(uploadedRow.status).toBe('UPLOADED');
      expect(uploadedRow.mimeType).toBe('image/png');
      expect(Number(uploadedRow.size)).toBe(PNG_BYTES.length);
    });
  });

  describe('attaching an uploaded file to a record', () => {
    it('should copy the agent-chat file into the FILES field partition under a new file id', async () => {
      const { created, completed } = await uploadAgentChatFile(
        uploaderToken,
        'mcp-attachment.png',
        PNG_BYTES,
      );

      const companyPayload = await executeTool<{ id: string }>(
        uploaderToken,
        'create_one_company',
        { name: `MCP upload target ${randomUUID()}` },
      );

      expect(companyPayload.success).toBe(true);
      jestExpectToBeDefined(companyPayload.result);

      const companyId = companyPayload.result.id;

      createdCompanyIds.push(companyId);

      const attachmentPayload = await executeTool<{ id: string }>(
        uploaderToken,
        'create_one_attachment',
        {
          name: 'mcp-attachment.png',
          file: [{ fileId: created.fileId, label: 'mcp-attachment.png' }],
          targetCompanyId: companyId,
        },
      );

      expect(attachmentPayload.success).toBe(true);
      jestExpectToBeDefined(attachmentPayload.result);

      // The copy is reported back to the caller so a model can tell which file
      // id actually landed on the record.
      expect(attachmentPayload.message).toContain(
        `Uploaded file ${created.fileId} was stored on file as file `,
      );

      const attachmentId = attachmentPayload.result.id;

      createdAttachmentIds.push(attachmentId);

      const [attachmentRow] = await global.testDataSource.query(
        `SELECT file FROM "workspace_1wgvd1injqtife6y4rvfbu3h5"."attachment" WHERE id = $1`,
        [attachmentId],
      );

      jestExpectToBeDefined(attachmentRow);

      const storedFileValue = attachmentRow.file as Array<{ fileId: string }>;

      expect(storedFileValue).toHaveLength(1);

      const attachedFileId = storedFileValue[0].fileId;

      // The agent-chat upload is a staging copy: attaching it must produce a
      // distinct file living under the FILES field partition.
      expect(attachedFileId).not.toBe(created.fileId);

      createdFileIds.push(attachedFileId);

      const attachedFileRow = await readFileRow(attachedFileId);

      jestExpectToBeDefined(attachedFileRow);
      expect(attachedFileRow.path.startsWith(`${FileFolder.FilesField}/`)).toBe(
        true,
      );
      expect(attachedFileRow.mimeType).toBe(completed.mimeType);
      expect(Number(attachedFileRow.size)).toBe(PNG_BYTES.length);
      expect(attachedFileRow.status).toBe('UPLOADED');

      // The source file is left untouched so the same upload can be attached
      // more than once.
      const sourceFileRow = await readFileRow(created.fileId);

      jestExpectToBeDefined(sourceFileRow);
      expect(sourceFileRow.path.startsWith(`${FileFolder.AgentChat}/`)).toBe(
        true,
      );
    });
  });

  describe('size validation', () => {
    it('should reject a zero byte upload as a structured tool failure', async () => {
      const payload = await executeTool<CreateFileUploadResult>(
        uploaderToken,
        'create_file_upload',
        { filename: 'empty.png', size: 0 },
      );

      expect(payload.success).toBe(false);
      expect(payload.message).toBe('Failed to create file upload');
      expect(payload.error).toContain('Invalid file size 0');
    });

    it('should reject a size above the direct upload maximum as a structured tool failure', async () => {
      const payload = await executeTool<CreateFileUploadResult>(
        uploaderToken,
        'create_file_upload',
        { filename: 'huge.bin', size: 2 * ONE_GIGABYTE },
      );

      expect(payload.success).toBe(false);
      expect(payload.message).toBe('Failed to create file upload');
      expect(payload.error).toContain(`max ${ONE_GIGABYTE} bytes`);
    });

    it('should surface both rejections as isError without throwing out of the tool', async () => {
      const result = await callMcpTool(uploaderToken, 'execute_tool', {
        toolName: 'create_file_upload',
        arguments: { filename: 'empty.png', size: 0 },
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('completing an upload whose bytes never reached storage', () => {
    it('should refuse to complete and leave the file pending', async () => {
      const createPayload = await executeTool<CreateFileUploadResult>(
        uploaderToken,
        'create_file_upload',
        { filename: 'never-uploaded.png', size: PNG_BYTES.length },
      );

      expect(createPayload.success).toBe(true);
      jestExpectToBeDefined(createPayload.result);

      const created = createPayload.result;

      createdFileIds.push(created.fileId);

      const completePayload = await executeTool<CompleteFileUploadResult>(
        uploaderToken,
        'complete_file_upload',
        { fileId: created.fileId },
      );

      expect(completePayload.success).toBe(false);
      expect(completePayload.message).toBe('Failed to complete file upload');
      expect(completePayload.error).toContain('has not been uploaded');

      const fileRow = await readFileRow(created.fileId);

      jestExpectToBeDefined(fileRow);
      expect(fileRow.status).toBe('PENDING');
    });

    it('should report an unknown file id as a structured tool failure', async () => {
      const payload = await executeTool<CompleteFileUploadResult>(
        uploaderToken,
        'complete_file_upload',
        { fileId: randomUUID() },
      );

      expect(payload.success).toBe(false);
      expect(payload.error).toContain('File not found');
    });
  });

  describe('UPLOAD_FILE permission gating', () => {
    it('should advertise both upload tools to a role that can access all tools', async () => {
      const catalog = await getToolCatalog(uploaderToken);
      const toolNames = Object.values(catalog)
        .flat()
        .map((tool) => tool.name);

      expect(toolNames).toEqual(
        expect.arrayContaining(['create_file_upload', 'complete_file_upload']),
      );
    });

    it('should hide both upload tools from a role without the UPLOAD_FILE flag', async () => {
      const catalog = await getToolCatalog(restrictedToken);
      const toolNames = Object.values(catalog)
        .flat()
        .map((tool) => tool.name);

      expect(toolNames).not.toContain('create_file_upload');
      expect(toolNames).not.toContain('complete_file_upload');

      // The restricted role still sees record tools, proving the missing upload
      // tools are gating rather than an empty catalog.
      expect(toolNames).toContain('create_one_company');
    });

    it('should refuse to execute the upload tools by name for that role', async () => {
      const createPayload = await executeTool<CreateFileUploadResult>(
        restrictedToken,
        'create_file_upload',
        { filename: 'forbidden.png', size: PNG_BYTES.length },
      );

      expect(createPayload.success).toBe(false);
      expect(createPayload.message).toBe('Tool "create_file_upload" not found');

      const completePayload = await executeTool<CompleteFileUploadResult>(
        restrictedToken,
        'complete_file_upload',
        { fileId: randomUUID() },
      );

      expect(completePayload.success).toBe(false);
      expect(completePayload.message).toBe(
        'Tool "complete_file_upload" not found',
      );
    });

    it('should not let a restricted role complete an upload created by an allowed role', async () => {
      const createPayload = await executeTool<CreateFileUploadResult>(
        uploaderToken,
        'create_file_upload',
        { filename: 'cross-role.png', size: PNG_BYTES.length },
      );

      expect(createPayload.success).toBe(true);
      jestExpectToBeDefined(createPayload.result);

      createdFileIds.push(createPayload.result.fileId);

      const completePayload = await executeTool<CompleteFileUploadResult>(
        restrictedToken,
        'complete_file_upload',
        { fileId: createPayload.result.fileId },
      );

      expect(completePayload.success).toBe(false);
      expect(completePayload.message).toBe(
        'Tool "complete_file_upload" not found',
      );
    });
  });
});
