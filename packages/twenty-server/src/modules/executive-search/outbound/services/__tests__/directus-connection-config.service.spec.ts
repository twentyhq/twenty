import { DirectusConnectionConfigService } from 'src/modules/executive-search/outbound/services/directus-connection-config.service';

describe('DirectusConnectionConfigService', () => {
  let service: DirectusConnectionConfigService;

  beforeEach(() => {
    process.env.DIRECTUS_BASE_URL = 'https://directus.example.com';
    process.env.DIRECTUS_EMAIL = 'admin@example.com';
    process.env.DIRECTUS_PASSWORD = 'supersecret123';
    process.env.DIRECTUS_OUTBOUND_HMAC_SECRET = 'hmac-secret-value';

    service = new DirectusConnectionConfigService();
  });

  afterEach(() => {
    delete process.env.DIRECTUS_BASE_URL;
    delete process.env.DIRECTUS_EMAIL;
    delete process.env.DIRECTUS_PASSWORD;
    delete process.env.DIRECTUS_OUTBOUND_HMAC_SECRET;
  });

  it('should return all four fields when env vars are set', () => {
    const config = service.getConfig();

    expect(config).toEqual({
      baseUrl: 'https://directus.example.com',
      email: 'admin@example.com',
      password: 'supersecret123',
      hmacSecret: 'hmac-secret-value',
    });
  });

  it('should throw when DIRECTUS_BASE_URL is missing', () => {
    delete process.env.DIRECTUS_BASE_URL;

    expect(() => service.getConfig()).toThrow(/baseUrl.*is not set/);
  });

  it('should throw when DIRECTUS_EMAIL is missing', () => {
    delete process.env.DIRECTUS_EMAIL;

    expect(() => service.getConfig()).toThrow(/email.*is not set/);
  });

  it('should throw when DIRECTUS_PASSWORD is missing', () => {
    delete process.env.DIRECTUS_PASSWORD;

    expect(() => service.getConfig()).toThrow(/password.*is not set/);
  });

  it('should throw when DIRECTUS_OUTBOUND_HMAC_SECRET is missing', () => {
    delete process.env.DIRECTUS_OUTBOUND_HMAC_SECRET;

    expect(() => service.getConfig()).toThrow(/hmacSecret.*is not set/);
  });

  it('should not include secret value in thrown error message', () => {
    delete process.env.DIRECTUS_OUTBOUND_HMAC_SECRET;

    try {
      service.getConfig();
      fail('Expected error to be thrown');
    } catch (err) {
      const errorMessage = (err as Error).message;
      expect(errorMessage).not.toContain('hmac-secret-value');
      expect(errorMessage).not.toContain('supersecret123');
    }
  });
});
