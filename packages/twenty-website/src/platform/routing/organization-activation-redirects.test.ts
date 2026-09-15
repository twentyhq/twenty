import { type NextConfig } from 'next';
import { pathToRegexp } from 'next/dist/compiled/path-to-regexp';

import nextConfig from '../../../next.config';

jest.mock('@opennextjs/cloudflare', () => ({
  initOpenNextCloudflareForDev: jest.fn(),
}));
jest.mock('next-with-linaria', () => ({
  __esModule: true,
  default: (config: NextConfig) => config,
}));

describe('Organization activation redirects', () => {
  it.each([
    ['/enterprise/activate', '/organization/activate'],
    ['/fr/enterprise/activate', '/fr/organization/activate'],
    ['/ja/enterprise/activate', '/ja/organization/activate'],
  ])('redirects %s to %s', async (source, expectedDestination) => {
    const redirects = await nextConfig.redirects!();
    const redirect = redirects.find(
      (candidate) =>
        !candidate.has && pathToRegexp(candidate.source).test(source),
    );

    expect(redirect).toBeDefined();
    expect(redirect?.permanent).toBe(true);

    const keys: { name: string | number }[] = [];
    const match = pathToRegexp(redirect!.source, keys).exec(source)!;
    const destination = keys.reduce(
      (path, key, index) => path.replace(`:${key.name}`, match[index + 1]),
      redirect!.destination,
    );

    expect(destination).toBe(expectedDestination);
  });
});
