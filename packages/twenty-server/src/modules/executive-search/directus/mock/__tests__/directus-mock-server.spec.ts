import { DirectusMockServer } from 'src/modules/executive-search/directus/mock/directus-mock.server';

describe('DirectusMockServer', () => {
  let server: DirectusMockServer;
  let baseUrl: string;

  beforeAll(async () => {
    server = new DirectusMockServer({
      collections: [
        {
          collection: 'users',
          meta: { hidden: false, singleton: false },
          schema: { name: 'users' },
        },
        {
          collection: 'posts',
          meta: { hidden: false, singleton: false },
          schema: { name: 'posts' },
        },
      ],
      fields: {
        users: [
          {
            collection: 'users',
            field: 'id',
            type: 'integer',
            meta: null,
            schema: { name: 'id', table: 'users', dataType: 'integer' },
          },
          {
            collection: 'users',
            field: 'name',
            type: 'string',
            meta: null,
            schema: { name: 'name', table: 'users', dataType: 'varchar' },
          },
        ],
        posts: [
          {
            collection: 'posts',
            field: 'id',
            type: 'integer',
            meta: null,
            schema: { name: 'id', table: 'posts', dataType: 'integer' },
          },
        ],
      },
      items: {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      },
      serverInfo: { version: '10.10.0', directusVersion: '10.10.0' },
    });

    const port = await server.start();
    baseUrl = server.getBaseUrl();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should respond to auth login', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'pass' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.accessToken).toMatch(/^mock-token-/);
    expect(json.data.expires).toBeGreaterThan(0);
  });

  it('should return server info', async () => {
    const res = await fetch(`${baseUrl}/server/info`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.directusVersion).toBe('10.10.0');
  });

  it('should return collections', async () => {
    const res = await fetch(`${baseUrl}/collections`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(2);
    expect(json.data[0].collection).toBe('users');
  });

  it('should return fields for all collections', async () => {
    const res = await fetch(`${baseUrl}/fields`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(3);
  });

  it('should return fields for a specific collection', async () => {
    const res = await fetch(`${baseUrl}/fields/users`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(2);
  });

  it('should return items for a collection', async () => {
    const res = await fetch(`${baseUrl}/items/users`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(2);
    expect(json.data[0].name).toBe('Alice');
  });

  it('should simulate rate limiting', async () => {
    server.setFixtures({ rateLimited: true });

    const res = await fetch(`${baseUrl}/server/info`);
    expect(res.status).toBe(429);

    server.setFixtures({ rateLimited: false });
  });

  it('should simulate server error', async () => {
    server.setFixtures({ serverError: true });

    const res = await fetch(`${baseUrl}/collections`);
    expect(res.status).toBe(500);

    server.setFixtures({ serverError: false });
  });

  it('should return 404 for unknown routes', async () => {
    const res = await fetch(`${baseUrl}/unknown`);
    expect(res.status).toBe(404);
  });
});
