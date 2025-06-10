import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';

describe('PromiseMemoizer', () => {
  let memoizer: PromiseMemoizer<string>;
  let originalDateNow: () => number;
  const mockFactory = jest.fn();
  const mockOnDelete = jest.fn();
  const TTL_MS = 1000; // 1 second TTL for testing

  beforeAll(() => {
    // Store the original Date.now function
    originalDateNow = Date.now;
  });

  afterAll(() => {
    // Restore the original Date.now function
    global.Date.now = originalDateNow;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Start with a fixed timestamp
    const currentTimestamp = 1000;

    global.Date.now = jest.fn(() => currentTimestamp);

    memoizer = new PromiseMemoizer<string>(TTL_MS);
  });

  describe('memoizePromiseAndExecute', () => {
    it('should execute factory and cache result', async () => {
      mockFactory.mockResolvedValue('test-value');

      const result = await memoizer.memoizePromiseAndExecute(
        'test-key-1',
        mockFactory,
      );

      expect(result).toBe('test-value');
      expect(mockFactory).toHaveBeenCalledTimes(1);
    });

    it('should return cached value within TTL', async () => {
      mockFactory.mockResolvedValue('test-value');

      await memoizer.memoizePromiseAndExecute('test-key-1', mockFactory);

      // Move time forward but still within TTL
      const currentTime = Date.now();

      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => currentTime + TTL_MS / 2);

      const result = await memoizer.memoizePromiseAndExecute(
        'test-key-1',
        mockFactory,
      );

      expect(result).toBe('test-value');
      expect(mockFactory).toHaveBeenCalledTimes(1);
    });

    it('should re-execute factory after TTL expires', async () => {
      mockFactory.mockResolvedValue('test-value');

      await memoizer.memoizePromiseAndExecute('test-key-1', mockFactory);

      // Move time beyond TTL
      const currentTime = Date.now();

      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => currentTime + TTL_MS + 100);

      const result = await memoizer.memoizePromiseAndExecute(
        'test-key-1',
        mockFactory,
      );

      expect(result).toBe('test-value');
      expect(mockFactory).toHaveBeenCalledTimes(2);
    });

    it('should handle null values', async () => {
      mockFactory.mockResolvedValue(null);

      const result = await memoizer.memoizePromiseAndExecute(
        'test-key-1',
        mockFactory,
      );

      expect(result).toBeNull();
    });

    it('should deduplicate concurrent requests', async () => {
      let resolveFactory: (value: string) => void;
      const factoryPromise = new Promise<string>((resolve) => {
        resolveFactory = resolve;
      });

      mockFactory.mockImplementation(() => factoryPromise);

      const promise1 = memoizer.memoizePromiseAndExecute(
        'test-key-1',
        mockFactory,
      );
      const promise2 = memoizer.memoizePromiseAndExecute(
        'test-key-1',
        mockFactory,
      );

      resolveFactory!('test-value');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('test-value');
      expect(result2).toBe('test-value');
      expect(mockFactory).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearKey', () => {
    it('should clear specific key and call onDelete', async () => {
      mockFactory.mockResolvedValue('test-value');
      await memoizer.memoizePromiseAndExecute('test-key-1', mockFactory);

      await memoizer.clearKey('test-key-1', mockOnDelete);

      const result = await memoizer.memoizePromiseAndExecute(
        'test-key-1',
        mockFactory,
      );

      expect(result).toBe('test-value');
      expect(mockOnDelete).toHaveBeenCalledWith('test-value');
      expect(mockFactory).toHaveBeenCalledTimes(2);
    });

    it('should handle non-existent key', async () => {
      await memoizer.clearKey('non-existent-key-1', mockOnDelete);
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('clearKeys', () => {
    it('should clear all keys with matching prefix', async () => {
      mockFactory.mockResolvedValue('test-value');
      await memoizer.memoizePromiseAndExecute('prefix-key-1', mockFactory);
      await memoizer.memoizePromiseAndExecute('prefix-key-2', mockFactory);
      await memoizer.memoizePromiseAndExecute('other-key-1', mockFactory);

      mockFactory.mockClear();
      await memoizer.clearKeys('prefix-key', mockOnDelete);

      await memoizer.memoizePromiseAndExecute('prefix-key-1', mockFactory);
      await memoizer.memoizePromiseAndExecute('prefix-key-2', mockFactory);
      await memoizer.memoizePromiseAndExecute('other-key-1', mockFactory);

      expect(mockFactory).toHaveBeenCalledTimes(2); // Only prefix keys should be re-executed
      expect(mockOnDelete).toHaveBeenCalledTimes(2); // Only prefix keys should trigger onDelete
    });
  });

  describe('clearAll', () => {
    it('should clear all cached values', async () => {
      mockFactory.mockResolvedValue('test-value');
      await memoizer.memoizePromiseAndExecute('key-1-1', mockFactory);
      await memoizer.memoizePromiseAndExecute('key-1-2', mockFactory);

      mockFactory.mockClear();
      await memoizer.clearAll(mockOnDelete);

      await memoizer.memoizePromiseAndExecute('key-1-1', mockFactory);
      await memoizer.memoizePromiseAndExecute('key-1-2', mockFactory);

      expect(mockOnDelete).toHaveBeenCalledTimes(2);
      expect(mockFactory).toHaveBeenCalledTimes(2);
    });
  });
});
