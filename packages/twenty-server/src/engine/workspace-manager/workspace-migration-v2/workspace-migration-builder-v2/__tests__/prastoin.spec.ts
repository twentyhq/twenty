import { getFlattenObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/__tests__/get-flatten-object-metadata.mock';
import { WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { EachTestingContext } from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

type WorkspaceBuilderArgs = Parameters<
  typeof WorkspaceMigrationBuilderV2Service.prototype.build
>[0];

type ConvertActionTypeToCamelCase<T extends string> =
  T extends `${infer Before}_${infer After}`
    ? `${Before}${Capitalize<After>}`
    : T;

type TestCase = EachTestingContext<{
  input: WorkspaceBuilderArgs | (() => WorkspaceBuilderArgs);
  expected?: {
    total: number;
  } & Partial<
    Record<ConvertActionTypeToCamelCase<WorkspaceMigrationActionTypeV2>, number>
  >;
}>;

const successfulTestCases: TestCase[] = [
  // {
  //   title: 'Fist test',
  //   context: {
  //     input: {
  //       from: [getFlattenObjectMetadata({ uniqueIdentifier: 'pomme' })],
  //       to: [getFlattenObjectMetadata({ uniqueIdentifier: 'pomme' })],
  //     },
  //   },
  // },
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
      expected: {
        total: 0,
      },
    },
  },
];
describe('WorkspaceMigrationBuilderV2Service', () => {
  let service: WorkspaceMigrationBuilderV2Service;

  beforeEach(() => {
    service = new WorkspaceMigrationBuilderV2Service();
  });

  it.each(successfulTestCases)('$title', ({ context: { input, expected } }) => {
    const { from, to } = typeof input === 'function' ? input() : input;
    const workspaceMigration = service.build({
      from,
      to,
    });

    if (isDefined(expected?.total)) {
      expect(workspaceMigration.actions.length).toBe(expected?.total);
    }
    expect(workspaceMigration).toMatchSnapshot();
  });
});
