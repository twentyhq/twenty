import { randomUUID } from 'node:crypto';

import request from 'supertest';

import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

const TEST_WORKSPACE_SCHEMA = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const TOOL_NAMES = {
  createCompany: 'create_company',
  createNote: 'create_note',
  createNoteTarget: 'create_note_target',
  groupByNoteTargets: 'group_by_note_targets',
} as const;

type McpToolCallResult = {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type DatabaseToolPayload<TResult> = {
  success: boolean;
  message: string;
  result: TResult;
  error?: string;
};

type LearnToolsPayload = {
  tools: Array<{
    name: string;
    description?: string;
    inputSchema?: Record<string, unknown>;
  }>;
  notFound: string[];
  message: string;
};

type CreatedRecord = { id: string };

const baseUrl = `http://localhost:${APP_PORT}`;
const endpoint = '/mcp';

const postMcp = (body: Record<string, unknown>) =>
  request(baseUrl)
    .post(endpoint)
    .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify(body));

const callMcpTool = async (
  name: string,
  args: Record<string, unknown>,
  id: string = `call-${randomUUID()}`,
): Promise<McpToolCallResult> => {
  const res = await postMcp({
    jsonrpc: '2.0',
    method: 'tools/call',
    id,
    params: { name, arguments: args },
  }).expect(200);

  expect(res.body.id).toBe(id);
  expect(res.body.jsonrpc).toBe('2.0');
  expect(res.body.error).toBeUndefined();

  return res.body.result as McpToolCallResult;
};

const parseToolPayload = <T>(result: McpToolCallResult): T => {
  expect(result.isError).toBe(false);
  expect(result.content?.[0]?.type).toBe('text');

  const raw = result.content?.[0]?.text;

  expect(raw).toBeDefined();

  return JSON.parse(raw as string) as T;
};

const executeWorkspaceTool = async <TResult>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<TResult> => {
  const mcpResult = await callMcpTool('execute_tool', {
    toolName,
    arguments: args,
  });
  const payload = parseToolPayload<DatabaseToolPayload<TResult>>(mcpResult);

  expect(payload.success).toBe(true);
  expect(payload.result).toBeDefined();

  return payload.result;
};

const learnToolSchema = async (
  toolName: string,
): Promise<Record<string, unknown>> => {
  const mcpResult = await callMcpTool('learn_tools', {
    toolNames: [toolName],
    aspects: ['schema'],
  });
  const payload = parseToolPayload<LearnToolsPayload>(mcpResult);

  expect(payload.notFound).toEqual([]);
  expect(payload.tools).toHaveLength(1);
  expect(payload.tools[0].name).toBe(toolName);

  const inputSchema = payload.tools[0].inputSchema;

  expect(inputSchema).toBeDefined();

  return inputSchema as Record<string, unknown>;
};

describe('MCP tool execution (integration)', () => {
  describe('create_note_target (morph relation join)', () => {
    let createdCompanyId: string | undefined;
    let createdNoteId: string | undefined;
    let createdNoteTargetId: string | undefined;

    afterAll(async () => {
      if (createdNoteTargetId) {
        await deleteRecordsByIds('noteTarget', [createdNoteTargetId]);
      }
      if (createdNoteId) {
        await deleteRecordsByIds('note', [createdNoteId]);
      }
      if (createdCompanyId) {
        await deleteRecordsByIds('company', [createdCompanyId]);
      }
    });

    it('should expose the morph-relation join columns as `${name}Id` UUID parameters', async () => {
      const inputSchema = await learnToolSchema(TOOL_NAMES.createNoteTarget);

      const properties = (
        inputSchema as {
          properties?: Record<string, { type?: string; format?: string }>;
        }
      ).properties;

      expect(properties).toBeDefined();

      expect(properties?.noteId).toMatchObject({
        type: 'string',
        format: 'uuid',
      });

      // Morph relations must be exposed as `${name}Id` UUIDs (the join column),
      // not as the relation name typed as string — the data-arg-processor only
      // accepts the join-column form for write operations.
      expect(properties?.targetCompanyId).toMatchObject({
        type: 'string',
        format: 'uuid',
      });
      expect(properties?.targetPersonId).toMatchObject({
        type: 'string',
        format: 'uuid',
      });
      expect(properties?.targetOpportunityId).toMatchObject({
        type: 'string',
        format: 'uuid',
      });

      expect(properties?.targetCompany).toBeUndefined();
      expect(properties?.targetPerson).toBeUndefined();
      expect(properties?.targetOpportunity).toBeUndefined();
    });

    it('should persist targetCompanyId when create_note_target is invoked via MCP', async () => {
      const company = await executeWorkspaceTool<CreatedRecord>(
        TOOL_NAMES.createCompany,
        { name: `mcp-tool-exec-company-${randomUUID()}` },
      );

      createdCompanyId = company.id;
      expect(createdCompanyId).toBeDefined();

      const note = await executeWorkspaceTool<CreatedRecord>(
        TOOL_NAMES.createNote,
        { title: `mcp-tool-exec-note-${randomUUID()}` },
      );

      createdNoteId = note.id;
      expect(createdNoteId).toBeDefined();

      const noteTarget = await executeWorkspaceTool<CreatedRecord>(
        TOOL_NAMES.createNoteTarget,
        {
          noteId: createdNoteId,
          targetCompanyId: createdCompanyId,
        },
      );

      createdNoteTargetId = noteTarget.id;
      expect(createdNoteTargetId).toBeDefined();

      const rows = (await global.testDataSource.query(
        `SELECT "noteId", "targetCompanyId", "targetPersonId", "targetOpportunityId"
         FROM "${TEST_WORKSPACE_SCHEMA}"."noteTarget" WHERE id = $1`,
        [createdNoteTargetId],
      )) as Array<{
        noteId: string;
        targetCompanyId: string | null;
        targetPersonId: string | null;
        targetOpportunityId: string | null;
      }>;

      expect(rows).toHaveLength(1);
      expect(rows[0].noteId).toBe(createdNoteId);
      expect(rows[0].targetCompanyId).toBe(createdCompanyId);
      expect(rows[0].targetPersonId).toBeNull();
      expect(rows[0].targetOpportunityId).toBeNull();
    });
  });

  describe('group_by_note_targets (morph relation column)', () => {
    let createdCompanyAId: string | undefined;
    let createdCompanyBId: string | undefined;
    let createdNoteId: string | undefined;
    const createdNoteTargetIds: string[] = [];

    beforeAll(async () => {
      const companyA = await executeWorkspaceTool<CreatedRecord>(
        TOOL_NAMES.createCompany,
        { name: `mcp-group-by-company-A-${randomUUID()}` },
      );

      createdCompanyAId = companyA.id;

      const companyB = await executeWorkspaceTool<CreatedRecord>(
        TOOL_NAMES.createCompany,
        { name: `mcp-group-by-company-B-${randomUUID()}` },
      );

      createdCompanyBId = companyB.id;

      const note = await executeWorkspaceTool<CreatedRecord>(
        TOOL_NAMES.createNote,
        { title: `mcp-group-by-note-${randomUUID()}` },
      );

      createdNoteId = note.id;

      // Two targets on company A, one on company B — the grouped counts
      // we'll assert against later.
      const targetCompanyIds = [
        createdCompanyAId,
        createdCompanyAId,
        createdCompanyBId,
      ];

      for (const targetCompanyId of targetCompanyIds) {
        const noteTarget = await executeWorkspaceTool<CreatedRecord>(
          TOOL_NAMES.createNoteTarget,
          { noteId: createdNoteId, targetCompanyId },
        );

        createdNoteTargetIds.push(noteTarget.id);
      }
    });

    afterAll(async () => {
      if (createdNoteTargetIds.length > 0) {
        await deleteRecordsByIds('noteTarget', createdNoteTargetIds);
      }
      if (createdNoteId) {
        await deleteRecordsByIds('note', [createdNoteId]);
      }

      const companyIds = [createdCompanyAId, createdCompanyBId].filter(
        (id): id is string => typeof id === 'string',
      );

      if (companyIds.length > 0) {
        await deleteRecordsByIds('company', companyIds);
      }
    });

    it('should expose targetCompanyId as a valid groupBy option', async () => {
      const inputSchema = await learnToolSchema(TOOL_NAMES.groupByNoteTargets);
      const groupByItems = (
        inputSchema as {
          properties?: {
            groupBy?: {
              items?: {
                anyOf?: Array<{ properties?: Record<string, unknown> }>;
                properties?: Record<string, unknown>;
              };
            };
          };
        }
      ).properties?.groupBy?.items;

      expect(groupByItems).toBeDefined();

      // Each groupBy variant is { [columnName]: true }. Collect every column
      // the schema offers so we can assert on the morph-relation columns.
      const groupByColumns = new Set<string>();

      if (groupByItems?.anyOf) {
        for (const variant of groupByItems.anyOf) {
          for (const propertyName of Object.keys(variant.properties ?? {})) {
            groupByColumns.add(propertyName);
          }
        }
      } else if (groupByItems?.properties) {
        for (const propertyName of Object.keys(groupByItems.properties)) {
          groupByColumns.add(propertyName);
        }
      }

      expect(groupByColumns.has('noteId')).toBe(true);
      expect(groupByColumns.has('targetCompanyId')).toBe(true);
      expect(groupByColumns.has('targetPersonId')).toBe(true);
      expect(groupByColumns.has('targetOpportunityId')).toBe(true);
    });

    it('should group noteTargets by targetCompanyId via MCP', async () => {
      type GroupByGroup = {
        dimensions: unknown[];
        value: string | number;
      };
      type GroupByResult = {
        groups: GroupByGroup[];
        dimensionLabels: string[];
        aggregation: string;
        groupCount: number;
      };

      const result = await executeWorkspaceTool<GroupByResult>(
        TOOL_NAMES.groupByNoteTargets,
        {
          groupBy: [{ targetCompanyId: true }],
          aggregateOperation: 'COUNT',
          // Scope to the noteTargets we created so other seeded rows don't
          // leak into the counts.
          noteId: { eq: createdNoteId },
        },
      );

      expect(result.dimensionLabels).toEqual(['targetCompanyId']);
      expect(result.aggregation).toBe('COUNT');
      expect(result.groupCount).toBe(2);

      // Dimensions are returned positionally, aligned with dimensionLabels.
      const countsByCompany = Object.fromEntries(
        result.groups.map((group) => [
          String(group.dimensions[0]),
          Number(group.value),
        ]),
      );

      expect(countsByCompany[createdCompanyAId as string]).toBe(2);
      expect(countsByCompany[createdCompanyBId as string]).toBe(1);
    });
  });
});
