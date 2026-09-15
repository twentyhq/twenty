import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkflowCreateOnePreQueryHook } from 'src/modules/workflow/common/query-hooks/workflow-create-one.pre-query.hook';
import {
  type WorkflowWorkspaceEntity,
  WorkflowStatus,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

describe('WorkflowCreateOnePreQueryHook', () => {
  const hook = new WorkflowCreateOnePreQueryHook();
  const authContext = {} as WorkspaceAuthContext;
  const objectName = 'workflow';

  const buildPayload = (
    data: Partial<WorkflowWorkspaceEntity>,
  ): CreateOneResolverArgs<WorkflowWorkspaceEntity> => ({
    data: data as WorkflowWorkspaceEntity,
  });

  // Regression guard: prior to this hook silently stripping `statuses`, passing
  // any non-empty `statuses` array to `createOneWorkflow` made the resolver
  // throw `WorkflowQueryValidationException` ("Statuses cannot be set
  // manually."), which surfaced to clients as a 400 Bad Request and broke
  // workflow creation in prod whenever the client forwarded a default value
  // computed from the multi-select field metadata.
  it('should not respond a 400 when statuses are passed in the payload (regression)', async () => {
    await expect(
      hook.execute(
        authContext,
        objectName,
        buildPayload({
          name: 'My workflow',
          statuses: [WorkflowStatus.ACTIVE, WorkflowStatus.DRAFT],
        }),
      ),
    ).resolves.toBeDefined();
  });

  it('should strip statuses from payload data when statuses is set', async () => {
    const result = await hook.execute(
      authContext,
      objectName,
      buildPayload({
        name: 'My workflow',
        statuses: [WorkflowStatus.ACTIVE],
      }),
    );

    expect(result.data).not.toHaveProperty('statuses');
    expect(result.data.name).toBe('My workflow');
  });

  it('should strip statuses from payload data when statuses is an empty array', async () => {
    const result = await hook.execute(
      authContext,
      objectName,
      buildPayload({
        name: 'My workflow',
        statuses: [],
      }),
    );

    expect(result.data).not.toHaveProperty('statuses');
    expect(result.data.name).toBe('My workflow');
  });

  it('should leave payload data untouched when statuses is not set', async () => {
    const result = await hook.execute(
      authContext,
      objectName,
      buildPayload({ name: 'My workflow' }),
    );

    expect(result.data).not.toHaveProperty('statuses');
    expect(result.data.name).toBe('My workflow');
  });

  it('should preserve other top-level payload fields (e.g. upsert)', async () => {
    const result = await hook.execute(authContext, objectName, {
      data: {
        name: 'My workflow',
        statuses: [WorkflowStatus.DRAFT],
      } as WorkflowWorkspaceEntity,
      upsert: true,
    });

    expect(result.upsert).toBe(true);
    expect(result.data).not.toHaveProperty('statuses');
    expect(result.data.name).toBe('My workflow');
  });
});
