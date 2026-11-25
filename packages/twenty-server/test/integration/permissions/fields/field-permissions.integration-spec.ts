import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type ApiKeyWithObjectRecordGrants } from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { createApiKeyWithFieldPermission } from 'test/integration/permissions/utils/create-api-key-with-field-permission.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';
import { expectPermissionDenied } from 'test/integration/permissions/utils/expect-permission-denied.util';
import { expectFieldPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-field-permission-denied-response.util';
import { expectPermissionGrantedResponse } from 'test/integration/permissions/utils/expect-permission-granted-response.util';
import { createPersonRecords } from 'test/integration/utils/create-person-records.util';
import { destroyPersonRecordsByFirstName } from 'test/integration/utils/destroy-person-records-by-first-name.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { findPersonRecordStates } from 'test/integration/utils/find-person-record-states.util';
import { PERSON_RECORD_FIXTURE } from 'test/integration/utils/person-record-fixture.constant';
import { personRequestsByApi } from 'test/integration/utils/person-requests-by-api.util';

const UPDATED_JOB_TITLE = 'Updated job title';
const RESTRICTED_INTRO = 'Restricted intro';
const LINKED_PERSON_INTRO = 'Linked person intro';

const ACTIVE = { status: 'active', jobTitle: PERSON_RECORD_FIXTURE.jobTitle };
const ACTIVE_UPDATED = { status: 'active', jobTitle: UPDATED_JOB_TITLE };
const ABSENT = { status: 'absent' };

const PERSON_FIELDS_WITH_INTRO = 'id jobTitle intro';

const findSavedIntros = async (ids: string[]) => {
  const people = await findRecordNodesByFilter<{ id: string; intro: string }>(
    'person',
    'people',
    'id intro',
    { id: { in: ids } },
  );

  return ids.map((id) => people.find((person) => person.id === id)?.intro);
};

describe('field permissions on person.intro', () => {
  let readRestricted: ApiKeyWithObjectRecordGrants;
  let updateRestricted: ApiKeyWithObjectRecordGrants;
  let updateRestrictedInPredicate: ApiKeyWithObjectRecordGrants;
  const companyId = randomUUID();

  beforeAll(async () => {
    const createCompanyResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { id: companyId, name: PERSON_RECORD_FIXTURE.firstName },
      }),
    );

    expect(createCompanyResponse.body.errors).toBeUndefined();

    const createPersonResponse = await personRequestsByApi.createOne({
      api: 'graphql',
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      data: {
        id: randomUUID(),
        name: { firstName: PERSON_RECORD_FIXTURE.firstName },
        jobTitle: PERSON_RECORD_FIXTURE.jobTitle,
        intro: LINKED_PERSON_INTRO,
        companyId,
      },
    });

    expect(createPersonResponse.body.errors).toBeUndefined();

    [readRestricted, updateRestricted, updateRestrictedInPredicate] =
      await Promise.all([
        createApiKeyWithFieldPermission({
          objectNameSingular: 'person',
          fieldName: 'intro',
          canReadFieldValue: false,
        }),
        createApiKeyWithFieldPermission({
          objectNameSingular: 'person',
          fieldName: 'intro',
          canUpdateFieldValue: false,
        }),
        createApiKeyWithFieldPermission({
          objectNameSingular: 'person',
          fieldName: 'intro',
          canUpdateFieldValue: false,
          isFieldInRowLevelPredicate: true,
        }),
      ]);
  });

  afterAll(async () => {
    await Promise.all([
      deleteApiKeysWithObjectRecordGrants([
        readRestricted,
        updateRestricted,
        updateRestrictedInPredicate,
      ]),
      destroyPersonRecordsByFirstName(PERSON_RECORD_FIXTURE.firstName),
      makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: companyId,
        }),
      ),
    ]);
  });

  describe('read-restricted field over GraphQL', () => {
    it('denies findMany selecting it', async () => {
      const ids = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.findMany({
        api: 'graphql',
        token: readRestricted.token,
        ids,
        gqlFields: PERSON_FIELDS_WITH_INTRO,
      });

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
    });

    it('allows findMany not selecting it', async () => {
      const ids = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.findMany({
        api: 'graphql',
        token: readRestricted.token,
        ids,
      });

      expectPermissionGrantedResponse({ api: 'graphql', response });
      expect(response.body.data.people.edges[0].node.id).toBe(ids[0]);
    });

    it('denies findOne selecting it', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.findOne({
        api: 'graphql',
        token: readRestricted.token,
        id,
        gqlFields: PERSON_FIELDS_WITH_INTRO,
      });

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
    });

    it('denies updateOne selecting it, and does not write', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.updateOne({
        api: 'graphql',
        token: readRestricted.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
        gqlFields: PERSON_FIELDS_WITH_INTRO,
      });

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
      expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
    });

    it('allows updateOne not selecting it', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.updateOne({
        api: 'graphql',
        token: readRestricted.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionGrantedResponse({ api: 'graphql', response });
      expect(await findPersonRecordStates([id])).toEqual([ACTIVE_UPDATED]);
    });

    it('denies updateMany selecting it, and does not write', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.updateMany({
        api: 'graphql',
        token: readRestricted.token,
        ids,
        data: { jobTitle: UPDATED_JOB_TITLE },
        gqlFields: PERSON_FIELDS_WITH_INTRO,
      });

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
      expect(await findPersonRecordStates(ids)).toEqual([ACTIVE, ACTIVE]);
    });

    it('allows updateMany not selecting it', async () => {
      const ids = await createPersonRecords({ count: 2 });

      const response = await personRequestsByApi.updateMany({
        api: 'graphql',
        token: readRestricted.token,
        ids,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionGrantedResponse({ api: 'graphql', response });
      expect(await findPersonRecordStates(ids)).toEqual([
        ACTIVE_UPDATED,
        ACTIVE_UPDATED,
      ]);
    });

    it('denies filtering on it', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id',
          filter: { intro: { like: 'Par%' } },
        }),
        readRestricted.token,
      );

      expectPermissionDenied(response.body.errors);
    });

    it('denies reading it through a relation', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id people { edges { node { id intro } } }',
          filter: { id: { eq: companyId } },
        }),
        readRestricted.token,
      );

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
    });

    it('denies selecting it in group by records', async () => {
      const response = await makeGraphqlApiRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          groupBy: [{ companyId: true }],
          gqlFields: 'edges { node { id intro } }',
        }),
        readRestricted.token,
      );

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
    });

    it('denies ordering a group by by it through a relation', async () => {
      const response = await makeGraphqlApiRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'opportunity',
          objectMetadataPluralName: 'opportunities',
          groupBy: [{ pointOfContactId: true }],
          orderBy: [{ pointOfContact: { intro: 'AscNullsLast' } }],
        }),
        readRestricted.token,
      );

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
    });

    it('allows ordering a group by by a readable field through the same relation', async () => {
      const response = await makeGraphqlApiRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'opportunity',
          objectMetadataPluralName: 'opportunities',
          groupBy: [{ pointOfContactId: true }],
          orderBy: [{ pointOfContact: { jobTitle: 'AscNullsLast' } }],
        }),
        readRestricted.token,
      );

      expectPermissionGrantedResponse({ api: 'graphql', response });
    });

    it('denies aggregating over it', async () => {
      const response = await makeGraphqlApiRequest(
        {
          query: gql`
            query People {
              people {
                countEmptyIntro
              }
            }
          `,
        },
        readRestricted.token,
      );

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
    });

    it('denies aggregating over it through a relation', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id people { percentageEmptyIntro }',
          filter: { id: { eq: companyId } },
        }),
        readRestricted.token,
      );

      expectFieldPermissionDeniedResponse({
        api: 'graphql',
        response,
        access: 'read',
        objectNameSingular: 'person',
        fieldName: 'intro',
      });
    });
  });

  describe('read-restricted field over REST', () => {
    it('omits it from findOne', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.findOne({
        api: 'rest',
        token: readRestricted.token,
        id,
      });

      expectPermissionGrantedResponse({ api: 'rest', response });
      expect(response.body.data.person.id).toBe(id);
      expect(response.body.data.person.intro).toBeUndefined();
    });

    it('omits it from findMany', async () => {
      const ids = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.findMany({
        api: 'rest',
        token: readRestricted.token,
        ids,
      });

      expectPermissionGrantedResponse({ api: 'rest', response });
      expect(response.body.data.people[0].id).toBe(ids[0]);
      expect(response.body.data.people[0].intro).toBeUndefined();
    });

    it('omits it from the updateOne response and writes', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.updateOne({
        api: 'rest',
        token: readRestricted.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
      });

      expectPermissionGrantedResponse({ api: 'rest', response });
      expect(response.body.data.updatePerson.intro).toBeUndefined();
      expect(await findPersonRecordStates([id])).toEqual([ACTIVE_UPDATED]);
    });
  });

  describe('update-restricted field in GraphQL selections', () => {
    it('allows a write whose selection includes it', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      const response = await personRequestsByApi.updateOne({
        api: 'graphql',
        token: updateRestricted.token,
        id,
        data: { jobTitle: UPDATED_JOB_TITLE },
        gqlFields: PERSON_FIELDS_WITH_INTRO,
      });

      expectPermissionGrantedResponse({ api: 'graphql', response });
      expect(await findPersonRecordStates([id])).toEqual([ACTIVE_UPDATED]);
    });

    it('allows reading it through a relation', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id people { edges { node { id intro } } }',
          filter: { id: { eq: companyId } },
        }),
        updateRestricted.token,
      );

      expectPermissionGrantedResponse({ api: 'graphql', response });
      expect(
        response.body.data.companies.edges[0].node.people.edges.map(
          ({ node }: { node: { intro: string } }) => node.intro,
        ),
      ).toEqual([LINKED_PERSON_INTRO]);
    });
  });

  describe.each(['graphql', 'rest'] as const)(
    'update-restricted field over %s',
    (api) => {
      it('allows reading it', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.findOne({
          api,
          token: updateRestricted.token,
          id,
          gqlFields: PERSON_FIELDS_WITH_INTRO,
        });

        expectPermissionGrantedResponse({ api, response });
        expect(response.body.data.person).toHaveProperty('intro');
      });

      it('denies updateOne writing it, and does not write', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.updateOne({
          api,
          token: updateRestricted.token,
          id,
          data: { intro: RESTRICTED_INTRO, jobTitle: UPDATED_JOB_TITLE },
        });

        expectFieldPermissionDeniedResponse({
          api,
          response,
          access: 'write',
          objectNameSingular: 'person',
          fieldName: 'intro',
        });
        expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
        expect(await findSavedIntros([id])).toEqual(['']);
      });

      it('allows updateOne writing another field', async () => {
        const [id] = await createPersonRecords({ count: 1 });

        const response = await personRequestsByApi.updateOne({
          api,
          token: updateRestricted.token,
          id,
          data: { jobTitle: UPDATED_JOB_TITLE },
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([ACTIVE_UPDATED]);
      });

      it('denies createOne writing it', async () => {
        const id = randomUUID();

        const response = await personRequestsByApi.createOne({
          api,
          token: updateRestricted.token,
          data: {
            id,
            name: { firstName: PERSON_RECORD_FIXTURE.firstName },
            intro: RESTRICTED_INTRO,
          },
        });

        expectFieldPermissionDeniedResponse({
          api,
          response,
          access: 'write',
          objectNameSingular: 'person',
          fieldName: 'intro',
        });
        expect(await findPersonRecordStates([id])).toEqual([ABSENT]);
      });

      it('denies createMany writing it', async () => {
        const ids = [randomUUID(), randomUUID()];

        const response = await personRequestsByApi.createMany({
          api,
          token: updateRestricted.token,
          data: ids.map((id) => ({
            id,
            name: { firstName: PERSON_RECORD_FIXTURE.firstName },
            intro: RESTRICTED_INTRO,
          })),
        });

        expectFieldPermissionDeniedResponse({
          api,
          response,
          access: 'write',
          objectNameSingular: 'person',
          fieldName: 'intro',
        });
        expect(await findPersonRecordStates(ids)).toEqual([ABSENT, ABSENT]);
      });

      it('allows createOne not writing it', async () => {
        const id = randomUUID();

        const response = await personRequestsByApi.createOne({
          api,
          token: updateRestricted.token,
          data: {
            id,
            name: { firstName: PERSON_RECORD_FIXTURE.firstName },
            jobTitle: PERSON_RECORD_FIXTURE.jobTitle,
          },
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
      });

      it('allows createOne writing it when it is in a row-level predicate', async () => {
        const id = randomUUID();

        const response = await personRequestsByApi.createOne({
          api,
          token: updateRestrictedInPredicate.token,
          data: {
            id,
            name: { firstName: PERSON_RECORD_FIXTURE.firstName },
            jobTitle: PERSON_RECORD_FIXTURE.jobTitle,
            intro: RESTRICTED_INTRO,
          },
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates([id])).toEqual([ACTIVE]);
        expect(await findSavedIntros([id])).toEqual(
          [id].map(() => RESTRICTED_INTRO),
        );
      });

      it('allows createMany writing it when it is in a row-level predicate', async () => {
        const ids = [randomUUID(), randomUUID()];

        const response = await personRequestsByApi.createMany({
          api,
          token: updateRestrictedInPredicate.token,
          data: ids.map((id) => ({
            id,
            name: { firstName: PERSON_RECORD_FIXTURE.firstName },
            jobTitle: PERSON_RECORD_FIXTURE.jobTitle,
            intro: RESTRICTED_INTRO,
          })),
        });

        expectPermissionGrantedResponse({ api, response });
        expect(await findPersonRecordStates(ids)).toEqual([ACTIVE, ACTIVE]);
        expect(await findSavedIntros(ids)).toEqual(
          ids.map(() => RESTRICTED_INTRO),
        );
      });
    },
  );
});
