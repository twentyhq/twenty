import { type JSONSchema7 } from 'json-schema';
import request from 'supertest';
import { normalizeMcpToolInputSchemas } from 'test/integration/ai/utils/normalize-mcp-tool-input-schemas.util';

const OBJECT_TOOL_NAMES = [
  { singular: 'pet', plural: 'pets' },
  { singular: 'survey_result', plural: 'survey_results' },
  { singular: 'note', plural: 'notes' },
];

const buildDatabaseToolNames = ({
  singular,
  plural,
}: {
  singular: string;
  plural: string;
}) => [
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
];

const listDirectModeMcpTools = async (): Promise<
  { name: string; inputSchema: JSONSchema7 }[]
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
  let tools: { name: string; inputSchema: JSONSchema7 }[];

  beforeAll(async () => {
    tools = await listDirectModeMcpTools();
  });

  it.each(OBJECT_TOOL_NAMES)(
    'should list the input schemas of the $singular database tools',
    (objectToolNames) => {
      const toolNames = buildDatabaseToolNames(objectToolNames);
      const databaseTools = tools.filter(({ name }) =>
        toolNames.includes(name),
      );

      expect(databaseTools.map(({ name }) => name).sort()).toEqual(
        [...toolNames].sort(),
      );

      for (const [toolName, normalizedSchema] of Object.entries(
        normalizeMcpToolInputSchemas(databaseTools),
      )) {
        expect(normalizedSchema).toMatchSnapshot(toolName);
      }
    },
  );
});
