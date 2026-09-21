import { randomUUID } from 'node:crypto';

import request from 'supertest';

import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

const TOOL_NAMES = {
  createCompany: 'create_one_company',
  createOpportunity: 'create_one_opportunity',
  findManyCompanies: 'find_many_companies',
  findOneCompany: 'find_one_company',
  findOneOpportunity: 'find_one_opportunity',
} as const;

type McpToolCallResult = {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type DatabaseToolPayload<TResult> = {
  success: boolean;
  message: string;
  result: TResult;
  warnings?: string[];
  error?: string;
};

type CreatedRecord = { id: string };

type FindRecordsResult = {
  records: Array<Record<string, unknown>>;
  count: string | number;
  hasNextPage: boolean;
};

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
): Promise<DatabaseToolPayload<TResult>> => {
  const mcpResult = await callMcpTool('execute_tool', {
    toolName,
    arguments: args,
  });
  const payload = parseToolPayload<DatabaseToolPayload<TResult>>(mcpResult);

  expect(payload.success).toBe(true);
  expect(payload.result).toBeDefined();

  return payload;
};

describe('MCP find tools relation selection (integration)', () => {
  let companyId: string;
  let opportunityAId: string;
  let opportunityBId: string;

  const companyName = `mcp-relation-select-company-${randomUUID()}`;
  const opportunityAName = `mcp-relation-select-opportunity-a-${randomUUID()}`;
  const opportunityBName = `mcp-relation-select-opportunity-b-${randomUUID()}`;

  beforeAll(async () => {
    const company = await executeWorkspaceTool<CreatedRecord>(
      TOOL_NAMES.createCompany,
      { name: companyName },
    );

    companyId = company.result.id;

    const opportunityA = await executeWorkspaceTool<CreatedRecord>(
      TOOL_NAMES.createOpportunity,
      { name: opportunityAName, companyId },
    );

    opportunityAId = opportunityA.result.id;

    const opportunityB = await executeWorkspaceTool<CreatedRecord>(
      TOOL_NAMES.createOpportunity,
      { name: opportunityBName, companyId },
    );

    opportunityBId = opportunityB.result.id;
  });

  afterAll(async () => {
    await deleteRecordsByIds(
      'opportunity',
      [opportunityAId, opportunityBId].filter(Boolean),
    );
    await deleteRecordsByIds('company', [companyId].filter(Boolean));
  });

  it('should hydrate a one-to-many relation selected by name in find_many', async () => {
    const payload = await executeWorkspaceTool<FindRecordsResult>(
      TOOL_NAMES.findManyCompanies,
      {
        id: { eq: companyId },
        select: ['id', 'name', 'opportunities'],
        limit: 1,
      },
    );

    expect(payload.warnings).toBeUndefined();
    expect(payload.result.records).toHaveLength(1);

    const record = payload.result.records[0];

    expect(record.id).toBe(companyId);
    expect(record.name).toBe(companyName);

    const opportunities = record.opportunities as Array<
      Record<string, unknown>
    >;

    expect(Array.isArray(opportunities)).toBe(true);
    expect(opportunities).toHaveLength(2);
    expect(opportunities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: opportunityAId,
          name: opportunityAName,
        }),
        expect.objectContaining({
          id: opportunityBId,
          name: opportunityBName,
        }),
      ]),
    );
  });

  it('should hydrate a one-to-many relation selected by name in find_one', async () => {
    const payload = await executeWorkspaceTool<FindRecordsResult>(
      TOOL_NAMES.findOneCompany,
      {
        id: companyId,
        select: ['id', 'name', 'opportunities'],
      },
    );

    const record = payload.result.records[0];

    const opportunities = record.opportunities as Array<
      Record<string, unknown>
    >;

    expect(opportunities).toHaveLength(2);
  });

  it('should hydrate a many-to-one relation selected by name as a single record', async () => {
    const payload = await executeWorkspaceTool<FindRecordsResult>(
      TOOL_NAMES.findOneOpportunity,
      {
        id: opportunityAId,
        select: ['id', 'name', 'company'],
      },
    );

    const record = payload.result.records[0];

    expect(record.id).toBe(opportunityAId);
    expect(record.company).toEqual(
      expect.objectContaining({
        id: companyId,
        name: companyName,
      }),
    );
  });

  it('should hydrate relation fields in wildcard selection', async () => {
    const payload = await executeWorkspaceTool<FindRecordsResult>(
      TOOL_NAMES.findOneCompany,
      {
        id: companyId,
        select: ['*'],
      },
    );

    const record = payload.result.records[0];

    expect(record.name).toBe(companyName);

    const opportunities = record.opportunities as Array<
      Record<string, unknown>
    >;

    expect(opportunities).toHaveLength(2);
  });

  it('should suggest the relation field for a near-miss selection', async () => {
    const payload = await executeWorkspaceTool<FindRecordsResult>(
      TOOL_NAMES.findManyCompanies,
      {
        id: { eq: companyId },
        select: ['name', 'opportunitiez'],
        limit: 1,
      },
    );

    expect(payload.warnings).toEqual([
      expect.stringContaining("'opportunities'"),
    ]);
    expect(payload.result.records[0]).not.toHaveProperty('opportunities');
  });
});
