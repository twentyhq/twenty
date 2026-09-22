import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { type NormalizeEmailDomainsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790089846053-normalize-email-domains.command';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const PERSON_TABLE = `"${SCHEMA_NAME}"."person"`;
const INACTIVE_OBJECT_NAME = 'emailNormalizationUpgradeObject';
const INACTIVE_OBJECT_TABLE = `"${SCHEMA_NAME}"."_${INACTIVE_OBJECT_NAME}"`;

type StoredEmails = {
  primaryEmail: string | null;
  additionalEmails: string[] | null;
};

jest.setTimeout(120_000);

describe('NormalizeEmailDomainsCommand (integration)', () => {
  let dataSource: DataSource;
  let command: NormalizeEmailDomainsCommand;
  let inactiveFieldId: string | undefined;
  let inactiveObjectId: string | undefined;
  const createdPersonIds: string[] = [];
  const createdInactiveObjectRecordIds: string[] = [];

  const runCommand = async (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
      dataSource,
    });

  const createPerson = async (id = randomUUID()): Promise<string> => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: {
          id,
          emails: { primaryEmail: `${id}@example.com` },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    createdPersonIds.push(id);

    return id;
  };

  const readEmails = async (
    table: string,
    primaryColumn: string,
    additionalColumn: string,
    id: string,
  ): Promise<StoredEmails> => {
    const [row] = await dataSource.query<StoredEmails[]>(
      `SELECT "${primaryColumn}" AS "primaryEmail",
              "${additionalColumn}" AS "additionalEmails"
       FROM ${table}
       WHERE "id" = $1`,
      [id],
    );

    if (!row) {
      throw new Error(`Record ${id} was not found in ${table}`);
    }

    return row;
  };

  const setStoredEmails = async (
    table: string,
    primaryColumn: string,
    additionalColumn: string,
    id: string,
    emails: StoredEmails,
  ) =>
    dataSource.query(
      `UPDATE ${table}
       SET "${primaryColumn}" = $2,
           "${additionalColumn}" = $3::jsonb
       WHERE "id" = $1`,
      [id, emails.primaryEmail, JSON.stringify(emails.additionalEmails)],
    );

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });

    await dataSource.initialize();
    command = getAppProviderByClassName<NormalizeEmailDomainsCommand>(
      'NormalizeEmailDomainsCommand',
    );
  });

  afterAll(async () => {
    await deleteRecordsByIds('person', createdPersonIds);
    await deleteRecordsByIds(
      `_${INACTIVE_OBJECT_NAME}`,
      createdInactiveObjectRecordIds,
    );

    if (inactiveFieldId) {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: inactiveFieldId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: inactiveFieldId },
      });
    }

    if (inactiveObjectId) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: inactiveObjectId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: inactiveObjectId },
      });
    }

    await dataSource.destroy();
  });

  it('backfills primary and additional emails, honors dry run, and is idempotent', async () => {
    const personId = await createPerson();
    const legacyEmails = {
      primaryEmail: `User-${personId}@XN--LS8H.LA`,
      additionalEmails: [`Alias-${personId}@MÜNCHEN。DE.`],
    };

    await setStoredEmails(
      PERSON_TABLE,
      'emailsPrimaryEmail',
      'emailsAdditionalEmails',
      personId,
      legacyEmails,
    );

    await runCommand(true);
    expect(
      await readEmails(
        PERSON_TABLE,
        'emailsPrimaryEmail',
        'emailsAdditionalEmails',
        personId,
      ),
    ).toEqual(legacyEmails);

    await runCommand();
    const canonicalEmails = {
      primaryEmail: `user-${personId}@💩.la`,
      additionalEmails: [`alias-${personId}@münchen.de`],
    };

    expect(
      await readEmails(
        PERSON_TABLE,
        'emailsPrimaryEmail',
        'emailsAdditionalEmails',
        personId,
      ),
    ).toEqual(canonicalEmails);

    await runCommand();
    expect(
      await readEmails(
        PERSON_TABLE,
        'emailsPrimaryEmail',
        'emailsAdditionalEmails',
        personId,
      ),
    ).toEqual(canonicalEmails);
  });

  it('preserves a primary email when its Unicode spelling already exists', async () => {
    const basePersonId = randomUUID().slice(0, -1);
    const legacyPersonId = await createPerson(`${basePersonId}1`);
    const unicodePersonId = await createPerson(`${basePersonId}2`);
    const localPart = randomUUID();

    await setStoredEmails(
      PERSON_TABLE,
      'emailsPrimaryEmail',
      'emailsAdditionalEmails',
      legacyPersonId,
      {
        primaryEmail: `${localPart}@xn--ls8h.la`,
        additionalEmails: [`alias-${localPart}@XN--LS8H.LA`],
      },
    );
    await setStoredEmails(
      PERSON_TABLE,
      'emailsPrimaryEmail',
      'emailsAdditionalEmails',
      unicodePersonId,
      {
        primaryEmail: `${localPart}@💩.la`,
        additionalEmails: null,
      },
    );

    await runCommand();

    expect(
      await readEmails(
        PERSON_TABLE,
        'emailsPrimaryEmail',
        'emailsAdditionalEmails',
        legacyPersonId,
      ),
    ).toEqual({
      primaryEmail: `${localPart}@xn--ls8h.la`,
      additionalEmails: [`alias-${localPart}@💩.la`],
    });
    expect(
      await readEmails(
        PERSON_TABLE,
        'emailsPrimaryEmail',
        'emailsAdditionalEmails',
        unicodePersonId,
      ),
    ).toEqual({
      primaryEmail: `${localPart}@💩.la`,
      additionalEmails: null,
    });

    const [comparison] = await dataSource.query<
      { unicodeComesFirstAscending: boolean }[]
    >('SELECT $1::text < $2::text AS "unicodeComesFirstAscending"', [
      `${localPart}@💩.la`,
      `${localPart}@xn--ls8h.la`,
    ]);

    if (!comparison) {
      throw new Error('Could not determine the email sort order');
    }

    const direction = comparison.unicodeComesFirstAscending
      ? 'AscNullsLast'
      : 'DescNullsLast';
    const filter = { id: { in: [legacyPersonId, unicodePersonId] } };
    const orderBy = [{ emails: { primaryEmail: direction } }];
    const firstPage = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter,
        orderBy,
        first: 2,
      }),
    );

    expect(firstPage.body.errors).toBeUndefined();
    expect(
      firstPage.body.data.people.edges.map(
        ({ node }: { node: { id: string } }) => node.id,
      ),
    ).toEqual([unicodePersonId, legacyPersonId]);

    const lastCursor = firstPage.body.data.people.edges[1].cursor;
    const pageAfterLast = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter,
        orderBy,
        first: 2,
        after: lastCursor,
      }),
    );

    expect(pageAfterLast.body.errors).toBeUndefined();
    expect(pageAfterLast.body.data.people.edges).toEqual([]);
  });

  it('leaves both primary spellings unchanged when they collide in the backfill', async () => {
    const firstPersonId = await createPerson();
    const secondPersonId = await createPerson();
    const localPart = randomUUID();
    const firstLegacyEmail = `${localPart}@XN--LS8H.LA`;
    const secondLegacyEmail = `${localPart}@xn--ls8h.la`;

    await setStoredEmails(
      PERSON_TABLE,
      'emailsPrimaryEmail',
      'emailsAdditionalEmails',
      firstPersonId,
      { primaryEmail: firstLegacyEmail, additionalEmails: null },
    );
    await setStoredEmails(
      PERSON_TABLE,
      'emailsPrimaryEmail',
      'emailsAdditionalEmails',
      secondPersonId,
      { primaryEmail: secondLegacyEmail, additionalEmails: null },
    );

    await runCommand();

    expect(
      (
        await readEmails(
          PERSON_TABLE,
          'emailsPrimaryEmail',
          'emailsAdditionalEmails',
          firstPersonId,
        )
      ).primaryEmail,
    ).toBe(firstLegacyEmail);
    expect(
      (
        await readEmails(
          PERSON_TABLE,
          'emailsPrimaryEmail',
          'emailsAdditionalEmails',
          secondPersonId,
        )
      ).primaryEmail,
    ).toBe(secondLegacyEmail);
  });

  it('backfills a retained inactive EMAILS field before reactivation', async () => {
    const personObject = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'person' },
    });
    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'legacyEmailNormalization',
        label: 'Legacy Email Normalization',
        type: FieldMetadataType.EMAILS,
        objectMetadataId: personObject.id,
      },
      gqlFields: 'id',
    });

    inactiveFieldId = data.createOneField.id;
    const personId = await createPerson();

    await setStoredEmails(
      PERSON_TABLE,
      'legacyEmailNormalizationPrimaryEmail',
      'legacyEmailNormalizationAdditionalEmails',
      personId,
      {
        primaryEmail: `inactive-${personId}@XN--LS8H.LA`,
        additionalEmails: [`alias-${personId}@MÜNCHEN｡DE.`],
      },
    );
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: inactiveFieldId,
        updatePayload: { isActive: false },
      },
    });

    await runCommand();

    expect(
      await readEmails(
        PERSON_TABLE,
        'legacyEmailNormalizationPrimaryEmail',
        'legacyEmailNormalizationAdditionalEmails',
        personId,
      ),
    ).toEqual({
      primaryEmail: `inactive-${personId}@💩.la`,
      additionalEmails: [`alias-${personId}@münchen.de`],
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: inactiveFieldId,
        updatePayload: { isActive: true },
      },
    });

    expect(
      await findRecordNodesByFilter<{ id: string }>('person', 'people', 'id', {
        legacyEmailNormalization: {
          primaryEmail: { eq: `inactive-${personId}@xn--ls8h.la` },
        },
      }),
    ).toEqual([{ id: personId }]);
  });

  it('backfills an inactive object with retained EMAILS columns', async () => {
    const { data: objectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: INACTIVE_OBJECT_NAME,
        namePlural: 'emailNormalizationUpgradeObjects',
        labelSingular: 'Email Normalization Upgrade Object',
        labelPlural: 'Email Normalization Upgrade Objects',
        icon: 'IconMail',
      },
    });

    inactiveObjectId = objectData.createOneObject.id;
    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'contactEmails',
        label: 'Contact Emails',
        type: FieldMetadataType.EMAILS,
        objectMetadataId: inactiveObjectId,
      },
    });

    const recordId = randomUUID();
    const createResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: INACTIVE_OBJECT_NAME,
        gqlFields: 'id',
        data: { id: recordId },
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();
    createdInactiveObjectRecordIds.push(recordId);

    await setStoredEmails(
      INACTIVE_OBJECT_TABLE,
      'contactEmailsPrimaryEmail',
      'contactEmailsAdditionalEmails',
      recordId,
      {
        primaryEmail: `object-${recordId}@XN--LS8H.LA`,
        additionalEmails: [`alias-${recordId}@MÜNCHEN．DE.`],
      },
    );
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: inactiveObjectId,
        updatePayload: { isActive: false },
      },
    });

    await runCommand();

    expect(
      await readEmails(
        INACTIVE_OBJECT_TABLE,
        'contactEmailsPrimaryEmail',
        'contactEmailsAdditionalEmails',
        recordId,
      ),
    ).toEqual({
      primaryEmail: `object-${recordId}@💩.la`,
      additionalEmails: [`alias-${recordId}@münchen.de`],
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: inactiveObjectId,
        updatePayload: { isActive: true },
      },
    });

    expect(
      await findRecordNodesByFilter<{ id: string }>(
        INACTIVE_OBJECT_NAME,
        'emailNormalizationUpgradeObjects',
        'id',
        {
          contactEmails: {
            primaryEmail: { eq: `object-${recordId}@xn--ls8h.la` },
          },
        },
      ),
    ).toEqual([{ id: recordId }]);
  });
});
