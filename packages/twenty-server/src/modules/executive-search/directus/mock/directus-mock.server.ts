import http from 'http';

/**
 * Lightweight Directus mock server for contract tests.
 *
 * Mimics the Directus REST API surface needed by the adapter:
 * - Auth login
 * - Server info
 * - Collections list
 * - Fields per collection
 * - Items per collection
 *
 * Configurable via fixtures so tests can simulate valid, invalid,
 * stale, rate-limited, and unknown-version responses.
 */
export class DirectusMockServer {
  private server: http.Server | null = null;
  private port: number = 0;
  private fixtures: DirectusMockFixtures;

  constructor(fixtures: DirectusMockFixtures = {}) {
    this.fixtures = fixtures;
  }

  /**
   * Start the mock server on a random available port.
   */
  async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(0, '127.0.0.1', () => {
        const addr = this.server!.address() as { port: number };
        this.port = addr.port;
        resolve(this.port);
      });

      this.server.on('error', reject);
    });
  }

  /**
   * Stop the mock server.
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Get the base URL for this mock server.
   */
  getBaseUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }

  /**
   * Update fixtures at runtime (useful for testing error responses).
   */
  setFixtures(fixtures: DirectusMockFixtures): void {
    this.fixtures = fixtures;
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '/';
    const method = req.method || 'GET';

    // Simulate rate limiting
    if (this.fixtures.rateLimited) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          errors: [{ message: 'Too Many Requests', extensions: { code: 'RATE_LIMITED' } }],
        }),
      );
      return;
    }

    // Simulate server error
    if (this.fixtures.serverError) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ errors: [{ message: 'Internal Server Error' }] }));
      return;
    }

    // Auth login
    if (url === '/auth/login' && method === 'POST') {
      this.collectBody(req).then(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            data: {
              accessToken: 'mock-token-' + Date.now(),
              expires: 900000,
              refreshToken: 'mock-refresh',
            },
          }),
        );
      });
      return;
    }

    // Server info
    if (url === '/server/info' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          data: this.fixtures.serverInfo || this.defaultServerInfo(),
        }),
      );
      return;
    }

    // Collections
    if (url === '/collections' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          data: this.fixtures.collections || [],
        }),
      );
      return;
    }

    // Fields (per collection) — /fields/:collection
    const fieldsMatch = url.match(/^\/fields\/(.+)$/);
    if (fieldsMatch && method === 'GET') {
      const collection = decodeURIComponent(fieldsMatch[1]);
      const collectionFields = this.fixtures.fields?.[collection] || [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: collectionFields }));
      return;
    }

    // Items — /items/:collection
    const itemsMatch = url.match(/^\/items\/([^?]+)/);
    if (itemsMatch && method === 'GET') {
      const collection = decodeURIComponent(itemsMatch[1]);
      const items = this.fixtures.items?.[collection] || [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: items }));
      return;
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ errors: [{ message: 'Not Found' }] }));
  }

  private collectBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => resolve(body));
    });
  }

  private defaultServerInfo() {
    return {
      version: '10.10.0',
      directusVersion: '10.10.0',
      projectName: 'Mock Directus',
      projectUrl: null,
      projectColor: null,
      projectLogo: null,
      nodeVersion: 'v20.0.0',
      nodeUptime: 3600,
      osType: 'Linux',
      osVersion: '5.15.0',
      osUptime: 86400,
      osTotalmem: 16000000000,
    };
  }
}

export interface DirectusMockFixtures {
  serverInfo?: Record<string, unknown>;
  collections?: Record<string, unknown>[];
  fields?: Record<string, Record<string, unknown>[]>;
  items?: Record<string, Record<string, unknown>[]>;
  rateLimited?: boolean;
  serverError?: boolean;
}
