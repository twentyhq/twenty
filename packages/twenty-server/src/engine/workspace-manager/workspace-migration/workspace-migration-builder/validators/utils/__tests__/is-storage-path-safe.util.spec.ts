import { isStoragePathSafe } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-storage-path-safe.util';

describe('isStoragePathSafe', () => {
  it('should accept valid relative paths', () => {
    expect(isStoragePathSafe('components/my-component.tsx')).toBe(true);
    expect(isStoragePathSafe('my-component.tsx')).toBe(true);
    expect(isStoragePathSafe('a/b/c/component.js')).toBe(true);
  });

  it('should reject paths with .. traversal segments', () => {
    expect(isStoragePathSafe('../etc/passwd')).toBe(false);
    expect(isStoragePathSafe('../../secret')).toBe(false);
    expect(isStoragePathSafe('folder/../../etc/passwd')).toBe(false);
    expect(isStoragePathSafe('..')).toBe(false);
    expect(isStoragePathSafe('a/b/../../../outside')).toBe(false);
  });

  it('should reject absolute paths', () => {
    expect(isStoragePathSafe('/etc/passwd')).toBe(false);
    expect(isStoragePathSafe('/tmp/file.txt')).toBe(false);
  });

  it('should reject paths with null bytes', () => {
    expect(isStoragePathSafe('file\0.txt')).toBe(false);
    expect(isStoragePathSafe('folder/\0/file.txt')).toBe(false);
  });

  it('should accept paths with dots that are not traversal', () => {
    expect(isStoragePathSafe('.hidden-file')).toBe(true);
    expect(isStoragePathSafe('folder/.gitignore')).toBe(true);
    expect(isStoragePathSafe('file.name.ext')).toBe(true);
  });
});
