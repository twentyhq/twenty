import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function-from-source.input';

export type UpdateLogicFunctionFromSourceFactoryInput =
  UpdateLogicFunctionFromSourceInput;

export const updateLogicFunctionFromSourceQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateLogicFunctionFromSourceFactoryInput>) => ({
  query: gql`
    mutation UpdateOneLogicFunction(
      $input: UpdateLogicFunctionFromSourceInput!
    ) {
      updateOneLogicFunction(input: $input)
    }
  `,
  variables: {
    input,
  },
});
