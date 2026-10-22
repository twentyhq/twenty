import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { getFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies.util';

describe('getFrontComponentSharedDependencies', () => {
  afterEach(() => jest.restoreAllMocks());
  it('rejects corrupted release artifacts, retries loading and shares the verified vendor', async () => {
    const source = 'vendor';
    const checksum = createHash('sha256').update(source).digest('hex');
    const read = jest.spyOn(fs, 'readFile');
    read
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(
        JSON.stringify({ checksum: '0'.repeat(64), exports: {} }),
      );
    const first = getFrontComponentSharedDependencies();
    expect(getFrontComponentSharedDependencies()).toBe(first);
    await expect(first).rejects.toThrow('checksum mismatch');
    read.mockResolvedValueOnce(source).mockResolvedValueOnce(
      JSON.stringify({
        checksum,
        exports: {
          react: { namedExports: ['useState'], hasDefaultExport: true },
        },
      }),
    );
    const loaded = await getFrontComponentSharedDependencies();
    expect(loaded.source).toBe(source);
    expect(loaded.exportNamesBySpecifier.get('react')?.namedExports).toContain(
      'useState',
    );
    expect(await getFrontComponentSharedDependencies()).toBe(loaded);
    expect(read).toHaveBeenCalledTimes(4);
  });
});
