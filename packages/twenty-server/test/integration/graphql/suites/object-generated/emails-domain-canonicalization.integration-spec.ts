import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalEmail } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-email';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const EMAIL_PREFIX = `canonical-${randomUUID()}`;
const PRIMARY_EMAIL = `${EMAIL_PREFIX}@💩.la`;
const SECONDARY_EMAIL = `${EMAIL_PREFIX}-secondary@münchen.de`;

describe('EMAILS domain canonicalization (integration)', () => {
  const createdPersonIds: string[] = [];

  const createPerson = async ({
    primaryEmail,
    additionalEmails,
  }: {
    primaryEmail: string;
    additionalEmails?: string[];
  }) =>
    makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id emails { primaryEmail additionalEmails }',
        data: { emails: { primaryEmail, additionalEmails } },
      }),
    );

  afterAll(async () => {
    if (createdPersonIds.length === 0) {
      return;
    }

    await makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: createdPersonIds } },
      }),
    );
  });

  it('stores canonical primary and additional emails from Unicode input', async () => {
    const response = await createPerson({
      primaryEmail: `  ${EMAIL_PREFIX.toUpperCase()}@💩。LA.  `,
      additionalEmails: [`  ${EMAIL_PREFIX}-SECONDARY@München．DE.  `],
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createPerson.emails).toEqual({
      primaryEmail: PRIMARY_EMAIL,
      additionalEmails: [SECONDARY_EMAIL],
    });
    createdPersonIds.push(response.body.data.createPerson.id);
  });

  it.each([
    `${EMAIL_PREFIX}@💩.la`,
    `${EMAIL_PREFIX.toUpperCase()}@XN--LS8H.LA`,
    `  ${EMAIL_PREFIX}@💩｡LA.  `,
  ])('matches an exact primary-email eq filter for %s', async (email) => {
    const response = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id emails { primaryEmail }',
        filter: { emails: { primaryEmail: { eq: email } } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.person.id).toBe(createdPersonIds[0]);
    expect(response.body.data.person.emails.primaryEmail).toBe(PRIMARY_EMAIL);
  });

  it('matches an exact primary-email in filter with mixed Unicode and ASCII values', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: {
          emails: {
            primaryEmail: {
              in: ['nobody@example.com', `${EMAIL_PREFIX}@💩。LA.`],
            },
          },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.people.edges.map(
        (edge: { node: { id: string } }) => edge.node.id,
      ),
    ).toEqual([createdPersonIds[0]]);
  });

  it('uses the canonical primary email as its uniqueness key', async () => {
    const response = await createPerson({
      primaryEmail: `${EMAIL_PREFIX}@XN--LS8H.LA`,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.createPerson).toBeNull();
  });

  it('matches canonical additional emails during participant lookup', async () => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const people = await workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repository = workspaceOrmManager.getRepository(
          PersonWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

        return addPersonEmailFiltersToQueryBuilder({
          queryBuilder: repository.createQueryBuilder('person'),
          emails: [`${EMAIL_PREFIX}-SECONDARY@München｡DE.`],
        }).getMany<PersonWorkspaceEntity>();
      },
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

    expect(people.map((person) => person.id)).toContain(createdPersonIds[0]);
    expect(
      findPersonByPrimaryOrAdditionalEmail({
        people,
        email: `${EMAIL_PREFIX}-secondary@XN--MNCHEN-3YA.DE`,
      })?.id,
    ).toBe(createdPersonIds[0]);
  });
});
