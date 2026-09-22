import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type PersonWithEmails = {
  id: string;
  emails: {
    primaryEmail: string | null;
    additionalEmails: string[] | null;
  };
};

const PERSON_FIELDS = 'id emails { primaryEmail additionalEmails }';

describe('person email domain canonicalization (integration)', () => {
  const createdPersonIds: string[] = [];

  const createPerson = async (emails: {
    primaryEmail: string;
    additionalEmails?: string[];
  }): Promise<PersonWithEmails> => {
    const id = randomUUID();
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_FIELDS,
        data: { id, emails },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    createdPersonIds.push(id);

    return response.body.data.createPerson;
  };

  const findPeople = async (filter: object): Promise<PersonWithEmails[]> => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_FIELDS,
        filter,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.people.edges.map(
      ({ node }: { node: PersonWithEmails }) => node,
    );
  };

  afterAll(async () => {
    await deleteRecordsByIds('person', createdPersonIds);
  });

  it.each([
    { inputDomain: 'XN--LS8H.LA', storedDomain: '💩.la' },
    { inputDomain: '💩.LA', storedDomain: '💩.la' },
    { inputDomain: 'MÜNCHEN。DE.', storedDomain: 'münchen.de' },
    { inputDomain: 'MÜNCHEN．DE', storedDomain: 'münchen.de' },
    { inputDomain: 'MÜNCHEN｡DE', storedDomain: 'münchen.de' },
    { inputDomain: 'ExAmPlE.COM.', storedDomain: 'example.com' },
  ])(
    'stores $inputDomain as $storedDomain and matches exact filters',
    async ({ inputDomain, storedDomain }) => {
      const localPart = `Person-${randomUUID()}`;
      const person = await createPerson({
        primaryEmail: `${localPart}@${inputDomain}`,
      });
      const canonicalEmail = `${localPart.toLowerCase()}@${storedDomain}`;

      expect(person.emails.primaryEmail).toBe(canonicalEmail);

      for (const spelling of [`${localPart}@${inputDomain}`, canonicalEmail]) {
        expect(
          (
            await findPeople({ emails: { primaryEmail: { eq: spelling } } })
          ).map(({ id }) => id),
        ).toEqual([person.id]);

        expect(
          (
            await findPeople({
              emails: {
                primaryEmail: { in: ['missing@example.com', spelling] },
              },
            })
          ).map(({ id }) => id),
        ).toEqual([person.id]);
      }
    },
  );

  it('stores additional emails as Unicode and updates both subfields', async () => {
    const localPart = randomUUID();
    const person = await createPerson({
      primaryEmail: `${localPart}@example.com`,
      additionalEmails: [`Alias-${localPart}@XN--LS8H.LA`],
    });

    expect(person.emails.additionalEmails).toEqual([
      `alias-${localPart}@💩.la`,
    ]);

    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        recordId: person.id,
        gqlFields: PERSON_FIELDS,
        data: {
          emails: {
            primaryEmail: `UPdated-${localPart}@MÜNCHEN。DE.`,
            additionalEmails: [`Other-${localPart}@XN--LS8H.LA`],
          },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePerson.emails).toEqual({
      primaryEmail: `updated-${localPart}@münchen.de`,
      additionalEmails: [`other-${localPart}@💩.la`],
    });
  });

  it('rejects a second primary email with an equivalent domain spelling', async () => {
    const localPart = randomUUID();

    await createPerson({ primaryEmail: `${localPart}@💩.la` });

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_FIELDS,
        data: {
          id: randomUUID(),
          emails: { primaryEmail: `${localPart}@xn--ls8h.la` },
        },
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(
      await findPeople({
        emails: { primaryEmail: { eq: `${localPart}@💩.la` } },
      }),
    ).toHaveLength(1);
  });

  it('canonicalizes direct workspace repository inserts and updates', async () => {
    const id = randomUUID();
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    await workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository = workspaceOrmManager.getRepository(
        PersonWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      await personRepository.insert({
        id,
        emails: {
          primaryEmail: `${id}@XN--LS8H.LA`,
          additionalEmails: [`alias-${id}@MÜNCHEN。DE.`],
        },
      });
      createdPersonIds.push(id);

      await personRepository.update(id, {
        emails: {
          primaryEmail: `${id}@MÜNCHEN．DE`,
          additionalEmails: [`alias-${id}@XN--LS8H.LA`],
        },
      });
    }, buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID));

    expect(
      await findPeople({
        emails: { primaryEmail: { eq: `${id}@xn--mnchen-3ya.de` } },
      }),
    ).toEqual([
      {
        id,
        emails: {
          primaryEmail: `${id}@münchen.de`,
          additionalEmails: [`alias-${id}@💩.la`],
        },
      },
    ]);
  });

  it('normalizes REST writes and matches a punycode REST exact filter', async () => {
    const id = randomUUID();
    const localPart = randomUUID();
    const createResponse = await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        id,
        emails: {
          primaryEmail: `${localPart}@XN--LS8H.LA`,
          additionalEmails: [`alias-${localPart}@MÜNCHEN．DE`],
        },
      },
    });

    expect(createResponse.status).toBe(201);
    createdPersonIds.push(id);
    expect(createResponse.body.data.createPerson.emails).toEqual({
      primaryEmail: `${localPart}@💩.la`,
      additionalEmails: [`alias-${localPart}@münchen.de`],
    });

    const filter = encodeURIComponent(
      `emails.primaryEmail[eq]:"${localPart}@xn--ls8h.la"`,
    );
    const findResponse = await makeRestAPIRequest({
      method: 'get',
      path: `/people?filter=${filter}`,
    });

    expect(findResponse.status).toBe(200);
    expect(
      findResponse.body.data.people.map(({ id }: { id: string }) => id),
    ).toEqual([id]);

    const updateResponse = await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${id}`,
      body: {
        emails: {
          primaryEmail: `${localPart}@MÜNCHEN｡DE.`,
          additionalEmails: [`alias-${localPart}@XN--LS8H.LA`],
        },
      },
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.updatePerson.emails).toEqual({
      primaryEmail: `${localPart}@münchen.de`,
      additionalEmails: [`alias-${localPart}@💩.la`],
    });
  });
});
