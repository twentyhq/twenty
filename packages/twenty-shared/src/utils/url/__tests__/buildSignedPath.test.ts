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

  it('should build a signed path with multiple dots filename', () => {
    expect(
      buildSignedPath({
        path: 'folder/test.data.12032026.txt',
        token: 'tokenValue',
      }),
    ).toBe('folder/tokenValue/test.data.12032026.txt');
  });

  it('should throw when building signed path with missing filename', () => {
    expect(() =>
      buildSignedPath({
        path: 'folder/',
        token: 'tokenValue',
      }),
    ).toThrow(
      "Filename empty: cannot build signed path from folderPath 'folder/'",
    );
  });

  it('should throw when building signed path with empty path', () => {
    expect(() =>
      buildSignedPath({
        path: '',
        token: 'tokenValue',
      }),
    ).toThrow("Filename empty: cannot build signed path from folderPath ''");
  });

  it('should ignore absolute https urls', () => {
    expect(
      buildSignedPath({
        path: 'https://twentyhq.github.io/placeholder-images/workspaces/twenty-logo.png',
        token: 'tokenValue',
      }),
    ).toBe(
      'https://twentyhq.github.io/placeholder-images/workspaces/twenty-logo.png',
    );
  });

  it('should ignore absolute http urls', () => {
    expect(
      buildSignedPath({
        path: 'http://twentyhq.github.io/placeholder-images/workspaces/twenty-logo.png',
        token: 'tokenValue',
      }),
    ).toBe(
      'http://twentyhq.github.io/placeholder-images/workspaces/twenty-logo.png',
    );
  });
});
