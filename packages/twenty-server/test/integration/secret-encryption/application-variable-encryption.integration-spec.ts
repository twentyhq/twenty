import crypto from 'crypto';

import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Real integration test for the legacy CTR encryption path: drive it
// entirely through the GraphQL API (no DI-resolved services in the
// assertions), then peek into Postgres in the middle to verify that the
// stored ciphertext is not the plaintext.

describe('Application variable encryption (integration)', () => {
  let dataSource: DataSource;
  let workspaceId: string;
  let applicationId: string;
  let applicationVariableId: string;

  beforeAll(async () => {
    dataSource = global.testDataSource;

    const currentUserResponse = await makeGraphqlAPIRequest({
      query: gql`
        query CurrentUserForApplicationVariableEncryptionTest {
          currentUser {
            currentWorkspace {
              id
            }
          }
        }
      `,
    });

    const fetchedWorkspaceId =
      currentUserResponse.body?.data?.currentUser?.currentWorkspace?.id;

    if (!isDefined(fetchedWorkspaceId)) {
      throw new Error(
        `currentUser query did not return workspace context: ${JSON.stringify(
          currentUserResponse.body,
        )}`,
      );
    }

    workspaceId = fetchedWorkspaceId;

    applicationId = crypto.randomUUID();
    applicationVariableId = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."application"
         (id, "universalIdentifier", name, "sourcePath", "workspaceId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        applicationId,
        crypto.randomUUID(),
        'enc-integration-app',
        '/tmp/enc-integration-test',
        workspaceId,
      ],
    );

    await dataSource.query(
      `INSERT INTO "core"."applicationVariable"
         (id, key, value, description, "isSecret",
          "applicationId", "workspaceId", "universalIdentifier")
       VALUES ($1, $2, '', '', true, $3, $4, $5)`,
      [
        applicationVariableId,
        'TEST_SECRET',
        applicationId,
        workspaceId,
        crypto.randomUUID(),
      ],
    );
  });

  afterAll(async () => {
    await dataSource.query(`DELETE FROM "core"."application" WHERE id = $1`, [
      applicationId,
    ]);
  });

  it('encrypts the value on the API write path, persists ciphertext in Postgres, and decrypts back via the API read path', async () => {
    const plaintext = 'thisisasecretvalue1234567890ab';

    const updateResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation UpdateOneApplicationVariable(
          $key: String!
          $value: String!
          $applicationId: UUID!
        ) {
          updateOneApplicationVariable(
            key: $key
            value: $value
            applicationId: $applicationId
          )
        }
      `,
      variables: {
        key: 'TEST_SECRET',
        value: plaintext,
        applicationId,
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateOneApplicationVariable).toBe(true);

    const [dbRow] = await dataSource.query(
      `SELECT value FROM "core"."applicationVariable" WHERE id = $1`,
      [applicationVariableId],
    );

    // The legacy CTR envelope is base64(IV || ciphertext) — no enc: prefix.
    // We assert two invariants: the column does NOT contain the plaintext,
    // and it looks like a base64 blob (proving encryption actually ran).
    expect(dbRow.value).not.toContain(plaintext);
    expect(dbRow.value).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);

    const readResponse = await makeGraphqlAPIRequest({
      query: gql`
        query FindOneApplicationForEncryptionTest($id: UUID!) {
          findOneApplication(id: $id) {
            id
            applicationVariables {
              id
              key
              isSecret
              value
            }
          }
        }
      `,
      variables: { id: applicationId },
    });

    expect(readResponse.body.errors).toBeUndefined();

    const variable =
      readResponse.body.data.findOneApplication.applicationVariables.find(
        (v: { id: string }) => v.id === applicationVariableId,
      );

    expect(variable).toBeDefined();
    expect(variable.isSecret).toBe(true);
    // The read resolver decrypts and masks: floor(30 / 10) = 3 leading
    // plaintext chars + the mask. If the DB had stored plaintext (or any
    // wrong key), the leading chars wouldn't match — so this proves the
    // legacy CTR encrypt + decrypt round-trip works end-to-end.
    expect(variable.value).toBe(`${plaintext.slice(0, 3)}********`);
  });
});
