import { ACCOUNT_TYPES, type AccountType } from 'twenty-shared/constants';
import { type DataSource } from 'typeorm';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { runSecretEncryptionRotationCommand } from 'test/integration/secret-encryption/utils/run-secret-encryption-rotation-command.util';
import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { type EncryptedImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const V2_ENVELOPE_REGEX = /^enc:v2:[0-9a-f]{8}:[A-Za-z0-9+/=]+$/;

const HANDLE = 'rotate-connection-parameters@example.com';
const IMAP_PASSWORD = 'rotation-test-imap-password';
const SMTP_PASSWORD = 'rotation-test-smtp-password';
const CALDAV_PASSWORD = 'rotation-test-caldav-password';

type ConnectionParametersRow = {
  workspaceId: string;
  connectionParameters: EncryptedImapSmtpCaldavParams;
};

const readConnectionParameters = async (
  dataSource: DataSource,
  connectedAccountId: string,
): Promise<ConnectionParametersRow> => {
  const [row] = (await dataSource.query(
    `SELECT "workspaceId", "connectionParameters"
       FROM "core"."connectedAccount"
      WHERE id = $1`,
    [connectedAccountId],
  )) as ConnectionParametersRow[];

  expect(row).toBeDefined();
  expect(row.connectionParameters).toBeDefined();

  return row;
};

const expectAllPasswordsDecryptTo = ({
  row,
  secretEncryption,
  expectedPlaintextByProtocol,
}: {
  row: ConnectionParametersRow;
  secretEncryption: SecretEncryptionService;
  expectedPlaintextByProtocol: Record<AccountType, string>;
}): void => {
  for (const protocol of ACCOUNT_TYPES) {
    const params = row.connectionParameters[protocol];

    expect(params).toBeDefined();
    expect(params?.password).toMatch(V2_ENVELOPE_REGEX);

    const decrypted = secretEncryption.decryptVersioned(
      params!.password,
      {
        workspaceId: row.workspaceId,
      },
    );

    expect(decrypted).toBe(expectedPlaintextByProtocol[protocol]);
  }
};

describe('secret-encryption:rotate command — connection-parameters site (integration)', () => {
  let dataSource: DataSource;
  let secretEncryption: SecretEncryptionService;
  let connectedAccountId: string;

  beforeAll(async () => {
    dataSource = global.testDataSource;
    secretEncryption = buildSecretEncryptionServiceFromEnv();

    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        handle: HANDLE,
        connectionParameters: {
          IMAP: {
            host: 'imap.fastmail.com',
            port: 993,
            username: 'rotation@example.com',
            password: IMAP_PASSWORD,
            secure: true,
          },
          SMTP: {
            host: 'smtp.fastmail.com',
            port: 465,
            username: 'rotation@example.com',
            password: SMTP_PASSWORD,
            secure: true,
          },
          CALDAV: {
            host: 'caldav.fastmail.com',
            port: 443,
            username: 'rotation@example.com',
            password: CALDAV_PASSWORD,
            secure: true,
          },
        },
      },
    });

    connectedAccountId = data.connectedAccountId as string;
  }, 120000);

  afterAll(async () => {
    if (connectedAccountId !== undefined) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      });
    }
  });

  it('keeps every protocol password decryptable after running the rotation', async () => {
    const beforeRotation = await readConnectionParameters(
      dataSource,
      connectedAccountId,
    );

    expectAllPasswordsDecryptTo({
      row: beforeRotation,
      secretEncryption,
      expectedPlaintextByProtocol: {
        IMAP: IMAP_PASSWORD,
        SMTP: SMTP_PASSWORD,
        CALDAV: CALDAV_PASSWORD,
      },
    });

    await runSecretEncryptionRotationCommand();

    const afterRotation = await readConnectionParameters(
      dataSource,
      connectedAccountId,
    );

    expectAllPasswordsDecryptTo({
      row: afterRotation,
      secretEncryption,
      expectedPlaintextByProtocol: {
        IMAP: IMAP_PASSWORD,
        SMTP: SMTP_PASSWORD,
        CALDAV: CALDAV_PASSWORD,
      },
    });

    expect(afterRotation.connectionParameters.IMAP?.host).toBe(
      'imap.fastmail.com',
    );
    expect(afterRotation.connectionParameters.SMTP?.port).toBe(465);
    expect(afterRotation.connectionParameters.CALDAV?.username).toBe(
      'rotation@example.com',
    );
  }, 90000);

  it('is idempotent when targeting only the connection-parameters site', async () => {
    await runSecretEncryptionRotationCommand({
      site: 'connected-account-connection-parameters',
    });
    await runSecretEncryptionRotationCommand({
      site: 'connected-account-connection-parameters',
    });

    const row = await readConnectionParameters(dataSource, connectedAccountId);

    expectAllPasswordsDecryptTo({
      row,
      secretEncryption,
      expectedPlaintextByProtocol: {
        IMAP: IMAP_PASSWORD,
        SMTP: SMTP_PASSWORD,
        CALDAV: CALDAV_PASSWORD,
      },
    });
  }, 120000);
});
