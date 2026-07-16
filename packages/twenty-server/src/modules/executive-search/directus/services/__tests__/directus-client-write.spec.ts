import { DirectusClientService } from 'src/modules/executive-search/directus/services/directus-client.service';
import { DirectusMockServer } from 'src/modules/executive-search/directus/mock/directus-mock.server';

describe('DirectusClientService - write operations', () => {
  let service: DirectusClientService;
  let mockServer: DirectusMockServer;
  let baseUrl: string;

  beforeAll(async () => {
    jest.useRealTimers();
    mockServer = new DirectusMockServer();
    const port = await mockServer.start();
    baseUrl = mockServer.getBaseUrl();
  });

  afterAll(async () => {
    await mockServer.stop();
    jest.useFakeTimers();
  });

  beforeEach(() => {
    mockServer.clearWrites();
    service = new DirectusClientService();
    service.configure(baseUrl);
  });

  const authenticate = async (): Promise<void> => {
    await service.authenticate('test@test.com', 'pass');
  };

  describe('createItem', () => {
    it('should create an item and return it with an id', async () => {
      await authenticate();

      const result = await service.createItem<{
        id: string;
        name: string;
      }>('test_collection', JSON.stringify({ name: 'Test Item' }));

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Item');
    });

    it('should throw when not authenticated', async () => {
      const freshService = new DirectusClientService();
      freshService.configure(baseUrl);

      await expect(
        freshService.createItem('test_collection', JSON.stringify({ name: 'x' })),
      ).rejects.toThrow(
        'Cannot perform write operations before authenticating with Directus',
      );
    });

    it('should propagate 4xx errors from the API', async () => {
      mockServer.setFixtures({
        simulateErrors: {
          status: 422,
          body: JSON.stringify({
            errors: [{ message: 'Unprocessable Entity' }],
          }),
        },
      });

      await authenticate();

      await expect(
        service.createItem('test_collection', JSON.stringify({ name: 'x' })),
      ).rejects.toThrow('Directus API error 422');

      mockServer.setFixtures({});
    });
  });

  describe('updateItem', () => {
    it('should update an item and return the updated data', async () => {
      await authenticate();

      const result = await service.updateItem<{
        id: string;
        name: string;
      }>('test_collection', 'item-123', JSON.stringify({ name: 'Updated' }));

      expect(result).toBeDefined();
      expect(result.id).toBe('item-123');
      expect(result.name).toBe('Updated');
    });

    it('should throw when not authenticated', async () => {
      const freshService = new DirectusClientService();
      freshService.configure(baseUrl);

      await expect(
        freshService.updateItem('test_collection', 'x', JSON.stringify({})),
      ).rejects.toThrow(
        'Cannot perform write operations before authenticating with Directus',
      );
    });

    it('should propagate 4xx errors from the API', async () => {
      mockServer.setFixtures({
        simulateErrors: {
          status: 404,
          body: JSON.stringify({
            errors: [{ message: 'Not Found' }],
          }),
        },
      });

      await authenticate();

      await expect(
        service.updateItem('test_collection', 'nonexistent', JSON.stringify({})),
      ).rejects.toThrow('Directus API error 404');

      mockServer.setFixtures({});
    });
  });

  describe('deleteItem', () => {
    it('should resolve without error on successful delete', async () => {
      await authenticate();

      await expect(
        service.deleteItem('test_collection', 'item-123'),
      ).resolves.toBeUndefined();
    });

    it('should throw when not authenticated', async () => {
      const freshService = new DirectusClientService();
      freshService.configure(baseUrl);

      await expect(
        freshService.deleteItem('test_collection', 'x'),
      ).rejects.toThrow(
        'Cannot perform write operations before authenticating with Directus',
      );
    });

    it('should propagate 4xx errors from the API', async () => {
      mockServer.setFixtures({
        simulateErrors: {
          status: 404,
          body: JSON.stringify({
            errors: [{ message: 'Not Found' }],
          }),
        },
      });

      await authenticate();

      await expect(
        service.deleteItem('test_collection', 'nonexistent'),
      ).rejects.toThrow('Directus API error 404');

      mockServer.setFixtures({});
    });
  });

  describe('custom headers', () => {
    it('should pass signature header to the mock server', async () => {
      await authenticate();

      await service.createItem(
        'test_collection',
        JSON.stringify({ name: 'Signed' }),
        { 'X-Twenty-Directus-Signature': 'test-signature-value' },
      );

      const writes = mockServer.getReceivedWrites();
      expect(writes).toHaveLength(1);
      expect(
        writes[0].headers['x-twenty-directus-signature'],
      ).toBe('test-signature-value');
    });
  });
});
