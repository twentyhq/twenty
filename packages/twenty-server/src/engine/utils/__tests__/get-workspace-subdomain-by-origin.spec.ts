import { getWorkspaceSubdomainByOrigin } from 'src/engine/utils/get-workspace-subdomain-by-origin';

describe('getWorkspaceSubdomainByOrigin', () => {
  it('should return subdomain from origin', () => {
    const origin = 'https://subdomain.example.com';
    const result = getWorkspaceSubdomainByOrigin(origin, 'https://example.com');

    expect(result).toBe('subdomain');
  });
  it('should return undefined if origin is not a subdomain', () => {
    const origin = 'https://example.com';
    const result = getWorkspaceSubdomainByOrigin(origin, 'https://example.com');

    expect(result).toBe(undefined);
  });
  it('should return undefined if subdomain is front main domain', () => {
    const origin = 'https://main.example.com';
    const result = getWorkspaceSubdomainByOrigin(
      origin,
      'https://main.example.com',
    );

    expect(result).toBe(undefined);
  });
});
