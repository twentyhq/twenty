import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { buildWorkspaceURL } from 'src/utils/workspace-url.utils';

describe('buildWorkspaceURL', () => {
  it('should build workspace URL with subdomain', () => {
    const baseUrl = 'https://example.com';
    const subdomain = 'subdomain';
    const url = buildWorkspaceURL(baseUrl, { subdomain });

    expect(url.toString()).toBe(`https://${subdomain}.example.com/`);
  });
  it('should build workspace URL with workspace', () => {
    const baseUrl = 'https://example.com';
    const workspace = { subdomain: 'subdomain' } as unknown as Workspace;
    const url = buildWorkspaceURL(baseUrl, { workspace });

    expect(url.toString()).toBe(`https://${workspace.subdomain}.example.com/`);
  });
  it('should build workspace URL with pathname', () => {
    const baseUrl = 'https://example.com';
    const subdomain = 'subdomain';
    const withPathname = '/settings/accounts';
    const url = buildWorkspaceURL(baseUrl, { subdomain }, { withPathname });

    expect(url.toString()).toBe(
      `https://${subdomain}.example.com${withPathname}`,
    );
  });
  it('should build workspace URL with search params', () => {
    const baseUrl = 'https://example.com';
    const subdomain = 'subdomain';
    const withSearchParams = { key: 'value' };
    const url = buildWorkspaceURL(baseUrl, { subdomain }, { withSearchParams });

    expect(url.toString()).toBe(`https://${subdomain}.example.com/?key=value`);
  });
});
