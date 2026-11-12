import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { buildVisibleToCallerSqlPredicate } from 'src/engine/metadata-modules/metadata-ownership/utils/build-visible-to-caller-sql-predicate.util';
import { isVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-visible-to-caller.util';

const OWNER_USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000002';

const OWNER_USER_WORKSPACE_IDS = [
  null,
  OWNER_USER_WORKSPACE_ID,
  OTHER_USER_WORKSPACE_ID,
];

const CALLERS: { description: string; caller: MetadataCaller }[] = [
  { description: 'a caller without a user', caller: {} },
  {
    description: 'the owner',
    caller: { userWorkspaceId: OWNER_USER_WORKSPACE_ID },
  },
  {
    description: 'another member',
    caller: { userWorkspaceId: OTHER_USER_WORKSPACE_ID },
  },
];

const buildRows = <TVisibility extends string>(visibilities: TVisibility[]) =>
  visibilities.flatMap((visibility) =>
    OWNER_USER_WORKSPACE_IDS.map((createdByUserWorkspaceId) => ({
      id: `${visibility}-${createdByUserWorkspaceId ?? 'ownerless'}`,
      visibility,
      createdByUserWorkspaceId,
    })),
  );

const findVisibleRowIdsWithSqlPredicate = async ({
  rootMetadataName,
  rows,
  caller,
}: {
  rootMetadataName: OwnableRootMetadataName;
  rows: {
    id: string;
    visibility: string;
    createdByUserWorkspaceId: string | null;
  }[];
  caller: MetadataCaller;
}): Promise<string[]> => {
  const rowsSql = rows
    .map((_row, index) => {
      const firstParameterPosition = index * 3 + 1;

      return `($${firstParameterPosition}::text, $${firstParameterPosition + 1}::text, $${firstParameterPosition + 2}::uuid)`;
    })
    .join(', ');
  const rowParameters = rows.flatMap((row) => [
    row.id,
    row.visibility,
    row.createdByUserWorkspaceId,
  ]);
  const visibleToCallerSqlPredicate = buildVisibleToCallerSqlPredicate({
    rootMetadataName,
    tableAlias: 'ownable',
    userWorkspaceIdParameter: `$${rowParameters.length + 1}`,
  });

  const visibleRows: { id: string }[] = await globalThis.testDataSource.query(
    `SELECT ownable."id"
     FROM (VALUES ${rowsSql}) AS ownable("id", "visibility", "createdByUserWorkspaceId")
     WHERE ${visibleToCallerSqlPredicate}`,
    [...rowParameters, caller.userWorkspaceId ?? null],
  );

  return visibleRows.map((visibleRow) => visibleRow.id).sort();
};

describe('visible to caller SQL predicate', () => {
  const viewRows = buildRows([
    ViewVisibility.WORKSPACE,
    ViewVisibility.UNLISTED,
  ]);
  const workflowRows = buildRows([
    WorkflowVisibility.WORKSPACE,
    WorkflowVisibility.PRIVATE,
  ]);

  it.each(CALLERS)(
    'selects the views isVisibleToCaller shows to $description',
    async ({ caller }) => {
      const expectedRowIds = viewRows
        .filter((row) =>
          isVisibleToCaller({ rootMetadataName: 'view', row, caller }),
        )
        .map((row) => row.id)
        .sort();

      expect(expectedRowIds.length).toBeLessThan(viewRows.length);
      expect(
        await findVisibleRowIdsWithSqlPredicate({
          rootMetadataName: 'view',
          rows: viewRows,
          caller,
        }),
      ).toEqual(expectedRowIds);
    },
  );

  it.each(CALLERS)(
    'selects the workflows isVisibleToCaller shows to $description',
    async ({ caller }) => {
      const expectedRowIds = workflowRows
        .filter((row) =>
          isVisibleToCaller({ rootMetadataName: 'workflow', row, caller }),
        )
        .map((row) => row.id)
        .sort();

      expect(expectedRowIds.length).toBeLessThan(workflowRows.length);
      expect(
        await findVisibleRowIdsWithSqlPredicate({
          rootMetadataName: 'workflow',
          rows: workflowRows,
          caller,
        }),
      ).toEqual(expectedRowIds);
    },
  );
});
