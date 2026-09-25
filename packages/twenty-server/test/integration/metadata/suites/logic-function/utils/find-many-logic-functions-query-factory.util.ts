import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_FIND_MANY_LOGIC_FUNCTIONS_GQL_FIELDS = `
  id
  name
  applicationId
`;

export const findManyLogicFunctionsQueryFactory = ({
  gqlFields = DEFAULT_FIND_MANY_LOGIC_FUNCTIONS_GQL_FIELDS,
}: Partial<PerformMetadataQueryParams<undefined>>) => ({
  query: gql`
    query FindManyLogicFunctions {
      findManyLogicFunctions {
        ${gqlFields}
      }
    }
  `,
});
