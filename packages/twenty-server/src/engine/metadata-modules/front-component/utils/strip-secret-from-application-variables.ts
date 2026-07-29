import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';

export const stripSecretFromApplicationVariables = (
  flatApplicationVariables: FlatApplicationVariable[],
  secretEncryptionService: SecretEncryptionService,
): Record<string, string> => {
  return flatApplicationVariables.reduce<Record<string, string>>(
    (acc, flatApplicationVariable) => {
      if (flatApplicationVariable.isSecret) {
        return acc;
      }

      const value = String(flatApplicationVariable.value ?? '');

      acc[flatApplicationVariable.key] = value.startsWith(
        SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
      )
        ? secretEncryptionService.decryptVersioned(value, {
            workspaceId: flatApplicationVariable.workspaceId,
          })
        : value;

      return acc;
    },
    {},
  );
};
