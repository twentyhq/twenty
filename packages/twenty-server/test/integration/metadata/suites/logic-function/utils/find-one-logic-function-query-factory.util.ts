import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindOneLogicFunctionFactoryInput = {
  id: string;
};

const DEFAULT_FIND_ONE_LOGIC_FUNCTION_GQL_FIELDS = `
  id
  name
  applicationId
`;

export const findOneLogicFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIND_ONE_LOGIC_FUNCTION_GQL_FIELDS,
}: PerformMetadataQueryParams<FindOneLogicFunctionFactoryInput>) => ({
  query: gql`
    query FindOneLogicFunction($input: LogicFunctionIdInput!) {
      findOneLogicFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { id: input.id },
  },
});
