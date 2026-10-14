import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { AggregateOperations } from 'twenty-shared/types';

import { type CountMessageListMembersCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791977057418-count-message-list-members.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const MEMBERS_NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.views.messageListRecordPageMembers.viewFields.name
    .universalIdentifier;

const readMembersAggregateOperation = async () => {
  const [viewField]: { aggregateOperation: AggregateOperations | null }[] =
    await global.testDataSource.query(
      `SELECT "aggregateOperation"
       FROM core."viewField"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_APPLE_WORKSPACE_ID, MEMBERS_NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER],
    );

  return viewField.aggregateOperation;
};

describe('2-48 workspace command - count message list members (integration)', () => {
  let command: CountMessageListMembersCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const setMembersAggregateOperation = async (
    aggregateOperation: AggregateOperations | null,
  ) => {
    await global.testDataSource.query(
      `UPDATE core."viewField"
       SET "aggregateOperation" = $3
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        MEMBERS_NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        aggregateOperation,
      ],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatViewFieldMaps'],
    );
  };

  beforeAll(() => {
    command = getAppProviderByClassName<CountMessageListMembersCommand>(
      'CountMessageListMembersCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await setMembersAggregateOperation(AggregateOperations.COUNT);
  });

  it('removes the members count on down, and adds it back on up', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readMembersAggregateOperation()).toBeNull();

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readMembersAggregateOperation()).toBe(
      AggregateOperations.COUNT,
    );
  });

  it('keeps an aggregate the workspace changed', async () => {
    await setMembersAggregateOperation(AggregateOperations.COUNT_EMPTY);

    await command.down(RUN_ON_WORKSPACE_ARGS);
    expect(await readMembersAggregateOperation()).toBe(
      AggregateOperations.COUNT_EMPTY,
    );

    await command.up(RUN_ON_WORKSPACE_ARGS);
    expect(await readMembersAggregateOperation()).toBe(
      AggregateOperations.COUNT_EMPTY,
    );
  });
});
