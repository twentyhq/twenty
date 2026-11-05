import {
  createCoreWorkflow,
  linkCoreWorkflowToLegacyWorkspaceIds,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { updateCoreWorkflowVisibility } from 'test/integration/graphql/suites/workflow/utils/update-core-workflow-visibility.util';
import { WorkflowVisibility } from 'twenty-shared/types';

export type MemberCoreWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  workspaceWorkflowId: string;
  workspaceWorkflowVersionId: string;
};

export const createMemberCoreWorkflow = async ({
  name,
  visibility,
}: {
  name: string;
  visibility: WorkflowVisibility;
}): Promise<MemberCoreWorkflow> => {
  const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
    name,
  });
  const {
    workspaceWorkflowId,
    workspaceWorkflowVersionIds: [workspaceWorkflowVersionId],
  } = await linkCoreWorkflowToLegacyWorkspaceIds({ coreWorkflowId });

  if (visibility !== WorkflowVisibility.WORKSPACE) {
    await updateCoreWorkflowVisibility({
      input: { coreWorkflowId, visibility },
      expectToFail: false,
    });
  }

  return {
    coreWorkflowId,
    coreWorkflowVersionId,
    workspaceWorkflowId,
    workspaceWorkflowVersionId,
  };
};
