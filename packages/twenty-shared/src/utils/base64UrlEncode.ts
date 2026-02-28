// RFC 4648 base64url encoding (URL-safe, no padding)
export const base64UrlEncode = (buffer: Buffer): string =>
  buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
