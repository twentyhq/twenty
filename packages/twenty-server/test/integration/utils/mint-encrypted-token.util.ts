import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

// SecretEncryptionService is a class-token provider, unreachable from a spec via global.app
// (module-realm split). It only needs `get(key)`, so build it by hand off process.env —
// same APP_SECRET the app uses, so the pipeline decrypts the result for free.
export const mintEncryptedToken = (
  plaintext: string,
  workspaceId: string,
): EncryptedString =>
  new SecretEncryptionService({
    get: (key: string) => process.env[key],
  } as EnvironmentConfigDriver).encryptVersioned(plaintext as PlaintextString, {
    workspaceId,
  });
