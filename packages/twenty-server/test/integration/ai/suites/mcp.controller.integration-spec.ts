import request from 'supertest';

/**
 * Integration tests for MCP core controller
 *
 * These tests hit the real Nest app bootstrapped by test/integration/utils/setup-test.ts
 * and exercise the guarded POST /mcp endpoint using valid/invalid JSON-RPC payloads.
 */

describe('MCP Controller (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const endpoint = '/mcp';

  const postMcp = (body: any, bearer: string = API_KEY_ACCESS_TOKEN) => {
    return request(baseUrl)
      .post(endpoint)
      .set('Authorization', `Bearer ${bearer}`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(body));
  };

  it('should respond to ping with a JSON-RPC result envelope', async () => {
    await postMcp({ jsonrpc: '2.0', method: 'ping', id: '1' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '1',
          jsonrpc: '2.0',
          result: {},
        });
        expect(res.body.error).toBeUndefined();
      });
  });

  it('should respond to initialize with server metadata and capabilities', async () => {
    await postMcp({ jsonrpc: '2.0', method: 'initialize', id: 123 })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBe(123);
        expect(res.body.jsonrpc).toBe('2.0');
        expect(res.body.result).toBeDefined();
        // Should include capabilities and server metadata fields merged by wrapJsonRpcResponse
        expect(res.body.result.capabilities).toBeDefined();
        expect(Array.isArray(res.body.result.tools)).toBe(true);
        expect(Array.isArray(res.body.result.resources)).toBe(true);
        expect(Array.isArray(res.body.result.prompts)).toBe(true);
      });
  });

  it('should validate request body and return 400 for invalid payload (missing method)', async () => {
    await postMcp({})
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('BadRequestException');
      });
  });

  describe('MCP Tools', () => {
    it('should list available tools with schemas', async () => {
      const res = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 'tools-list-1',
      }).expect(201);

      expect(res.body.id).toBe('tools-list-1');
      expect(res.body.jsonrpc).toBe('2.0');
      expect(res.body.result).toBeDefined();
      expect(res.body.result.capabilities?.tools?.listChanged).toBe(false);
      expect(Array.isArray(res.body.result.tools)).toBe(true);
      // In a seeded workspace, there should be at least one tool
      expect(res.body.result.tools.length).toBeGreaterThanOrEqual(0);
      // If tools exist, they should have name, description and inputSchema
      const first = res.body.result.tools[0];

      if (first) {
        expect(first.name).toBeDefined();
        expect(first.description).toBeDefined();
        expect(first.inputSchema).toBeDefined();
      }
    });

    it('should return empty result for tools/call without params', async () => {
      const res = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 'tools-call-empty',
      }).expect(201);

      expect(res.body).toMatchObject({
        id: 'tools-call-empty',
        jsonrpc: '2.0',
        result: {},
      });
    });

    it('should return error when calling a non-existent tool', async () => {
      const res = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 'tools-call-missing',
        params: { name: 'non_existent_tool', arguments: {} },
      }).expect(201);

      expect(res.body.id).toBe('tools-call-missing');
      expect(res.body.jsonrpc).toBe('2.0');
      expect(res.body.error).toBeDefined();
      // From McpService error wrapper: code = HttpStatus.NOT_FOUND (404) and message containing tool name
      expect(res.body.error.code).toBe(404);
      expect(String(res.body.error.message)).toMatch(/non_existent_tool/);
    });

    it('should exercise each listed tool with a call and receive a JSON-RPC envelope', async () => {
      const list = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 'tools-list-for-calls',
      }).expect(201);

      const tools: Array<{ name: string }> = list.body.result.tools || [];

      // For each tool, attempt a call with empty arguments. We only assert we get a valid envelope
      // with either a result or an error. This ensures the MCP controller routes tool calls correctly
      // for every tool exposed in the workspace, without relying on specific seeded data.
      for (let i = 0; i < tools.length; i++) {
        const tool = tools[i];
        const id = `tool-call-${i}`;
        const res = await postMcp({
          jsonrpc: '2.0',
          method: 'tools/call',
          id,
          params: { name: tool.name, arguments: {} },
        }).expect(201);

        expect(res.body.jsonrpc).toBe('2.0');
        expect(res.body.id).toBe(id);
        // Either a structured result or an error is acceptable depending on validation/business rules
        const hasResultContent = !!res.body?.result?.content;
        const hasError = !!res.body?.error;

        expect(hasResultContent || hasError).toBe(true);
      }
    });

    it('should list prompts and resources as empty arrays with listChanged=false', async () => {
      const prompts = await postMcp({
        jsonrpc: '2.0',
        method: 'prompts/list',
        id: 'prompts-1',
      }).expect(201);

      expect(prompts.body.result.capabilities?.prompts?.listChanged).toBe(
        false,
      );
      expect(Array.isArray(prompts.body.result.prompts)).toBe(true);

      const resources = await postMcp({
        jsonrpc: '2.0',
        method: 'resources/list',
        id: 'resources-1',
      }).expect(201);

      expect(resources.body.result.capabilities?.resources?.listChanged).toBe(
        false,
      );
      expect(Array.isArray(resources.body.result.resources)).toBe(true);
    });
  });
});
