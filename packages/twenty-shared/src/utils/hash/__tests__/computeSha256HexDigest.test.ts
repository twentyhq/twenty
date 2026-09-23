import { createHash } from 'node:crypto';

import { computeSha256HexDigest } from '@/utils/hash/computeSha256HexDigest';

describe('computeSha256HexDigest', () => {
  it.each([
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ])('returns the known SHA-256 hex digest of %j', (input, expectedDigest) => {
    expect(computeSha256HexDigest(input)).toBe(expectedDigest);
  });

  it('matches node:crypto for non-ASCII input', () => {
    const input = 'export const label = "héllo wörld ✓";';

    expect(computeSha256HexDigest(input)).toBe(
      createHash('sha256').update(input).digest('hex'),
    );
  });
});
