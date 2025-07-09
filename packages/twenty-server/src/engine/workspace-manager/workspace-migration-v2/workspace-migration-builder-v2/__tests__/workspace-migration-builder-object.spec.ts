import { getFlattenObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flatten-object-metadata.mock';
import { WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { EachTestingContext } from 'twenty-shared/testing';
import { capitalize } from 'twenty-shared/utils';

type WorkspaceBuilderArgs = Parameters<
  typeof WorkspaceMigrationBuilderV2Service.prototype.build
>[0];

type ConvertActionTypeToCamelCase<T extends string> =
  T extends `${infer Before}_${infer After}`
    ? `${Before}${Capitalize<After>}`
    : T;

type CamelCasedWorkspaceMigrationActionsType =
  ConvertActionTypeToCamelCase<WorkspaceMigrationActionTypeV2>;

type ExpectedActionCounters = {
  total: number; // Could be removed and computed dynamically but still a good thing for readability ?
} & Partial<Record<CamelCasedWorkspaceMigrationActionsType, number>>;

type TestCase = EachTestingContext<{
  input: WorkspaceBuilderArgs | (() => WorkspaceBuilderArgs);
  expectedActionsTypeCounter: ExpectedActionCounters;
}>;

const successfulTestCases: TestCase[] = [
  {
    title:
      'It should build an update_object action with all object updated fields',
    context: {
      input: () => {
        const flattenObjectMetadata = getFlattenObjectMetadata({
          uniqueIdentifier: 'pomme',
          nameSingular: 'toto',
          namePlural: 'totos',
          isLabelSyncedWithName: true,
        });
        return {
          from: [flattenObjectMetadata],
          to: [
            {
              ...flattenObjectMetadata,
              nameSingular: 'prastouin',
              namePlural: 'prastoins',
              isLabelSyncedWithName: false,
            },
          ],
        };
      },
      expectedActionsTypeCounter: {
        total: 1,
        updateObject: 1,
      },
    },
  },
  {
    title: 'It should build a create_object action',
    context: {
      input: () => {
        const flattenObjectMetadata = getFlattenObjectMetadata({
          uniqueIdentifier: 'pomme',
          nameSingular: 'toto',
          namePlural: 'totos',
          isLabelSyncedWithName: true,
        });
        return {
          from: [],
          to: [flattenObjectMetadata],
        };
      },
      expectedActionsTypeCounter: {
        total: 1,
        createObject: 1,
      },
    },
  },
  {
    title: 'It should build a delete_object action',
    context: {
      input: () => {
        const flattenObjectMetadata = getFlattenObjectMetadata({
          uniqueIdentifier: 'pomme',
          nameSingular: 'toto',
          namePlural: 'totos',
          isLabelSyncedWithName: true,
        });
        return {
          from: [flattenObjectMetadata],
          to: [],
        };
      },
      expectedActionsTypeCounter: {
        total: 1,
        deleteObject: 1,
      },
    },
  },
  {
    title: 'It should not infer any actions as from and to are identical',
    context: {
      input: () => {
        const from = [getFlattenObjectMetadata({ uniqueIdentifier: 'pomme' })];
        return {
          from,
          to: from,
        };
      },
      expectedActionsTypeCounter: {
        total: 0,
      },
    },
  },
];

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

  it.each(successfulTestCases)(
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
