import {
  createCoreWorkflow,
  linkCoreWorkflowToLegacyWorkspaceIds,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { updateCoreWorkflowIsPrivate } from 'test/integration/graphql/suites/workflow/utils/update-core-workflow-is-private.util';

export type MemberCoreWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  workspaceWorkflowId: string;
};

export const createMemberCoreWorkflow = async ({
  name,
  isPrivate,
}: {
  name: string;
  isPrivate: boolean;
}): Promise<MemberCoreWorkflow> => {
  const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
    name,
  });
  const { workspaceWorkflowId } = await linkCoreWorkflowToLegacyWorkspaceIds({
    coreWorkflowId,
  });

  if (isPrivate) {
    await updateCoreWorkflowIsPrivate({
      input: { coreWorkflowId, isPrivate },
      expectToFail: false,
    });
  }

  return {
    coreWorkflowId,
    coreWorkflowVersionId,
    workspaceWorkflowId,
  };
};
