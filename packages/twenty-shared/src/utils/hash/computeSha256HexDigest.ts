import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

export const computeSha256HexDigest = (input: string): string =>
  bytesToHex(sha256(utf8ToBytes(input)));
