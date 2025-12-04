import gql from 'graphql-tag';
import { TOO_MANY_ROOT_RESOLVERS_QUERY_GQL_FIELDS } from 'test/integration/graphql/suites/query-complexity/constants/tooManyRootResolversQueryGqlFields.constant';
import { generateGqlFields } from 'test/integration/graphql/suites/query-complexity/generate-gql-fields.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe('Query Complexity', () => {
  it('should execute a simple query', async () => {
    const gqlFields = generateGqlFields(100);

    const findManyPeopleOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: gqlFields,
    });

    const response = await makeGraphqlAPIRequest(findManyPeopleOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.people).toBeDefined();
    expect(response.body.data.people.edges).toBeDefined();
  });

  it('should fail to execute a query with too many fields', async () => {
    const gqlFields = generateGqlFields(2001);

    const findManyPeopleOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: gqlFields,
    });

    const response = await makeGraphqlAPIRequest(findManyPeopleOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatchSnapshot();
  });

  it.only('should fail to execute a query with too many root resolvers', async () => {
    const response = await makeGraphqlAPIRequest({
      query: TOO_MANY_ROOT_RESOLVERS_QUERY_GQL_FIELDS,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatchSnapshot();
  });

  it('should fail to execute a query with duplicate root resolvers', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query {
          people {
            edges {
              node {
                id
              }
            }
          }
          people {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatchSnapshot();
  });
});
