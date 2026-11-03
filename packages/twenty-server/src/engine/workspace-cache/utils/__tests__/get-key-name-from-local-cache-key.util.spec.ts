import { getKeyNameFromLocalCacheKey } from 'src/engine/workspace-cache/utils/get-key-name-from-local-cache-key.util';

describe('getKeyNameFromLocalCacheKey', () => {
  it('reads the key name of an unversioned key', () => {
    expect(
      getKeyNameFromLocalCacheKey('flatObjectMetadataMaps:workspace-id'),
    ).toBe('flatObjectMetadataMaps');
  });

  it('reads the key name of a versioned key', () => {
    expect(
      getKeyNameFromLocalCacheKey('rolesPermissions:v2:workspace-id'),
    ).toBe('rolesPermissions');
  });
});
