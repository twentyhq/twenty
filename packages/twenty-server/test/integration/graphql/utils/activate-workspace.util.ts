import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { CommonOperationInput } from 'test/integration/graphql/types/common-operation-input.type';
import { activateWorkspaceOperationFactory } from 'test/integration/graphql/utils/activate-workspace-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/graphql/utils/make-metadata-api-request.util';

export const performActivateWorkspace = async ({
  input,
  options,
}: CommonOperationInput<ActivateWorkspaceInput>) => {
  const operation = activateWorkspaceOperationFactory(input);

  return await makeMetadataAPIRequest({
    operation, 
    options
  });
};
