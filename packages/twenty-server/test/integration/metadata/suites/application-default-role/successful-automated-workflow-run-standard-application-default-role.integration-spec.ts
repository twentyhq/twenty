import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { findApplicationDefaultRole } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

type WorkflowRun = {
  status: string;
  state: {
    stepInfos: Record<string, { result?: { totalCount?: number | string } }>;
  };
};

const findWorkflowRuns = async (
  coreWorkflowId: string,
): Promise<WorkflowRun[]> => {
  const response = await workflowGraphqlRequest(
    `query WorkflowRuns($coreWorkflowId: UUID!) {
      workflowRuns(filter: { coreWorkflowId: { eq: $coreWorkflowId } }) {
        edges { node { status state } }
      }
    }`,
    { coreWorkflowId },
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workflowRuns.edges.map(
    ({ node }: { node: WorkflowRun }) => node,
  );
};

describe('An automated workflow run acts with the standard application default role', () => {
  let coreWorkflowId: string | undefined;
  let findCompaniesStepId: string;
  let companyId: string | undefined;

  beforeAll(async () => {
    jest.useRealTimers();

    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Automated run with the standard application role',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;

    const { coreWorkflowVersionId } = createdCoreWorkflow;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Company is created',
        type: 'DATABASE_EVENT',
        settings: { eventName: 'company.created', outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const findCompaniesStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: WorkflowActionType.FIND_RECORDS,
    });

    findCompaniesStepId = findCompaniesStep.id;

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...findCompaniesStep,
        settings: {
          ...findCompaniesStep.settings,
          input: { objectName: 'company', limit: 1 },
        },
      },
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterAll(async () => {
    if (isDefined(companyId)) {
      await workflowGraphqlRequest(
        'mutation Destroy($id: UUID!) { destroyCompany(id: $id) { id } }',
        { id: companyId },
      );
    }

    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('reads records with Admin as the standard application default role', async () => {
    const standardApplicationDefaultRole = await findApplicationDefaultRole({
      input: {
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
    });

    expect(standardApplicationDefaultRole?.universalIdentifier).toBe(
      STANDARD_ROLE.admin.universalIdentifier,
    );

    const response = await workflowGraphqlRequest(
      'mutation { createCompany(data: { name: "Standard application role" }) { id } }',
    );

    expect(response.body.errors).toBeUndefined();
    companyId = response.body.data.createCompany.id;

    let workflowRun: WorkflowRun | undefined;

    await expectEventually(async () => {
      [workflowRun] = await findWorkflowRuns(coreWorkflowId as string);

      expect(workflowRun?.status).toBe('COMPLETED');
    });

    expect(
      Number(
        workflowRun?.state.stepInfos[findCompaniesStepId]?.result?.totalCount,
      ),
    ).toBeGreaterThan(0);
  });
});
