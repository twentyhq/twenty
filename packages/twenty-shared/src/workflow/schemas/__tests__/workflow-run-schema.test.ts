import { workflowRunSchema } from '../workflow-run-schema';

const RUN = {
  __typename: 'WorkflowRun',
  id: '5f0f7f3a-6d7e-4a0b-9a51-2d6c7c1e9b10',
  coreWorkflowVersionId: '18ad7459-0c15-5dbe-bdb6-cd03329950e7',
  coreWorkflowId: '3b53a227-5094-5eef-a0d8-4dadd513e6c4',
  state: null,
  status: 'COMPLETED',
  createdAt: '2026-11-16T12:00:00.000Z',
  deletedAt: null,
  endedAt: null,
  name: '#1 - Quick Lead',
};

describe('workflowRunSchema', () => {
  it('should load a run without workflowVersionId', () => {
    expect(workflowRunSchema.safeParse(RUN).success).toBe(true);
  });

  it('should load a run with workflowVersionId', () => {
    expect(
      workflowRunSchema.safeParse({
        ...RUN,
        workflowVersionId: '11111111-0000-4000-8000-000000000001',
      }).success,
    ).toBe(true);
  });
});
