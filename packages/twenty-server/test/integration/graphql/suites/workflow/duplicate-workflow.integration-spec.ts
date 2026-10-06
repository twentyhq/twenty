import {
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersionById,
  findCoreWorkflowVersionsByCoreWorkflowId,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

describe('duplicateCoreWorkflow (e2e)', () => {
  let sourceCoreWorkflowId: string;
  let sourceCoreWorkflowVersionId: string;
  let duplicatedCoreWorkflowId: string | undefined;

  beforeAll(async () => {
    ({
      coreWorkflowId: sourceCoreWorkflowId,
      coreWorkflowVersionId: sourceCoreWorkflowVersionId,
    } = await createCoreWorkflow({ name: 'Duplicate Source' }));

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: sourceCoreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: sourceCoreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });
  });

  afterAll(async () => {
    await deleteCoreWorkflows(
      [duplicatedCoreWorkflowId, sourceCoreWorkflowId].filter(isDefined),
    );
  });

  it('duplicates the workflow with a draft copy of the version', async () => {
    const response = await workflowGraphqlRequest(
      `
        mutation DuplicateCoreWorkflow($input: DuplicateCoreWorkflowInput!) {
          duplicateCoreWorkflow(input: $input) {
            id
            statuses
          }
        }
      `,
      {
        input: {
          coreWorkflowIdToDuplicate: sourceCoreWorkflowId,
          coreWorkflowVersionIdToCopy: sourceCoreWorkflowVersionId,
        },
      },
    );

    expect(response.body.errors).toBeUndefined();

    const duplicatedCoreWorkflow = response.body.data.duplicateCoreWorkflow;

    duplicatedCoreWorkflowId = duplicatedCoreWorkflow?.id;

    expect(duplicatedCoreWorkflow.id).not.toBe(sourceCoreWorkflowId);
    expect(duplicatedCoreWorkflow.statuses).toEqual(['DRAFT']);

    const duplicatedVersions = await findCoreWorkflowVersionsByCoreWorkflowId(
      duplicatedCoreWorkflow.id,
    );

    expect(duplicatedVersions).toHaveLength(1);

    const [duplicatedVersion] = duplicatedVersions;

    expect(duplicatedVersion.id).not.toBe(sourceCoreWorkflowVersionId);
    expect(duplicatedVersion.status).toBe('DRAFT');

    const duplicatedVersionContent = await findCoreWorkflowVersionById(
      duplicatedVersion.id,
    );

    expect(duplicatedVersionContent?.trigger?.type).toBe('MANUAL');
    expect(duplicatedVersionContent?.steps).toHaveLength(1);
  });
});
