import { WorkflowVisibility } from 'twenty-shared/types';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { buildVisibleToCallerSqlPredicate } from 'src/engine/metadata-modules/metadata-ownership/utils/build-visible-to-caller-sql-predicate.util';
import { isVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-visible-to-caller.util';

const OWNER_USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000002';

const CALLERS: { description: string; caller: MetadataCaller }[] = [
  {
    description: 'the owner',
    caller: {
      type: 'workspaceMember',
      userWorkspaceId: OWNER_USER_WORKSPACE_ID,
    },
  },
  {
    description: 'another member',
    caller: {
      type: 'workspaceMember',
      userWorkspaceId: OTHER_USER_WORKSPACE_ID,
    },
  },
  {
    description: 'a caller without a workspace member',
    caller: { type: 'withoutWorkspaceMember' },
  },
];

const WORKFLOW_ROWS = [
  WorkflowVisibility.WORKSPACE,
  WorkflowVisibility.PRIVATE,
].flatMap((visibility) =>
  [null, OWNER_USER_WORKSPACE_ID, OTHER_USER_WORKSPACE_ID].map(
    (createdByUserWorkspaceId) => ({
      id: `${visibility}-${createdByUserWorkspaceId ?? 'ownerless'}`,
      visibility,
      createdByUserWorkspaceId,
    }),
  ),
);

const findVisibleWorkflowIdsWithSqlPredicate = async (
  caller: MetadataCaller,
): Promise<string[]> => {
  const rowsSql = WORKFLOW_ROWS.map((_row, index) => {
    const firstParameterPosition = index * 3 + 1;

    return `($${firstParameterPosition}::text, $${firstParameterPosition + 1}::text, $${firstParameterPosition + 2}::uuid)`;
  }).join(', ');
  const rowParameters = WORKFLOW_ROWS.flatMap((row) => [
    row.id,
    row.visibility,
    row.createdByUserWorkspaceId,
  ]);
  const visibleToCallerSqlPredicate = buildVisibleToCallerSqlPredicate({
    rootMetadataName: 'workflow',
    tableAlias: 'ownable',
    userWorkspaceIdParameter: `$${rowParameters.length + 1}`,
    caller,
  });

  if (visibleToCallerSqlPredicate === undefined) {
    throw new Error('Expected a predicate for a caller that does not bypass');
  }

  const visibleRows: { id: string }[] = await globalThis.testDataSource.query(
    `SELECT ownable."id"
     FROM (VALUES ${rowsSql}) AS ownable("id", "visibility", "createdByUserWorkspaceId")
     WHERE ${visibleToCallerSqlPredicate.sql}`,
    [...rowParameters, visibleToCallerSqlPredicate.userWorkspaceId],
  );

  return visibleRows.map((visibleRow) => visibleRow.id).sort();
};

describe('visible to caller SQL predicate', () => {
  it.each(CALLERS)(
    'selects the workflows isVisibleToCaller shows to $description',
    async ({ caller }) => {
      const expectedWorkflowIds = WORKFLOW_ROWS.filter((row) =>
        isVisibleToCaller({ rootMetadataName: 'workflow', row, caller }),
      )
        .map((row) => row.id)
        .sort();

      expect(expectedWorkflowIds.length).toBeLessThan(WORKFLOW_ROWS.length);
      expect(await findVisibleWorkflowIdsWithSqlPredicate(caller)).toEqual(
        expectedWorkflowIds,
      );
    },
  );

  it('selects every workflow for a caller that bypasses privacy', () => {
    expect(
      buildVisibleToCallerSqlPredicate({
        rootMetadataName: 'workflow',
        tableAlias: 'ownable',
        userWorkspaceIdParameter: '$1',
        caller: { type: 'bypassesPrivacy' },
      }),
    ).toBeUndefined();
    expect(
      WORKFLOW_ROWS.every((row) =>
        isVisibleToCaller({
          rootMetadataName: 'workflow',
          row,
          caller: { type: 'bypassesPrivacy' },
        }),
      ),
    ).toBe(true);
  });
});
