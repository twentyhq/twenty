import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type GetLogicFunctionSourceCodeFactoryInput = {
  id: string;
};

export const getLogicFunctionSourceCodeQueryFactory = ({
  input,
}: PerformMetadataQueryParams<GetLogicFunctionSourceCodeFactoryInput>) => ({
  query: gql`
    query GetLogicFunctionSourceCode($input: LogicFunctionIdInput!) {
      getLogicFunctionSourceCode(input: $input)
    }
  `,
  variables: {
    input: { id: input.id },
  },
});
