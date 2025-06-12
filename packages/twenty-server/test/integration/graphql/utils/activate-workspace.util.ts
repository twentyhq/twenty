import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { activateWorkspaceOperationFactory } from 'test/integration/graphql/utils/activate-workspace-factory.util';
import { CommonOperationInput } from 'test/integration/types/common-operation-input.type';
import { makeMetadataAPIRequest } from 'test/integration/utils/make-metadata-api-request.util';

export const performActivateWorkspace = async ({
  input,
  options,
}: CommonOperationInput<ActivateWorkspaceInput>) => {
  const graphqlOperation = activateWorkspaceOperationFactory(input);

  return await makeMetadataAPIRequest(graphqlOperation, options);
};
