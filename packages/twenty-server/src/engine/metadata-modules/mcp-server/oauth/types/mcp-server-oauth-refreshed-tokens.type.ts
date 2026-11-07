import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

export type McpServerOAuthRefreshedTokens = {
  accessToken: PlaintextString;
  refreshToken: PlaintextString;
  accessTokenExpiresAt: Date | null;
};
