import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateLogicFunctionSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-source.input';

export type UpdateLogicFunctionSourceFactoryInput =
  UpdateLogicFunctionSourceInput;

export const updateLogicFunctionSourceQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateLogicFunctionSourceFactoryInput>) => ({
  query: gql`
    mutation UpdateLogicFunctionSource(
      $input: UpdateLogicFunctionSourceInput!
    ) {
      updateLogicFunctionSource(input: $input)
    }
  `,
  variables: {
    input,
  },
});
