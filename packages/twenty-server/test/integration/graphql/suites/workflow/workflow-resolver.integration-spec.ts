import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';

const COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  coreWorkflowVersionId
  engineComponentKey
  label
  shortLabel
`;

const UPDATE_CORE_WORKFLOW_MUTATION = `
  mutation UpdateCoreWorkflow($input: UpdateCoreWorkflowInput!) {
    updateCoreWorkflow(input: $input) {
      id
      name
    }
  }
`;

const findCommandMenuItemForCoreWorkflowVersion = async (
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
  let coreWorkflowId: string | undefined;
  let coreWorkflowVersionId: string;

  const renameWorkflow = async (name: string) => {
    const response = await workflowGraphqlRequest(
      UPDATE_CORE_WORKFLOW_MUTATION,
      { input: { coreWorkflowId, name } },
    );

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: initialWorkflowName,
    }));

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion(coreWorkflowVersionId);
  });

  afterAll(async () => {
    await deleteCoreWorkflows([coreWorkflowId].filter(isDefined));
  });

  it('labels the command menu item with the workflow name on activation', async () => {
    const commandMenuItem = await findCommandMenuItemForCoreWorkflowVersion(
      coreWorkflowVersionId,
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

    const commandMenuItem = await findCommandMenuItemForCoreWorkflowVersion(
      coreWorkflowVersionId,
    );

    expect(commandMenuItem?.label).toBe(renamedWorkflowName);
    expect(commandMenuItem?.shortLabel).toBe(renamedWorkflowName);
  });

  it('falls back to "Untitled Workflow" when the workflow name is cleared', async () => {
    await renameWorkflow('');

    const commandMenuItem = await findCommandMenuItemForCoreWorkflowVersion(
      coreWorkflowVersionId,
    );

    expect(commandMenuItem?.label).toBe('Untitled Workflow');
    expect(commandMenuItem?.shortLabel).toBe('Untitled Workflow');
  });
});
