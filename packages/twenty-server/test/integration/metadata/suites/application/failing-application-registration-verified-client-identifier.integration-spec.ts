import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { ApplicationRegistrationExceptionCode } from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const CLI_UNIVERSAL_IDENTIFIER =
  TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier;

const findCliRegistrations = (): Promise<
  { id: string; ownerWorkspaceId: string | null }[]
> =>
  globalThis.testDataSource.query(
    `SELECT id, "workspaceId" AS "ownerWorkspaceId" FROM core."applicationRegistration"
     WHERE "universalIdentifier" = $1`,
    [CLI_UNIVERSAL_IDENTIFIER],
  );

const seedCliRegistration = () =>
  request(`http://localhost:${APP_PORT}`)
    .get('/.well-known/oauth-authorization-server')
    .expect(200);

describe('Application registration should protect a verified client identifier', () => {
  afterAll(seedCliRegistration);

  it('should refuse createApplicationRegistration with the Twenty CLI identifier before the server seeds it', async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
      [CLI_UNIVERSAL_IDENTIFIER],
    );

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CreateApplicationRegistration(
          $input: CreateApplicationRegistrationInput!
        ) {
          createApplicationRegistration(input: $input) {
            applicationRegistration {
              id
            }
          }
        }
      `,
      variables: {
        input: {
          name: 'Twenty CLI',
          universalIdentifier: CLI_UNIVERSAL_IDENTIFIER,
        },
      },
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
    );
    expect(await findCliRegistrations()).toEqual([]);
  });

  it('should refuse an ownership claim on the seeded Twenty CLI registration', async () => {
    await seedCliRegistration();

    const [cliRegistration] = await findCliRegistrations();

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation ClaimApplicationRegistrationOwnership(
          $applicationRegistrationId: String!
        ) {
          claimApplicationRegistrationOwnership(
            applicationRegistrationId: $applicationRegistrationId
          ) {
            id
          }
        }
      `,
      variables: { applicationRegistrationId: cliRegistration.id },
    });

    expect(response.body.errors?.[0]?.extensions?.subCode).toBe(
      ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
    );
    expect(await findCliRegistrations()).toEqual([
      { id: cliRegistration.id, ownerWorkspaceId: null },
    ]);
  });
});
