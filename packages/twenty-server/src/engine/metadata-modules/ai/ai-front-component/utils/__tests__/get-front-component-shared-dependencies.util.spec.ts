import { buildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util';
import { getFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies.util';

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util',
);

describe('getFrontComponentSharedDependencies', () => {
  it('shares concurrent builds and retries a failed build', async () => {
    const built = {
      source: 'vendor',
      checksum: 'checksum',
      exportNamesBySpecifier: new Map(),
    };
    const build = jest.mocked(buildFrontComponentSharedDependencies);

    build
      .mockRejectedValueOnce(new Error('Unable to build dependencies'))
      .mockResolvedValueOnce(built);
    const first = getFrontComponentSharedDependencies();
    const concurrent = getFrontComponentSharedDependencies();

    expect(concurrent).toBe(first);
    await expect(first).rejects.toThrow('Unable to build dependencies');
    await expect(getFrontComponentSharedDependencies()).resolves.toBe(built);
    await expect(getFrontComponentSharedDependencies()).resolves.toBe(built);
    expect(build).toHaveBeenCalledTimes(2);
  });
});
