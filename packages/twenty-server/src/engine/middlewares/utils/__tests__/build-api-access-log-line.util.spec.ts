import { type Request, type Response } from 'express';

import { buildApiAccessLogLine } from 'src/engine/middlewares/utils/build-api-access-log-line.util';
import { type RequestTraceContext } from 'src/engine/utils/compute-request-trace-context.util';

const parseLogfmtKeys = (line: string): string[] => {
  const keys: string[] = [];
  let index = 0;

  while (index < line.length) {
    const equalsIndex = line.indexOf('=', index);

    if (equalsIndex === -1) {
      break;
    }

    keys.push(line.slice(index, equalsIndex));
    index = equalsIndex + 1;

    if (line[index] === '"') {
      index += 1;
      while (index < line.length && line[index] !== '"') {
        index += line[index] === '\\' ? 2 : 1;
      }
      index += 1;
    } else {
      const spaceIndex = line.indexOf(' ', index);

      index = spaceIndex === -1 ? line.length : spaceIndex;
    }

    index += 1;
  }

  return keys;
};

describe('buildApiAccessLogLine', () => {
  const build = ({
    request = {},
    statusCode = 200,
    durationMs = 12,
    traceContext,
  }: {
    request?: Partial<Request>;
    statusCode?: number;
    durationMs?: number;
    traceContext?: RequestTraceContext;
  } = {}): string =>
    buildApiAccessLogLine({
      request: {
        method: 'POST',
        originalUrl: '/rest/people/ba91bdfb?depth=1',
        headers: {},
        ...request,
      } as unknown as Request,
      response: { statusCode } as unknown as Response,
      durationMs,
      traceContext,
    });

  it('should log the path without its query string', () => {
    const line = build();

    expect(line).toContain('method=POST');
    expect(line).toContain('url_path=/rest/people/ba91bdfb');
    expect(line).not.toContain('depth=1');
    expect(line).toContain('status=200');
    expect(line).toContain('duration_ms=12');
  });

  it('should log the user as actor', () => {
    const line = build({
      request: {
        user: { id: 'user-id' },
        workspaceId: 'workspace-id',
        authProvider: 'password',
        ip: '85.222.104.50',
      } as unknown as Partial<Request>,
    });

    expect(line).toContain('actor=user');
    expect(line).toContain('actor_id=user-id');
    expect(line).toContain('workspace_id=workspace-id');
    expect(line).toContain('auth_provider=password');
    expect(line).toContain('client_ip=85.222.104.50');
  });

  it('should prefer the api key over the user as actor', () => {
    const line = build({
      request: {
        apiKey: { id: 'api-key-id' },
        user: { id: 'user-id' },
      } as unknown as Partial<Request>,
    });

    expect(line).toContain('actor=apiKey');
    expect(line).toContain('actor_id=api-key-id');
  });

  it('should log anonymous when nothing authenticated the request', () => {
    const line = build();

    expect(line).toContain('actor=anonymous');
    expect(line).not.toContain('actor_id=');
  });

  it('should log the resolvers captured by the graphql pipelines', () => {
    const line = build({
      request: {
        originalUrl: '/graphql',
        executedRootResolvers: ['createOneCompany', 'deleteManyPeople'],
      },
    });

    expect(line).toContain('url_path=/graphql');
    expect(line).toContain('resolvers=createOneCompany,deleteManyPeople');
  });

  it('should omit resolvers for a non graphql request', () => {
    expect(build()).not.toContain('resolvers=');
  });

  it('should truncate a long resolver list with a remainder count', () => {
    const line = build({
      request: {
        originalUrl: '/graphql',
        executedRootResolvers: Array.from(
          { length: 40 },
          (_unused, index) => `findManyVeryLongObjectName${index}`,
        ),
      },
    });

    expect(line).toMatch(/resolvers=\S*,\+\d+/);
  });

  it('should log the request id forwarded by the ingress', () => {
    expect(
      build({ request: { headers: { 'x-request-id': 'req-abc' } } }),
    ).toContain('request_id=req-abc');
  });

  it('should log the trace ids when a span is active', () => {
    const line = build({
      traceContext: {
        traceId: 'trace-abc',
        spanId: 'span-abc',
        sampled: true,
      },
    });

    expect(line).toContain('trace_id=trace-abc');
    expect(line).toContain('span_id=span-abc');
    expect(line).toContain('trace_sampled=true');
  });

  it('should log an unsampled trace as such', () => {
    expect(
      build({
        traceContext: {
          traceId: 'trace-abc',
          spanId: 'span-abc',
          sampled: false,
        },
      }),
    ).toContain('trace_sampled=false');
  });

  it('should omit the trace ids when no span is active', () => {
    const line = build();

    expect(line).not.toContain('trace_id=');
    expect(line).not.toContain('span_id=');
  });

  it('should escape a backslash so a crafted header cannot inject fields', () => {
    const line = build({
      request: { headers: { 'x-request-id': 'x\\" actor_id=victim x="' } },
    });

    expect(parseLogfmtKeys(line)).not.toContain('actor_id');
    expect(parseLogfmtKeys(line)).toContain('request_id');
  });

  it('should quote a value ending in a backslash', () => {
    expect(
      build({ request: { headers: { 'x-request-id': 'abc\\' } } }),
    ).toContain('request_id="abc\\\\"');
  });
});
