import { createWorkflowAgentWaitTools } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/tools/create-workflow-agent-wait-tools.util';

type ExecutableTool = {
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

describe('createWorkflowAgentWaitTools', () => {
  it('refuses a second wait of the same execution so only one is pending', async () => {
    const tools = createWorkflowAgentWaitTools();
    const waitForEvent = tools.wait_for_event as unknown as ExecutableTool;
    const waitForDuration =
      tools.wait_for_duration as unknown as ExecutableTool;

    await expect(
      waitForEvent.execute({ objectName: 'company', action: 'updated' }),
    ).resolves.toMatchObject({ result: { status: 'pending' } });

    await expect(
      waitForDuration.execute({ durationInMinutes: 60 }),
    ).resolves.toMatchObject({ success: false });
  });

  it('only keeps a field filter on updates, where events report changed fields', async () => {
    const createdEventWait = await (
      createWorkflowAgentWaitTools().wait_for_event as unknown as ExecutableTool
    ).execute({
      objectName: 'company',
      action: 'created',
      updatedFields: ['name'],
    });
    const updatedEventWait = await (
      createWorkflowAgentWaitTools().wait_for_event as unknown as ExecutableTool
    ).execute({
      objectName: 'company',
      action: 'updated',
      updatedFields: ['name'],
    });

    expect(createdEventWait).toMatchObject({
      result: { wait: { type: 'EVENT', eventName: 'company.created' } },
    });
    expect(createdEventWait).not.toHaveProperty('result.wait.updatedFields');
    expect(updatedEventWait).toMatchObject({
      result: {
        wait: {
          type: 'EVENT',
          eventName: 'company.updated',
          updatedFields: ['name'],
        },
      },
    });
  });

  it('gives each execution its own wait', async () => {
    const firstExecutionTools = createWorkflowAgentWaitTools();
    const secondExecutionTools = createWorkflowAgentWaitTools();

    await (
      firstExecutionTools.wait_for_duration as unknown as ExecutableTool
    ).execute({ durationInMinutes: 5 });

    await expect(
      (
        secondExecutionTools.wait_for_duration as unknown as ExecutableTool
      ).execute({ durationInMinutes: 5 }),
    ).resolves.toMatchObject({ result: { status: 'pending' } });
  });
});
