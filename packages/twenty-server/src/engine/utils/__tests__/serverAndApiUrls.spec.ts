import { ServerUrl, ApiUrl } from 'src/engine/utils/server-and-api-urls';

describe('ServerUrl', () => {
  afterEach(() => {
    // Reset the serverUrl after each test
    ServerUrl.set('');
  });

  test('should throw error when getting uninitialized ServerUrl', () => {
    expect(() => ServerUrl.get()).toThrow(
      'ServerUrl is not initialized. Call set() first.',
    );
  });

  test('should set and get ServerUrl correctly', () => {
    const url = 'http://localhost:3000';

    ServerUrl.set(url);
    expect(ServerUrl.get()).toBe(url);
  });
});

describe('ApiUrl', () => {
  beforeEach(() => {
    // Reset the ServerUrl and apiUrl before each test
    ServerUrl.set('');
    ApiUrl.set('');
  });

  test('should throw error when getting uninitialized ApiUrl', () => {
    expect(() => ApiUrl.get()).toThrow(
      'apiUrl is not initialized. Call set() first.',
    );
  });

  test('should throw error when setting ApiUrl without initializing ServerUrl', () => {
    expect(() => ApiUrl.set()).toThrow(
      'ServerUrl is not initialized. Call set() first.',
    );
  });

  test('should set and get ApiUrl correctly', () => {
    const apiUrl = 'http://api.example.com';

    ApiUrl.set(apiUrl);
    expect(ApiUrl.get()).toBe(apiUrl);
  });

  test('should set ApiUrl to ServerUrl value if no argument is passed', () => {
    const serverUrl = 'http://localhost:3000';

    ServerUrl.set(serverUrl);
    ApiUrl.set(); // Set without argument, it should use ServerUrl.get()
    expect(ApiUrl.get()).toBe(serverUrl);
  });
});
