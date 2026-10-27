import { sha512 } from '@noble/hashes/sha2';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

export const computeDependencyFileChecksum = (content: string): string =>
  bytesToHex(sha512(utf8ToBytes(content))).slice(0, 32);
