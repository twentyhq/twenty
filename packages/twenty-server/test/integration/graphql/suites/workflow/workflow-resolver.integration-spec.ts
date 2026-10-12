import request from 'supertest';
import {
  activateCoreWorkflowVersion,
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deactivateCoreWorkflowVersion,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';

const client = request(`http://localhost:${APP_PORT}`);

describe('workflowResolver', () => {
  it('rejects creating a workflow through the records API', async () => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateOneWorkflow {
            createWorkflow(data: { name: "Records API Workflow" }) {
              id
            }
          }
        `,
      });

    expect(response.body.errors?.[0]?.message).toBe('Method not allowed.');
  });
});

const COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  coreWorkflowVersionId
  engineComponentKey
  label
  shortLabel
`;

const findCommandMenuItemForWorkflowVersion = async (
  coreWorkflowVersionId: string,
): Promise<CommandMenuItemDTO | undefined> => {
  const { data } = await findCommandMenuItems({
    input: undefined,
    gqlFields: COMMAND_MENU_ITEM_GQL_FIELDS,
  });

  return data?.commandMenuItems.find(
    (item) => item.coreWorkflowVersionId === coreWorkflowVersionId,
  );
};

describe('workflowResolver command menu item label', () => {
  const initialWorkflowName = 'Command Menu Label Sync Test';
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;

  const renameWorkflow = async (name: string) => {
    await coreWorkflowGraphqlRequest({
      query: `
        mutation UpdateCoreWorkflow($input: UpdateCoreWorkflowInput!) {
          updateCoreWorkflow(input: $input) {
            id
          }
        }
      `,
      variables: { input: { coreWorkflowId, name } },
    });
  };

  beforeAll(async () => {
    const coreWorkflow = await createCoreWorkflow({
      name: initialWorkflowName,
    });

    coreWorkflowId = coreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = coreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterAll(async () => {
    if (coreWorkflowVersionId) {
      await deactivateCoreWorkflowVersion({ coreWorkflowVersionId });
    }

    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('labels the command menu item with the workflow name on activation', async () => {
    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      coreWorkflowVersionId as string,
    );

    expect(commandMenuItem).toBeDefined();
    expect(commandMenuItem?.engineComponentKey).toBe(
      'TRIGGER_WORKFLOW_VERSION',
    );
    expect(commandMenuItem?.label).toBe(initialWorkflowName);
    expect(commandMenuItem?.shortLabel).toBe(initialWorkflowName);
  });

  it('updates the command menu item label when the workflow is renamed', async () => {
    const renamedWorkflowName = 'Renamed Command Menu Workflow';

    await renameWorkflow(renamedWorkflowName);

    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      coreWorkflowVersionId as string,
    );

    expect(commandMenuItem?.label).toBe(renamedWorkflowName);
    expect(commandMenuItem?.shortLabel).toBe(renamedWorkflowName);
  });

  it('falls back to "Untitled Workflow" when the workflow name is cleared', async () => {
    await renameWorkflow('');

    const commandMenuItem = await findCommandMenuItemForWorkflowVersion(
      coreWorkflowVersionId as string,
    );

    expect(commandMenuItem?.label).toBe('Untitled Workflow');
    expect(commandMenuItem?.shortLabel).toBe('Untitled Workflow');
  });
});
