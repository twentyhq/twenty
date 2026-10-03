import request from 'supertest';
import { normalizeToolInputSchema } from 'test/integration/ai/utils/normalize-tool-input-schema.util';

const OBJECT_NAMES = [
  { singular: 'pet', plural: 'pets' },
  { singular: 'survey_result', plural: 'survey_results' },
  { singular: 'note', plural: 'notes' },
];

const listDirectModeMcpTools = async (): Promise<
  { name: string; inputSchema: unknown }[]
> => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp?mode=direct')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: '1' }))
    .expect(200);

  return response.body.result.tools;
};

describe('MCP database tool input schemas', () => {
  let tools: { name: string; inputSchema: unknown }[];

  beforeAll(async () => {
    tools = await listDirectModeMcpTools();
  });

  const getNormalizedInputSchema = (toolName: string) => {
    const tool = tools.find(({ name }) => name === toolName);

    expect(tool).toBeDefined();

    return normalizeToolInputSchema({ inputSchema: tool?.inputSchema });
  };

  it.each(OBJECT_NAMES)(
    'should list the input schemas of the $singular database tools',
    ({ singular, plural }) => {
      const findMany = getNormalizedInputSchema(`find_many_${plural}`);
      const updateMany = getNormalizedInputSchema(`update_many_${plural}`);

      expect(findMany.recordFilter).toMatchSnapshot('record filter');
      expect(updateMany.recordFilter).toMatchSnapshot(
        'update_many record filter',
      );

      for (const toolName of [`group_by_${plural}`, `delete_many_${plural}`]) {
        expect(getNormalizedInputSchema(toolName).recordFilter).toEqual(
          findMany.recordFilter,
        );
      }

      for (const toolName of [
        `find_many_${plural}`,
        `find_one_${singular}`,
        `group_by_${plural}`,
        `create_one_${singular}`,
        `create_many_${plural}`,
        `update_one_${singular}`,
        `update_many_${plural}`,
        `upsert_many_${plural}`,
        `delete_one_${singular}`,
        `delete_many_${plural}`,
      ]) {
        expect(getNormalizedInputSchema(toolName).inputSchema).toMatchSnapshot(
          toolName,
        );
      }
    },
  );
});
