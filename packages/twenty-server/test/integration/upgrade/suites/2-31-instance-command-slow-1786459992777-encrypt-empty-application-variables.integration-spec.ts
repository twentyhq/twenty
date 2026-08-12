import crypto from 'crypto';

import { config } from 'dotenv';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

import { EncryptEmptyApplicationVariablesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-31/2-31-instance-command-slow-1786459992777-encrypt-empty-application-variables';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const TEST_REGISTRATION_NAME_PREFIX = 'encrypt-empty-app-var-test-';

const CONSTRAINTS = [
  {
    tableName: 'applicationVariable',
    constraintName: 'CHK_applicationVariable_value_encrypted',
    constraintExpr: `"value" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%'`,
  },
  {
    tableName: 'applicationRegistrationVariable',
    constraintName:
      'CHK_applicationRegistrationVariable_encryptedValue_encrypted',
    constraintExpr: `"encryptedValue" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%'`,
  },
] as const;

const dropCheckConstraints = async (dataSource: DataSource): Promise<void> => {
  for (const { tableName, constraintName } of CONSTRAINTS) {
    await dataSource.query(
      `ALTER TABLE "core"."${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}"`,
    );
  }
};

const restoreCheckConstraints = async (
  dataSource: DataSource,
): Promise<void> => {
  await dropCheckConstraints(dataSource);
  for (const { tableName, constraintName, constraintExpr } of CONSTRAINTS) {
    await dataSource.query(
      `ALTER TABLE "core"."${tableName}" ADD CONSTRAINT "${constraintName}" CHECK (${constraintExpr})`,
    );
  }
};

describe('2-31 slow instance command 1786459992777 - EncryptEmptyApplicationVariablesSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let secretEncryptionService: SecretEncryptionService;
  let command: EncryptEmptyApplicationVariablesSlowInstanceCommand;
  let workspaceId: string;
  let applicationId: string;
  let registrationId: string;
  const seededApplicationVariableIds: string[] = [];
  const seededRegistrationVariableIds: string[] = [];

  const seedApplicationVariable = async (value: string): Promise<string> => {
    await dropCheckConstraints(dataSource);

    const id = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."applicationVariable"
         (id, "universalIdentifier", "applicationId", "workspaceId",
          "key", "value", "isSecret")
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [id, crypto.randomUUID(), applicationId, workspaceId, `KEY_${id}`, value],
    );

    seededApplicationVariableIds.push(id);

    return id;
  };

  const seedRegistrationVariable = async (
    encryptedValue: string,
  ): Promise<string> => {
    await dropCheckConstraints(dataSource);

    const id = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."applicationRegistrationVariable"
         (id, "applicationRegistrationId", "key", "encryptedValue",
          "isSecret", "isRequired")
       VALUES ($1, $2, $3, $4, true, false)`,
      [id, registrationId, `KEY_${id}`, encryptedValue],
    );

    seededRegistrationVariableIds.push(id);

    return id;
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [
        'src/engine/core-modules/**/*.entity.ts',
        'src/engine/metadata-modules/**/*.entity.ts',
      ],
      synchronize: false,
    });
    await dataSource.initialize();

    secretEncryptionService = buildSecretEncryptionServiceFromEnv();
    command = new EncryptEmptyApplicationVariablesSlowInstanceCommand(
      secretEncryptionService,
    );

    const [seedWorkspace] = await dataSource.query(
      `SELECT id, "workspaceCustomApplicationId"
         FROM "core"."workspace"
        WHERE "workspaceCustomApplicationId" IS NOT NULL
        LIMIT 1`,
    );

    if (!isDefined(seedWorkspace)) {
      throw new Error(
        'No seeded workspace with a custom application found; run database:reset before the integration suite.',
      );
    }

    workspaceId = seedWorkspace.id as string;
    applicationId = seedWorkspace.workspaceCustomApplicationId as string;

    registrationId = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."applicationRegistration"
         (id, "universalIdentifier", name, "oAuthClientId",
          "oAuthRedirectUris", "oAuthScopes", "workspaceId", "sourceType")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'local')`,
      [
        registrationId,
        crypto.randomUUID(),
        `${TEST_REGISTRATION_NAME_PREFIX}${registrationId}`,
        crypto.randomUUID(),
        ['http://localhost:3000/callback'],
        ['read'],
        workspaceId,
      ],
    );
  }, 30000);

  afterEach(async () => {
    if (seededApplicationVariableIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."applicationVariable" WHERE id = ANY($1::uuid[])`,
        [seededApplicationVariableIds],
      );
      seededApplicationVariableIds.length = 0;
    }
    if (seededRegistrationVariableIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."applicationRegistrationVariable" WHERE id = ANY($1::uuid[])`,
        [seededRegistrationVariableIds],
      );
      seededRegistrationVariableIds.length = 0;
    }
    await restoreCheckConstraints(dataSource);
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM "core"."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );
    await dataSource?.destroy();
  });

  it('encrypts empty values in both tables with their own encryption scope', async () => {
    const applicationVariableId = await seedApplicationVariable('');
    const registrationVariableId = await seedRegistrationVariable('');

    await command.runDataMigration(dataSource);

    const [applicationVariableRow] = await dataSource.query(
      `SELECT "value" FROM "core"."applicationVariable" WHERE id = $1`,
      [applicationVariableId],
    );

    expect(
      applicationVariableRow.value.startsWith(
        SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
      ),
    ).toBe(true);
    expect(
      secretEncryptionService.decryptVersionedOrThrow(
        applicationVariableRow.value,
        { workspaceId },
      ),
    ).toBe('');

    const [registrationVariableRow] = await dataSource.query(
      `SELECT "encryptedValue" FROM "core"."applicationRegistrationVariable" WHERE id = $1`,
      [registrationVariableId],
    );

    expect(
      registrationVariableRow.encryptedValue.startsWith(
        SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
      ),
    ).toBe(true);
    expect(
      secretEncryptionService.decryptVersionedOrThrow(
        registrationVariableRow.encryptedValue,
      ),
    ).toBe('');
  });
});
