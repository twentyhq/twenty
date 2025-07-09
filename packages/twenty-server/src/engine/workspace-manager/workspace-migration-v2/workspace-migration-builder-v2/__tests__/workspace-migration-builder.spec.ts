import { WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-field-test-case';
import {
  CamelCasedWorkspaceMigrationActionsType,
  ExpectedActionCounters,
  WorkspaceMigrationBuilderTestCase,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/common/workspace-migration-builder-test-case.type';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { capitalize } from 'twenty-shared/utils';
const allWorkspaceBuilderTestCases: {
  label: string;
  testCases: WorkspaceMigrationBuilderTestCase[];
}[] = [
  // {
  //   label: 'object',
  //   testCases: WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES,
  // },
  {
    label: 'field',
    testCases: WORKSPACE_MIGRATION_FIELD_BUILDER_TEST_CASES,
  },
];

const expectedActionsTypeCounterChecker = ({
  expectedActionsTypeCounter,
  workspaceMigration,
}: {
  workspaceMigration: WorkspaceMigrationV2;
  expectedActionsTypeCounter: ExpectedActionCounters;
}) => {
  const initialAcc: ExpectedActionCounters = {
    total: 0,
    createField: 0,
    createIndex: 0,
    createObject: 0,
    deleteField: 0,
    deleteIndex: 0,
    deleteObject: 0,
    updateField: 0,
    updateObject: 0,
  };
  const actualActionsTypeCounter =
    workspaceMigration.actions.reduce<ExpectedActionCounters>((acc, action) => {
      const { type } = action;
      const [operation, target] = type.split('_');
      const formattedActionKey =
        `${operation}${capitalize(target)}` as CamelCasedWorkspaceMigrationActionsType;

      return {
        ...acc,
        total: acc.total + 1,
        [formattedActionKey]: (acc[formattedActionKey] ?? 0) + 1,
      };
    }, initialAcc);

  expect(actualActionsTypeCounter).toEqual({
    ...initialAcc,
    ...expectedActionsTypeCounter,
  });
};

describe.each(allWorkspaceBuilderTestCases)(
  'Workspace migration builder $label actions test suite',
  ({ testCases }) => {
    let service: WorkspaceMigrationBuilderV2Service;

    beforeEach(() => {
      service = new WorkspaceMigrationBuilderV2Service();
    });

    it.each(testCases)(
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
  },
);
