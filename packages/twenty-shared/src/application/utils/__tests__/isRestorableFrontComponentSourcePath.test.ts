import { isRestorableFrontComponentSourcePath } from '@/application/utils/isRestorableFrontComponentSourcePath';

describe('isRestorableFrontComponentSourcePath', () => {
  it.each(['component.tsx', 'src/components/component.ts'])(
    'accepts %s',
    (path) => {
      expect(isRestorableFrontComponentSourcePath(path)).toBe(true);
    },
  );
  it.each([
    '../escape.tsx',
    '/escape.tsx',
    'C:/escape.tsx',
    'c:escape.tsx',
    'node_modules/component.tsx',
    'src/../../escape.tsx',
    'src/./component.tsx',
    'src//component.tsx',
    'src/extra.d.ts',
    '.twenty/component.tsx',
    'dist/component.tsx',
    'src\\component.tsx',
    'src/component.js',
  ])('rejects %s', (path) => {
    expect(isRestorableFrontComponentSourcePath(path)).toBe(false);
  });
});
