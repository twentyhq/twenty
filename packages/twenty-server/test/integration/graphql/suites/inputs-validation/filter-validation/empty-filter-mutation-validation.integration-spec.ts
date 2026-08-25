import { destroyManyObjectsMetadata } from 'test/integration/graphql/suites/inputs-validation/utils/destroy-many-objects-metadata';
import { setupTestObjectsWithAllFieldTypes } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';

describe('Empty filter bulk mutation validation', () => {
  let objectMetadataId: string;
  let objectMetadataSingularName: string;
  let objectMetadataPluralName: string;
  let targetObjectMetadata1Id: string;
  let targetObjectMetadata2Id: string;

  beforeAll(async () => {
    const setupTest = await setupTestObjectsWithAllFieldTypes();

    objectMetadataId = setupTest.objectMetadataId;
    objectMetadataSingularName = setupTest.objectMetadataSingularName;
    objectMetadataPluralName = setupTest.objectMetadataPluralName;
    targetObjectMetadata1Id = setupTest.targetObjectMetadata1Id;
    targetObjectMetadata2Id = setupTest.targetObjectMetadata2Id;
  });

  afterAll(async () => {
    await destroyManyObjectsMetadata([
      objectMetadataId,
      targetObjectMetadata1Id,
      targetObjectMetadata2Id,
    ]);
  });

  it('should reject destroyMany with an empty filter', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      filter: {},
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.errors).toBeDefined();
  });

  it('should reject deleteMany with an empty filter', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      filter: {},
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.errors).toBeDefined();
  });

  it('should reject updateMany with an empty filter', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      data: {},
      filter: {},
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.errors).toBeDefined();
  });

  it('should reject restoreMany with an empty filter', async () => {
    const graphqlOperation = restoreManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      filter: {},
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.errors).toBeDefined();
  });

  it('should reject destroyMany with a nested empty logical filter', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      filter: { and: [] },
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.errors).toBeDefined();
  });
});
