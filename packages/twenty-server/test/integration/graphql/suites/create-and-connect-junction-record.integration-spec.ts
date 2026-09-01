import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SOURCE_MESSAGE_LIST_ID = '20202020-a710-4000-8000-000000000001';
const TARGET_PERSON_ID = '20202020-a710-4000-8000-000000000002';
const SUCCESS_TARGET_PERSON_ID = '20202020-a710-4000-8000-000000000003';
const PIVOT_FAILURE_CONSTRAINT_NAME =
  'create_and_connect_junction_record_failure_test';
const WORKSPACE_SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CREATE_AND_CONNECT_JUNCTION_RECORD = gql`
  mutation CreateAndConnectJunctionRecord(
    $input: CreateAndConnectJunctionRecordInput!
  ) {
    createAndConnectJunctionRecord(input: $input) {
      targetRecord
      junctionRecord
    }
  }
`;

const dropPivotFailureConstraint = () =>
  global.testDataSource.query(
    `ALTER TABLE "${WORKSPACE_SCHEMA_NAME}"."messageListMember"
      DROP CONSTRAINT IF EXISTS "${PIVOT_FAILURE_CONSTRAINT_NAME}"`,
  );

const destroyFixtures = async () => {
  await makeGraphqlAPIRequest(
    destroyManyOperationFactory({
      objectMetadataSingularName: 'messageListMember',
      objectMetadataPluralName: 'messageListMembers',
      gqlFields: 'id',
      filter: {
        listId: { eq: SOURCE_MESSAGE_LIST_ID },
        personId: { in: [TARGET_PERSON_ID, SUCCESS_TARGET_PERSON_ID] },
      },
    }),
  );

  await makeGraphqlAPIRequest(
    destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: { id: { in: [TARGET_PERSON_ID, SUCCESS_TARGET_PERSON_ID] } },
    }),
  );

  await makeGraphqlAPIRequest(
    destroyManyOperationFactory({
      objectMetadataSingularName: 'messageList',
      objectMetadataPluralName: 'messageLists',
      gqlFields: 'id',
      filter: { id: { in: [SOURCE_MESSAGE_LIST_ID] } },
    }),
  );
};

const getFixtureState = async (targetPersonId: string) => {
  const [fixtureState] = await global.testDataSource.query(
    `SELECT
       EXISTS(
         SELECT 1 FROM "${WORKSPACE_SCHEMA_NAME}"."person"
         WHERE "id" = $1
       ) AS "targetExists",
       EXISTS(
         SELECT 1 FROM "${WORKSPACE_SCHEMA_NAME}"."messageListMember"
         WHERE "listId" = $2 AND "personId" = $1
       ) AS "pivotExists"`,
    [targetPersonId, SOURCE_MESSAGE_LIST_ID],
  );

  return fixtureState as { targetExists: boolean; pivotExists: boolean };
};

describe('createAndConnectJunctionRecord (integration)', () => {
  let membersFieldMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: `
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });
    const messageListMetadata = objects.find(
      ({ nameSingular }) => nameSingular === 'messageList',
    );
    const membersFieldMetadata = messageListMetadata?.fieldsList?.find(
      ({ name }) => name === 'members',
    );

    if (!isDefined(membersFieldMetadata)) {
      throw new Error('messageList.members field metadata is missing');
    }

    membersFieldMetadataId = membersFieldMetadata.id;

    // PostgreSQL still enforces a NOT VALID constraint on new rows. Limiting
    // it to this test pair makes the pivot fail after the target is inserted.
    await dropPivotFailureConstraint();
    await global.testDataSource.query(
      `ALTER TABLE "${WORKSPACE_SCHEMA_NAME}"."messageListMember"
        ADD CONSTRAINT "${PIVOT_FAILURE_CONSTRAINT_NAME}"
        CHECK (
          "personId" <> '${TARGET_PERSON_ID}'
          OR "listId" <> '${SOURCE_MESSAGE_LIST_ID}'
        ) NOT VALID`,
    );
  });

  afterAll(dropPivotFailureConstraint);

  beforeEach(async () => {
    await destroyFixtures();

    const messageListResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'messageList',
        gqlFields: 'id',
        data: {
          id: SOURCE_MESSAGE_LIST_ID,
          name: 'Atomic junction rollback',
        },
      }),
    );

    expect(messageListResponse.body.errors).toBeUndefined();
  });

  afterEach(destroyFixtures);

  it('creates and connects a regular junction target', async () => {
    const mutationResponse = await makeGraphqlAPIRequest({
      query: CREATE_AND_CONNECT_JUNCTION_RECORD,
      variables: {
        input: {
          sourceRecordId: SOURCE_MESSAGE_LIST_ID,
          relationFieldMetadataId: membersFieldMetadataId,
          targetRecordInput: {
            id: SUCCESS_TARGET_PERSON_ID,
            name: {
              firstName: 'Created',
              lastName: 'Atomically',
            },
          },
        },
      },
    });

    expect(mutationResponse.body.errors).toBeUndefined();
    expect(
      mutationResponse.body.data.createAndConnectJunctionRecord,
    ).toMatchObject({
      targetRecord: { id: SUCCESS_TARGET_PERSON_ID },
      junctionRecord: {
        listId: SOURCE_MESSAGE_LIST_ID,
        personId: SUCCESS_TARGET_PERSON_ID,
      },
    });
    await expect(getFixtureState(SUCCESS_TARGET_PERSON_ID)).resolves.toEqual({
      targetExists: true,
      pivotExists: true,
    });
  });

  it('rolls back the target when the junction insert fails', async () => {
    const mutationResponse = await makeGraphqlAPIRequest({
      query: CREATE_AND_CONNECT_JUNCTION_RECORD,
      variables: {
        input: {
          sourceRecordId: SOURCE_MESSAGE_LIST_ID,
          relationFieldMetadataId: membersFieldMetadataId,
          targetRecordInput: {
            id: TARGET_PERSON_ID,
            name: {
              firstName: 'Must',
              lastName: 'Roll Back',
            },
          },
        },
      },
    });

    expect(mutationResponse.body.errors).toEqual([
      expect.objectContaining({
        message: 'Data validation error.',
        extensions: expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR' }),
      }),
    ]);
    await expect(getFixtureState(TARGET_PERSON_ID)).resolves.toEqual({
      targetExists: false,
      pivotExists: false,
    });
  });
});
