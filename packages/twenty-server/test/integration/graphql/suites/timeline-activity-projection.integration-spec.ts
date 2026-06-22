import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

const GET_PROJECTIONS = gql`
  query GetTimelineActivityProjections(
    $objectNameSingular: String!
    $recordId: UUID!
  ) {
    getTimelineActivityProjections(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    ) {
      targetColumnName
      recordIds
      linkedObjectMetadataIds
    }
  }
`;

const PROJECTION_COMPANY_ID = '20202020-7e57-4001-8000-000000000001';
const PROJECTION_PERSON_ID = '20202020-7e57-4001-8000-000000000002';

const FIXTURES: { objectMetadataSingularName: string; id: string }[] = [
  { objectMetadataSingularName: 'person', id: PROJECTION_PERSON_ID },
  { objectMetadataSingularName: 'company', id: PROJECTION_COMPANY_ID },
];

const createRecord = async (objectMetadataSingularName: string, data: object) => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const requestProjections = (objectNameSingular: string, recordId: string) =>
  makeGraphqlAPIRequest({
    query: GET_PROJECTIONS,
    variables: { objectNameSingular, recordId },
  });

describe('getTimelineActivityProjections resolver (integration)', () => {
  beforeAll(async () => {
    await createRecord('company', {
      id: PROJECTION_COMPANY_ID,
      name: 'Projection Source Company',
    });

    await createRecord('person', {
      id: PROJECTION_PERSON_ID,
      name: { firstName: 'Projection', lastName: 'Source' },
      companyId: PROJECTION_COMPANY_ID,
    });
  });

  afterAll(async () => {
    for (const { objectMetadataSingularName, id } of FIXTURES) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  it('should project a related person onto a company timeline, scoped to notes & tasks', async () => {
    const response = await requestProjections('company', PROJECTION_COMPANY_ID);

    expect(response.body.errors).toBeUndefined();

    const projections =
      response.body.data.getTimelineActivityProjections as {
        targetColumnName: string;
        recordIds: string[];
        linkedObjectMetadataIds: string[];
      }[];

    const personProjection = projections.find(
      (projection) => projection.targetColumnName === 'targetPersonId',
    );

    expect(personProjection).toBeDefined();
    expect(personProjection?.recordIds).toContain(PROJECTION_PERSON_ID);
    // note + task are the two activity object types allowed to project.
    expect(personProjection?.linkedObjectMetadataIds).toHaveLength(2);
  });

  it('should not project a person record onto itself', async () => {
    const response = await requestProjections('person', PROJECTION_PERSON_ID);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getTimelineActivityProjections).toEqual([]);
  });

  describe('with a custom object that has no related people', () => {
    const CUSTOM_OBJECT_NAME_SINGULAR = 'projectionProbe';
    const CUSTOM_RECORD_ID = '20202020-cccc-4001-8000-0000000000a1';

    let customObjectMetadataId: string;

    beforeAll(async () => {
      const { data } = await createOneObjectMetadata({
        input: {
          nameSingular: CUSTOM_OBJECT_NAME_SINGULAR,
          namePlural: 'projectionProbes',
          labelSingular: 'Projection Probe',
          labelPlural: 'Projection Probes',
          icon: 'IconRadar',
        },
        expectToFail: false,
      });

      customObjectMetadataId = data.createOneObject.id;

      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: CUSTOM_OBJECT_NAME_SINGULAR,
          gqlFields: 'id',
          data: { id: CUSTOM_RECORD_ID, name: 'Probe' },
        }),
      );
    });

    afterAll(async () => {
      await updateOneObjectMetadata({
        input: {
          idToUpdate: customObjectMetadataId,
          updatePayload: { isActive: false },
        },
        expectToFail: false,
      });

      await deleteOneObjectMetadata({
        input: { idToDelete: customObjectMetadataId },
        expectToFail: false,
      });
    });

    it('should return no projections instead of crashing', async () => {
      const response = await requestProjections(
        CUSTOM_OBJECT_NAME_SINGULAR,
        CUSTOM_RECORD_ID,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.getTimelineActivityProjections).toEqual([]);
    });
  });
});
