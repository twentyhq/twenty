import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

// Variables are only declared by a manifest sync, so tests insert the row
// directly with a value encrypted the way the server does it.
export const insertApplicationRegistrationVariable = async ({
  applicationRegistrationId,
  key,
  value,
  isSecret = true,
}: {
  applicationRegistrationId: string;
  key: string;
  value: string;
  isSecret?: boolean;
}): Promise<string> => {
  const encryptedValue = getAppProviderByClassName<SecretEncryptionService>(
    'SecretEncryptionService',
  ).encryptVersioned(value as PlaintextString);

  const [row] = await globalThis.testDataSource.query(
    `INSERT INTO core."applicationRegistrationVariable"
      ("applicationRegistrationId", key, "encryptedValue", "isSecret")
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [applicationRegistrationId, key, encryptedValue, isSecret],
  );

  return row.id;
};
