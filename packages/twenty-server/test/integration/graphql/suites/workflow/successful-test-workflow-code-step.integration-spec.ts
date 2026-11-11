import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { testWorkflowCodeStep } from 'test/integration/graphql/suites/workflow/utils/test-workflow-code-step.util';

describe('Workflow code step tests should succeed', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Code step in an active workspace',
    }));
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('should run the code in an active workspace', async () => {
    const { data } = await testWorkflowCodeStep({
      input: {
        workflowVersionId: coreWorkflowVersionId,
        code: 'export const main = async (params: { name: string }) => ({ greeting: `Hello ${params.name}` });',
        payload: { name: 'Twenty' },
      },
    });

    expect(data.testWorkflowCodeStep).toMatchObject({
      status: 'SUCCESS',
      data: { greeting: 'Hello Twenty' },
    });
  });
});
