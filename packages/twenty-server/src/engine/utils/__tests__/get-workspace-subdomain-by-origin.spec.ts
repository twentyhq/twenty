import { getWorkspaceSubdomainByOrigin } from 'src/engine/utils/get-workspace-subdomain-by-origin';

describe('getWorkspaceSubdomainByOrigin', () => {
  it('should return subdomain from origin', () => {
    const origin = 'https://subdomain.example.com';
    const result = getWorkspaceSubdomainByOrigin(origin);

    expect(result).toBe('subdomain');
  });
  it('should return undefined if origin is not a subdomain', () => {
    const origin = 'https://example.com';
    const result = getWorkspaceSubdomainByOrigin(origin);

    expect(result).toBe(undefined);
  });
  it('should return undefined if subdomain is app', () => {
    const origin = 'https://app.example.com';
    const result = getWorkspaceSubdomainByOrigin(origin);

    expect(result).toBe(undefined);
  });
});
