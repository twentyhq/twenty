import { randomUUID } from 'node:crypto';

import { type DataSource } from 'typeorm';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type CanonicalizeEmailDomainsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790082600000-canonicalize-email-domains.command';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const EMAIL_PREFIX = `upgrade-email-${randomUUID()}`;

type StoredEmails = {
  emailsPrimaryEmail: string;
  emailsAdditionalEmails: string[] | null;
};

describe('CanonicalizeEmailDomainsCommand (integration)', () => {
  let command: CanonicalizeEmailDomainsCommand;
  let dataSource: DataSource;
  const createdPersonIds: string[] = [];

  const createPerson = async (email: string): Promise<string> => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { emails: { primaryEmail: email } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const id = response.body.data.createPerson.id as string;

    createdPersonIds.push(id);

    return id;
  };

  const readEmails = async (id: string): Promise<StoredEmails> => {
    const [row] = await dataSource.query<StoredEmails[]>(
      `SELECT "emailsPrimaryEmail", "emailsAdditionalEmails"
       FROM "${SCHEMA_NAME}"."person" WHERE "id" = $1`,
      [id],
    );

    return row;
  };

  const runCommand = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
      dataSource,
    });

  beforeAll(() => {
    command = getAppProviderByClassName<CanonicalizeEmailDomainsCommand>(
      'CanonicalizeEmailDomainsCommand',
    );
    dataSource =
      getCoreRepository<FieldMetadataEntity>(FieldMetadataEntity).manager
        .connection;
  });

  afterAll(async () => {
    if (createdPersonIds.length === 0) {
      return;
    }

    await dataSource.query(
      `DELETE FROM "${SCHEMA_NAME}"."person" WHERE "id" = ANY($1::uuid[])`,
      [createdPersonIds],
    );
  });

  it('backfills legacy primary and additional emails and honors dry run', async () => {
    const id = await createPerson(`${EMAIL_PREFIX}-old@example.com`);

    await dataSource.query(
      `UPDATE "${SCHEMA_NAME}"."person"
       SET "emailsPrimaryEmail" = $1,
           "emailsAdditionalEmails" = $2::jsonb
       WHERE "id" = $3`,
      [
        `${EMAIL_PREFIX}@💩。LA.`,
        JSON.stringify([`${EMAIL_PREFIX}-other@München．DE.`]),
        id,
      ],
    );

    await runCommand(true);
    expect((await readEmails(id)).emailsPrimaryEmail).toBe(
      `${EMAIL_PREFIX}@💩。LA.`,
    );

    await runCommand();

    expect(await readEmails(id)).toEqual({
      emailsPrimaryEmail: `${EMAIL_PREFIX}@xn--ls8h.la`,
      emailsAdditionalEmails: [`${EMAIL_PREFIX}-other@xn--mnchen-3ya.de`],
    });

    await runCommand();
    expect((await readEmails(id)).emailsPrimaryEmail).toBe(
      `${EMAIL_PREFIX}@xn--ls8h.la`,
    );
  });

  it('reports canonical primary collisions before changing either record', async () => {
    const firstId = await createPerson(`${EMAIL_PREFIX}-first@example.com`);
    const secondId = await createPerson(`${EMAIL_PREFIX}-second@example.com`);

    await dataSource.query(
      `UPDATE "${SCHEMA_NAME}"."person"
       SET "emailsPrimaryEmail" = CASE WHEN "id" = $1 THEN $3 ELSE $4 END
       WHERE "id" IN ($1, $2)`,
      [
        firstId,
        secondId,
        `${EMAIL_PREFIX}-collision@💩.la`,
        `${EMAIL_PREFIX}-collision@xn--ls8h.la`,
      ],
    );

    await expect(runCommand()).rejects.toThrow(
      `Canonical email collision in workspace ${SEED_APPLE_WORKSPACE_ID}`,
    );
    expect((await readEmails(firstId)).emailsPrimaryEmail).toBe(
      `${EMAIL_PREFIX}-collision@💩.la`,
    );
    expect((await readEmails(secondId)).emailsPrimaryEmail).toBe(
      `${EMAIL_PREFIX}-collision@xn--ls8h.la`,
    );
  });
});
