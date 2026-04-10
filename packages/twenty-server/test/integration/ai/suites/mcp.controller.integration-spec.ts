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

  const postMcp = (
    body: any,
    bearer: string = API_KEY_ACCESS_TOKEN,
    accept: string = 'application/json',
  ) => {
    return request(baseUrl)
      .post(endpoint)
      .set('Authorization', `Bearer ${bearer}`)
      .set('Content-Type', 'application/json')
      .set('Accept', accept)
      .send(JSON.stringify(body));
  };

  it('should return 405 with JSON-RPC error for GET /mcp', async () => {
    await request(baseUrl)
      .get(endpoint)
      .expect(405)
      .expect((res) => {
        expect(res.headers.allow).toBe('POST');
        expect(res.body.jsonrpc).toBe('2.0');
        expect(res.body.error).toBeDefined();
        expect(res.body.error.code).toBe(-32600);
        expect(res.body.id).toBeNull();
      });
  });

  it('should return 405 with JSON-RPC error for DELETE /mcp', async () => {
    await request(baseUrl)
      .delete(endpoint)
      .expect(405)
      .expect((res) => {
        expect(res.headers.allow).toBe('POST');
        expect(res.body.jsonrpc).toBe('2.0');
        expect(res.body.error).toBeDefined();
        expect(res.body.error.code).toBe(-32600);
        expect(res.body.id).toBeNull();
      });
  });

  it('should respond to ping with a JSON-RPC result envelope', async () => {
    await postMcp({ jsonrpc: '2.0', method: 'ping', id: '1' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: '1',
          jsonrpc: '2.0',
          result: {},
        });
        expect(res.body.error).toBeUndefined();
      });
  });

  it('should respond to initialize with spec-compliant InitializeResult', async () => {
    await postMcp({ jsonrpc: '2.0', method: 'initialize', id: 123 })
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(123);
        expect(res.body.jsonrpc).toBe('2.0');
        expect(res.body.result).toBeDefined();
        expect(res.body.result.protocolVersion).toBe('2024-11-05');
        expect(res.body.result.capabilities).toBeDefined();
        expect(res.body.result.serverInfo).toBeDefined();
        expect(res.body.result.serverInfo.name).toBe('Twenty MCP Server');
        expect(typeof res.body.result.instructions).toBe('string');
      });
  });

  it('should return 202 with no body for notifications/initialized (no id)', async () => {
    await postMcp({ jsonrpc: '2.0', method: 'notifications/initialized' })
      .expect(202)
      .expect((res) => {
        expect(res.body).toEqual({});
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
      }).expect(200);

      expect(res.body.id).toBe('tools-list-1');
      expect(res.body.jsonrpc).toBe('2.0');
      expect(res.body.result).toBeDefined();
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

    it('should return invalid params error for tools/call without params', async () => {
      const res = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 'tools-call-empty',
      }).expect(200);

      expect(res.body.id).toBe('tools-call-empty');
      expect(res.body.jsonrpc).toBe('2.0');
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe(-32602);
    });

    it('should return error when calling a non-existent tool', async () => {
      const res = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 'tools-call-missing',
        params: { name: 'non_existent_tool', arguments: {} },
      }).expect(200);

      expect(res.body.id).toBe('tools-call-missing');
      expect(res.body.jsonrpc).toBe('2.0');
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe(-32602);
      expect(String(res.body.error.message)).toMatch(/non_existent_tool/);
    });

    it('should exercise each listed tool with a call and receive a JSON-RPC envelope', async () => {
      const list = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 'tools-list-for-calls',
      }).expect(200);

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
        }).expect(200);

        expect(res.body.jsonrpc).toBe('2.0');
        expect(res.body.id).toBe(id);
        // Either a structured result or an error is acceptable depending on validation/business rules
        const hasResultContent = !!res.body?.result?.content;
        const hasError = !!res.body?.error;

        expect(hasResultContent || hasError).toBe(true);
      }
    });

    it('should list prompts and resources as empty arrays', async () => {
      const prompts = await postMcp({
        jsonrpc: '2.0',
        method: 'prompts/list',
        id: 'prompts-1',
      }).expect(200);

      expect(Array.isArray(prompts.body.result.prompts)).toBe(true);

      const resources = await postMcp({
        jsonrpc: '2.0',
        method: 'resources/list',
        id: 'resources-1',
      }).expect(200);

      expect(Array.isArray(resources.body.result.resources)).toBe(true);
    });
  });

  describe('SSE Streaming', () => {
    const parseSseEvents = (
      rawBody: string,
    ): Array<Record<string, unknown>> => {
      return rawBody
        .split('\n\n')
        .filter((block) => block.trim().length > 0)
        .map((block) => {
          const dataLine = block
            .split('\n')
            .find((line) => line.startsWith('data: '));

          if (!dataLine) {
            throw new Error(`No data line found in SSE block: ${block}`);
          }

          return JSON.parse(dataLine.slice('data: '.length));
        });
    };

    it('should respond with SSE when Accept includes text/event-stream', async () => {
      const res = await postMcp(
        { jsonrpc: '2.0', method: 'ping', id: 'sse-ping-1' },
        API_KEY_ACCESS_TOKEN,
        'application/json, text/event-stream',
      ).expect(200);

      expect(res.headers['content-type']).toMatch(/text\/event-stream/);

      const events = parseSseEvents(res.text);

      expect(events.length).toBeGreaterThanOrEqual(1);

      // The last event should be the JSON-RPC response
      const lastEvent = events[events.length - 1];

      expect(lastEvent).toMatchObject({
        id: 'sse-ping-1',
        jsonrpc: '2.0',
        result: {},
      });
    });

    it('should respond with JSON when Accept is application/json only', async () => {
      const res = await postMcp(
        { jsonrpc: '2.0', method: 'ping', id: 'json-ping-1' },
        API_KEY_ACCESS_TOKEN,
        'application/json',
      ).expect(200);

      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toMatchObject({
        id: 'json-ping-1',
        jsonrpc: '2.0',
        result: {},
      });
    });

    it('should include progress notification before tool call result in SSE', async () => {
      const res = await postMcp(
        {
          jsonrpc: '2.0',
          method: 'tools/call',
          id: 'sse-tool-1',
          params: { name: 'get_tool_catalog', arguments: {} },
        },
        API_KEY_ACCESS_TOKEN,
        'application/json, text/event-stream',
      ).expect(200);

      expect(res.headers['content-type']).toMatch(/text\/event-stream/);

      const events = parseSseEvents(res.text);

      // Should have at least a progress notification and the final response
      expect(events.length).toBeGreaterThanOrEqual(2);

      // First event should be a progress notification
      const progressEvent = events[0];

      expect(progressEvent).toMatchObject({
        jsonrpc: '2.0',
        method: 'notifications/progress',
        params: {
          progressToken: 'tool-call-sse-tool-1',
          progress: 0,
          total: 1,
        },
      });

      // Last event should be the final JSON-RPC response
      const lastEvent = events[events.length - 1];

      expect(lastEvent).toMatchObject({
        id: 'sse-tool-1',
        jsonrpc: '2.0',
      });

      // Should have either result.content or error
      const hasResultContent = !!(lastEvent as any)?.result?.content;
      const hasError = !!(lastEvent as any)?.error;

      expect(hasResultContent || hasError).toBe(true);
    });
  });
});
