import request from 'supertest';

describe('MCP Controller (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  // Meta mode: the call-every-listed-tool test below must not reach direct mode's write tools
  const endpoint = '/mcp?mode=meta';

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

  it('should return method not found for an unsupported method', async () => {
    await postMcp({
      jsonrpc: '2.0',
      method: 'sampling/createMessage',
      id: 'unsupported-method',
    })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          id: 'unsupported-method',
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: 'Method not found',
          },
        });
      });
  });

  const initialize = (protocolVersion: string) =>
    postMcp({
      jsonrpc: '2.0',
      method: 'initialize',
      id: 123,
      params: {
        protocolVersion,
        capabilities: {},
        clientInfo: { name: 'integration-test', version: '1.0.0' },
      },
    });

  it('should respond to initialize with spec-compliant InitializeResult', async () => {
    await initialize('2025-06-18')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(123);
        expect(res.body.jsonrpc).toBe('2.0');
        expect(res.body.result).toBeDefined();
        expect(res.body.result.protocolVersion).toBe('2025-06-18');
        expect(res.body.result.capabilities).toBeDefined();
        expect(res.body.result.serverInfo).toBeDefined();
        expect(res.body.result.serverInfo.name).toBe('Twenty MCP Server');
        expect(typeof res.body.result.instructions).toBe('string');
      });
  });

  it('should negotiate the newest legacy version a client asks for', async () => {
    const res = await initialize('2025-11-25').expect(200);

    expect(res.body.result.protocolVersion).toBe('2025-11-25');
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
        expect(res.body.error.code).toBe(-32600);
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
      expect(res.body.result.tools.length).toBeGreaterThanOrEqual(0);
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
        const hasResultContent = !!res.body?.result?.content;
        const hasError = !!res.body?.error;

        expect(hasResultContent || hasError).toBe(true);
      }
    }, 60_000);

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

    it('should echo the client progress token before the tool call result in SSE', async () => {
      const res = await postMcp(
        {
          jsonrpc: '2.0',
          method: 'tools/call',
          id: 'sse-tool-1',
          params: {
            name: 'learn_tools',
            arguments: { toolNames: [] },
            _meta: { progressToken: 'client-token-1' },
          },
        },
        API_KEY_ACCESS_TOKEN,
        'application/json, text/event-stream',
      ).expect(200);

      expect(res.headers['content-type']).toMatch(/text\/event-stream/);

      const events = parseSseEvents(res.text);

      expect(events.length).toBeGreaterThanOrEqual(2);

      const progressEvent = events[0];

      expect(progressEvent).toMatchObject({
        jsonrpc: '2.0',
        method: 'notifications/progress',
        params: {
          progressToken: 'client-token-1',
          progress: 0,
          total: 1,
        },
      });

      const lastEvent = events[events.length - 1];

      expect(lastEvent).toMatchObject({
        id: 'sse-tool-1',
        jsonrpc: '2.0',
      });

      const hasResultContent = !!(lastEvent as any)?.result?.content;
      const hasError = !!(lastEvent as any)?.error;

      expect(hasResultContent || hasError).toBe(true);
    });

    it('should send no progress notification when the client did not supply a token', async () => {
      const res = await postMcp(
        {
          jsonrpc: '2.0',
          method: 'tools/call',
          id: 'sse-tool-no-progress',
          params: { name: 'learn_tools', arguments: { toolNames: [] } },
        },
        API_KEY_ACCESS_TOKEN,
        'application/json, text/event-stream',
      ).expect(200);

      const events = parseSseEvents(res.text);

      expect(
        events.some((event) => event.method === 'notifications/progress'),
      ).toBe(false);

      const lastEvent = events[events.length - 1];

      expect(lastEvent).toMatchObject({
        id: 'sse-tool-no-progress',
        jsonrpc: '2.0',
      });
    });
  });

  describe('Protocol 2026-07-28', () => {
    const MODERN_VERSION = '2026-07-28';
    const modernMeta = {
      'io.modelcontextprotocol/protocolVersion': MODERN_VERSION,
      'io.modelcontextprotocol/clientCapabilities': {},
    };

    const postModernMcp = ({
      method,
      params,
      headers = {},
    }: {
      method: string;
      params?: Record<string, unknown>;
      headers?: Record<string, string>;
    }) =>
      request(baseUrl)
        .post(endpoint)
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json, text/event-stream')
        .set({
          'MCP-Protocol-Version': MODERN_VERSION,
          'Mcp-Method': method,
          ...headers,
        })
        .send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'modern',
            method,
            params: { ...params, _meta: modernMeta },
          }),
        );

    it('should answer server/discover', async () => {
      const res = await postModernMcp({ method: 'server/discover' }).expect(
        200,
      );

      expect(res.body.result).toMatchObject({
        supportedVersions: [MODERN_VERSION],
        capabilities: { tools: {}, resources: {}, prompts: {} },
        resultType: 'complete',
        ttlMs: 60_000,
        cacheScope: 'private',
        _meta: {
          'io.modelcontextprotocol/serverInfo': { name: 'Twenty MCP Server' },
        },
      });
      expect(typeof res.body.result.instructions).toBe('string');
    });

    it('should mark tools/list as a complete private cacheable result', async () => {
      const res = await postModernMcp({ method: 'tools/list' }).expect(200);

      expect(Array.isArray(res.body.result.tools)).toBe(true);
      expect(res.body.result.tools.length).toBeGreaterThan(0);
      expect(res.body.result).toMatchObject({
        resultType: 'complete',
        cacheScope: 'private',
      });
    });

    it('should call a tool when Mcp-Name matches', async () => {
      const res = await postModernMcp({
        method: 'tools/call',
        params: { name: 'get_tool_catalog', arguments: {} },
        headers: { 'Mcp-Name': 'get_tool_catalog' },
      }).expect(200);

      expect(res.body.result).toMatchObject({
        resultType: 'complete',
        isError: false,
      });
    });

    it('should reject an Mcp-Name header that differs from the tool name', async () => {
      const res = await postModernMcp({
        method: 'tools/call',
        params: { name: 'get_tool_catalog', arguments: {} },
        headers: { 'Mcp-Name': 'learn_tools' },
      }).expect(400);

      expect(res.body.error.code).toBe(-32020);
    });

    it('should reject an unsupported version with the supported list', async () => {
      const res = await request(baseUrl)
        .post(endpoint)
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json, text/event-stream')
        .set({
          'MCP-Protocol-Version': '2099-01-01',
          'Mcp-Method': 'tools/list',
        })
        .send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 'future',
            method: 'tools/list',
            params: {
              _meta: {
                ...modernMeta,
                'io.modelcontextprotocol/protocolVersion': '2099-01-01',
              },
            },
          }),
        )
        .expect(400);

      expect(res.body.error.code).toBe(-32022);
      expect(res.body.error.data.supported).toContain(MODERN_VERSION);
    });

    it('should answer 404 to ping, which this revision removed', async () => {
      const res = await postModernMcp({ method: 'ping' }).expect(404);

      expect(res.body.error.code).toBe(-32601);
    });

    it('should keep ignoring a protocol header a legacy client sends', async () => {
      const res = await request(baseUrl)
        .post(endpoint)
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('MCP-Protocol-Version', '2025-11-25')
        .send(JSON.stringify({ jsonrpc: '2.0', method: 'ping', id: 'legacy' }))
        .expect(200);

      expect(res.body.result).toEqual({});
    });

    it('should leave legacy results without the new fields', async () => {
      const res = await postMcp({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 'legacy',
      }).expect(200);

      expect(res.body.result.resultType).toBeUndefined();
      expect(res.body.result.ttlMs).toBeUndefined();
    });
  });
});
