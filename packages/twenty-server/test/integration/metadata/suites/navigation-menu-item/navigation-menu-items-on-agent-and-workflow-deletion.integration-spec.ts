import { NavigationMenuItemType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';

type CoreTableName = 'navigationMenuItem' | 'agent' | 'workflow';

const findExistingRowIds = async (
  tableName: CoreTableName,
  ids: string[],
): Promise<string[]> => {
  const rows: { id: string }[] = await global.testDataSource.query(
    `SELECT id FROM core."${tableName}" WHERE id = ANY($1::uuid[])`,
    [ids],
  );

  return rows.map((row) => row.id);
};

const findServedNavigationMenuItemIds = async (
  navigationMenuItemIds: string[],
): Promise<string[]> => {
  const navigationMenuItemIdsToFind = new Set(navigationMenuItemIds);
  const {
    data: { navigationMenuItems },
  } = await findNavigationMenuItems({
    expectToFail: false,
    input: undefined,
    gqlFields: 'id',
  });

  return navigationMenuItems
    .map((navigationMenuItem) => navigationMenuItem.id)
    .filter((id) => navigationMenuItemIdsToFind.has(id));
};

describe('Navigation menu items on agent and workflow deletion', () => {
  const uniqueSuffix = Date.now().toString().slice(-8);

  let publisher: MetadataEventPublisher;
  let emitter: MetadataEventEmitter;
  let navigationMenuItemIdsToCleanUp: string[] = [];
  let agentIdsToCleanUp: string[] = [];
  let coreWorkflowIdsToCleanUp: string[] = [];

  beforeAll(() => {
    publisher = getAppProviderByClassName('MetadataEventPublisher');
    emitter = getAppProviderByClassName('MetadataEventEmitter');
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    for (const navigationMenuItemId of await findExistingRowIds(
      'navigationMenuItem',
      navigationMenuItemIdsToCleanUp,
    )) {
      await deleteNavigationMenuItem({
        input: { id: navigationMenuItemId },
        expectToFail: false,
      });
    }

    for (const agentId of await findExistingRowIds(
      'agent',
      agentIdsToCleanUp,
    )) {
      await deleteOneAgent({ input: { id: agentId }, expectToFail: false });
    }

    const remainingCoreWorkflowIds = await findExistingRowIds(
      'workflow',
      coreWorkflowIdsToCleanUp,
    );

    if (isNonEmptyArray(remainingCoreWorkflowIds)) {
      await deleteCoreWorkflows({ coreWorkflowIds: remainingCoreWorkflowIds });
    }

    navigationMenuItemIdsToCleanUp = [];
    agentIdsToCleanUp = [];
    coreWorkflowIdsToCleanUp = [];
  });

  const listNavigationMenuItemDeletionsPublishedDuring = async (
    deleteTarget: () => Promise<unknown>,
  ): Promise<string[]> => {
    await emitter.drain();

    const deletedNavigationMenuItemIds: string[] = [];
    const publish = publisher.publish.bind(publisher);

    jest.spyOn(publisher, 'publish').mockImplementation(async (batch) => {
      if (
        batch.metadataName === 'navigationMenuItem' &&
        batch.type === 'deleted'
      ) {
        deletedNavigationMenuItemIds.push(
          ...batch.events.map((event) => event.recordId),
        );
      }

      await publish(batch);
    });

    await deleteTarget();
    await emitter.drain();

    return deletedNavigationMenuItemIds;
  };

  it('should remove an AGENT navigation menu item and publish its deletion once its agent is deleted', async () => {
    const {
      data: { createOneAgent: agent },
    } = await createOneAgent({
      expectToFail: false,
      input: {
        label: `Pinned agent ${uniqueSuffix}`,
        prompt: 'Agent pinned to the sidebar',
        modelId: TEST_AI_MODEL_ID,
      },
      gqlFields: 'id',
    });

    agentIdsToCleanUp = [agent.id];

    const {
      data: { createNavigationMenuItem: agentItem },
    } = await createNavigationMenuItem({
      expectToFail: false,
      input: { type: NavigationMenuItemType.AGENT, agentId: agent.id },
      gqlFields: 'id',
    });

    navigationMenuItemIdsToCleanUp = [agentItem.id];

    const publishedDeletionIds =
      await listNavigationMenuItemDeletionsPublishedDuring(() =>
        deleteOneAgent({ input: { id: agent.id }, expectToFail: false }),
      );

    expect({
      apiItemIds: await findServedNavigationMenuItemIds(
        navigationMenuItemIdsToCleanUp,
      ),
      databaseRowIds: await findExistingRowIds(
        'navigationMenuItem',
        navigationMenuItemIdsToCleanUp,
      ),
      publishedDeletionIds,
    }).toEqual({
      apiItemIds: [],
      databaseRowIds: [],
      publishedDeletionIds: [agentItem.id],
    });
  });

  it('should remove a WORKFLOW navigation menu item and publish its deletion once its workflow is deleted', async () => {
    const { coreWorkflowId } = await createCoreWorkflow({
      name: `Pinned workflow ${uniqueSuffix}`,
    });

    coreWorkflowIdsToCleanUp = [coreWorkflowId];

    const {
      data: { createNavigationMenuItem: workflowItem },
    } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.WORKFLOW,
        workflowId: coreWorkflowId,
      },
      gqlFields: 'id',
    });

    navigationMenuItemIdsToCleanUp = [workflowItem.id];

    const publishedDeletionIds =
      await listNavigationMenuItemDeletionsPublishedDuring(() =>
        deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] }),
      );

    expect({
      apiItemIds: await findServedNavigationMenuItemIds([workflowItem.id]),
      databaseRowIds: await findExistingRowIds('navigationMenuItem', [
        workflowItem.id,
      ]),
      publishedDeletionIds,
    }).toEqual({
      apiItemIds: [],
      databaseRowIds: [],
      publishedDeletionIds: [workflowItem.id],
    });
  });
});
