import { WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-object-rest-case';
import {
  CamelCasedWorkspaceMigrationActionsType,
  ExpectedActionCounters,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-test-case.type';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { capitalize } from 'twenty-shared/utils';

describe('Workspace migration builder object actions test suite', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  beforeEach(() => {
    service = new WorkspaceMigrationBuilderV2Service();
  });

  const expectedActionsTypeCounterChecker = ({
    expectedActionsTypeCounter,
    workspaceMigration,
  }: {
    workspaceMigration: WorkspaceMigrationV2;
    expectedActionsTypeCounter: ExpectedActionCounters;
  }) => {
    const initialAcc: ExpectedActionCounters = { total: 0 };
    const actualActionsTypeCounter =
      workspaceMigration.actions.reduce<ExpectedActionCounters>(
        (acc, action) => {
          const { type } = action;
          const [operation, target] = type.split('_');
          const formattedActionKey =
            `${operation}${capitalize(target)}` as CamelCasedWorkspaceMigrationActionsType;

          return {
            ...acc,
            total: acc.total + 1,
            [formattedActionKey]: acc[formattedActionKey] ?? 0 + 1,
          };
        },
        initialAcc,
      );

    expect(actualActionsTypeCounter).toEqual(expectedActionsTypeCounter);
  };

  it.each(WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES)(
    '$title',
    ({ context: { input, expectedActionsTypeCounter } }) => {
      const { from, to } = typeof input === 'function' ? input() : input;
      const workspaceMigration = service.build({
        from,
        to,
      });

      expectedActionsTypeCounterChecker({
        expectedActionsTypeCounter,
        workspaceMigration,
      });
      const { actions, ...rest } = workspaceMigration;
      expect(actions).toMatchSnapshot(
        actions.map(extractRecordIdsAndDatesAsExpectAny),
      );
      expect(rest).toMatchSnapshot();
    },
  );
});
