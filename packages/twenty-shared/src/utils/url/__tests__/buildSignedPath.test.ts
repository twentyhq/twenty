import { buildSignedPath } from '@/utils';

describe('buildSignedPath', () => {
  it('should build a signed path', () => {
    expect(
      buildSignedPath({ path: 'folder/test.txt', token: 'tokenValue' }),
    ).toBe('folder/tokenValue/test.txt');
  });

  it('should build a signed path with original subFolder', () => {
    expect(
      buildSignedPath({
        path: 'folder/original/test.txt',
        token: 'tokenValue',
      }),
    ).toBe('folder/original/tokenValue/test.txt');
  });
});
