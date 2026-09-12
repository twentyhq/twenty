import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { uploadFileWithDirectUpload } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

const TEST_WORKSPACE_SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

type McpToolCallResult = {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type DatabaseToolPayload<TResult> = {
  success: boolean;
  message: string;
  result: TResult;
};

const callExecuteTool = async <TResult>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<DatabaseToolPayload<TResult>> => {
  const id = `call-${randomUUID()}`;

  const res = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp')
    .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id,
        params: {
          name: 'execute_tool',
          arguments: { toolName, arguments: args },
        },
      }),
    )
    .expect(200);

  const result = res.body.result as McpToolCallResult;

  expect(result.isError).toBe(false);

  return JSON.parse(
    result.content?.[0]?.text as string,
  ) as DatabaseToolPayload<TResult>;
};

const getAttachmentFileIds = async (
  attachmentIds: string[],
): Promise<string[]> => {
  const rows = await global.testDataSource.query(
    `SELECT id, file FROM "${TEST_WORKSPACE_SCHEMA}"."attachment" WHERE id = ANY($1)`,
    [attachmentIds],
  );

  return rows.map(
    (row: { file: Array<{ fileId: string }> }) => row.file[0].fileId,
  );
};

describe('agent chat files in record CRUD tools (integration)', () => {
  let chatFileId: string;
  const createdAttachmentIds: string[] = [];

  beforeAll(async () => {
    jest.useRealTimers();

    const uploadedFile = await uploadFileWithDirectUpload({
      filename: 'chat-upload.pdf',
      content: Buffer.from('%PDF-1.4 chat upload'),
      fileFolder: 'AgentChat',
    });

    chatFileId = uploadedFile.id;

    expect(uploadedFile.path).toContain('agent-chat/');
  });

  afterAll(async () => {
    await deleteRecordsByIds('attachment', createdAttachmentIds);
  });

  it('should copy a chat upload once per record when several records reference it', async () => {
    const payload = await callExecuteTool<Array<{ id: string }>>(
      'create_many_attachments',
      {
        records: [
          {
            name: 'first.pdf',
            file: [{ fileId: chatFileId, label: 'first.pdf' }],
          },
          {
            name: 'second.pdf',
            file: [{ fileId: chatFileId, label: 'second.pdf' }],
          },
        ],
      },
    );

    expect(payload.success).toBe(true);

    const attachmentIds = payload.result.map((record) => record.id);

    createdAttachmentIds.push(...attachmentIds);

    expect(attachmentIds).toHaveLength(2);

    const storedFileIds = await getAttachmentFileIds(attachmentIds);

    expect(storedFileIds).toHaveLength(2);
    expect(storedFileIds[0]).not.toBe(storedFileIds[1]);
    expect(storedFileIds).not.toContain(chatFileId);

    const copiedFiles = await global.testDataSource.query(
      'SELECT id, path FROM core."file" WHERE id = ANY($1)',
      [storedFileIds],
    );

    expect(copiedFiles).toHaveLength(2);
    copiedFiles.forEach((file: { path: string }) => {
      expect(file.path).toContain('files-field/');
    });
  });
});
