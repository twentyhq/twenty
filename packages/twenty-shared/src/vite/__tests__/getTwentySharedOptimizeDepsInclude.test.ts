import { getTwentySharedOptimizeDepsInclude } from '@/vite/getTwentySharedOptimizeDepsInclude';

describe('getTwentySharedOptimizeDepsInclude', () => {
  it('lists every subpath except the root and build tooling entries', () => {
    expect(
      getTwentySharedOptimizeDepsInclude({
        '.': {},
        './front-component-build': {},
        './i18n': {},
        './utils': {},
        './vite': {},
      }),
    ).toEqual(['twenty-shared/i18n', 'twenty-shared/utils']);
  });
});
