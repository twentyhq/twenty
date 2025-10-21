import { TEST_OBJECT_GQL_FIELDS } from 'test/integration/graphql/suites/inputs-validation/constants/test-object-gql-fields.constant';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';

export const testGqlSuccessfulScenario = async (
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  filter: any,
  validateFilter: (record: Record<string, any>) => boolean,
) => {
  const graphqlOperation = findManyOperationFactory({
    objectMetadataSingularName: objectMetadataSingularName,
    objectMetadataPluralName: objectMetadataPluralName,
    gqlFields: TEST_OBJECT_GQL_FIELDS,
    filter,
  });

  const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

  const records: Record<string, any>[] = response.body.data[
    objectMetadataPluralName
  ].edges.map((edge: any) => edge.node);

  expect(response.body.errors).toBeUndefined();

  expect(records.length).toBeGreaterThan(0);
  expect(
    records.every((record: Record<string, any>) => validateFilter?.(record)),
  ).toBe(true);
};
