import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkflowCreateManyPreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-many.pre-query.hook';
import {
  type WorkflowWorkspaceEntity,
  WorkflowStatus,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

describe('WorkflowCreateManyPreQueryHook', () => {
  const hook = new WorkflowCreateManyPreQueryHook();
  const authContext = {} as WorkspaceAuthContext;
  const objectName = 'workflow';

  const buildPayload = (
    data: Array<Partial<WorkflowWorkspaceEntity>>,
  ): CreateManyResolverArgs<WorkflowWorkspaceEntity> => ({
    data: data as WorkflowWorkspaceEntity[],
  });

  // Regression guard: prior to this hook silently stripping `statuses`, passing
  // any non-empty `statuses` array to `createManyWorkflows` made the resolver
  // throw `WorkflowQueryValidationException` ("Statuses cannot be set
  // manually."), which surfaced to clients as a 400 Bad Request and broke
  // workflow creation in prod whenever the client forwarded a default value
  // computed from the multi-select field metadata.
  it('should not respond a 400 when statuses are passed in any entry of the payload (regression)', async () => {
    await expect(
      hook.execute(
        authContext,
        objectName,
        buildPayload([
          { name: 'Workflow 1', statuses: [WorkflowStatus.ACTIVE] },
          { name: 'Workflow 2' },
          { name: 'Workflow 3', statuses: [WorkflowStatus.DRAFT] },
        ]),
      ),
    ).resolves.toBeDefined();
  });

  it('should strip statuses from every entry that has it set', async () => {
    const result = await hook.execute(
      authContext,
      objectName,
      buildPayload([
        { name: 'Workflow 1', statuses: [WorkflowStatus.ACTIVE] },
        { name: 'Workflow 2', statuses: [WorkflowStatus.DRAFT] },
      ]),
    );

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).not.toHaveProperty('statuses');
    expect(result.data[0].name).toBe('Workflow 1');
    expect(result.data[1]).not.toHaveProperty('statuses');
    expect(result.data[1].name).toBe('Workflow 2');
  });

  it('should strip statuses when it is an empty array', async () => {
    const result = await hook.execute(
      authContext,
      objectName,
      buildPayload([{ name: 'Workflow 1', statuses: [] }]),
    );

    expect(result.data[0]).not.toHaveProperty('statuses');
    expect(result.data[0].name).toBe('Workflow 1');
  });

  it('should leave entries untouched when statuses is not set', async () => {
    const result = await hook.execute(
      authContext,
      objectName,
      buildPayload([{ name: 'Workflow 1' }, { name: 'Workflow 2' }]),
    );

    expect(result.data[0]).not.toHaveProperty('statuses');
    expect(result.data[0].name).toBe('Workflow 1');
    expect(result.data[1]).not.toHaveProperty('statuses');
    expect(result.data[1].name).toBe('Workflow 2');
  });

  it('should preserve other top-level payload fields (e.g. upsert)', async () => {
    const result = await hook.execute(authContext, objectName, {
      data: [
        {
          name: 'Workflow 1',
          statuses: [WorkflowStatus.ACTIVE],
        } as WorkflowWorkspaceEntity,
      ],
      upsert: true,
    });

    expect(result.upsert).toBe(true);
    expect(result.data[0]).not.toHaveProperty('statuses');
    expect(result.data[0].name).toBe('Workflow 1');
  });

  it('should return an empty data array unchanged', async () => {
    const result = await hook.execute(
      authContext,
      objectName,
      buildPayload([]),
    );

    expect(result.data).toEqual([]);
  });
});
