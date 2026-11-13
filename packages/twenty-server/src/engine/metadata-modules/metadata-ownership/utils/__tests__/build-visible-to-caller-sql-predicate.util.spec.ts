import { buildVisibleToCallerSqlPredicate } from 'src/engine/metadata-modules/metadata-ownership/utils/build-visible-to-caller-sql-predicate.util';

const WORKFLOW_SQL = `(NOT ("workflow"."visibility" <> 'WORKSPACE') OR "workflow"."createdByUserWorkspaceId" = $1::uuid)`;

describe('buildVisibleToCallerSqlPredicate', () => {
  it('binds the member and keeps the rows they own', () => {
    expect(
      buildVisibleToCallerSqlPredicate({
        rootMetadataName: 'workflow',
        tableAlias: 'workflow',
        userWorkspaceIdParameter: '$1',
        caller: {
          type: 'workspaceMember',
          userWorkspaceId: 'owner-user-workspace-id',
        },
      }),
    ).toEqual({
      sql: WORKFLOW_SQL,
      userWorkspaceId: 'owner-user-workspace-id',
    });
  });

  it('binds no member for a caller without one, leaving workspace rows only', () => {
    expect(
      buildVisibleToCallerSqlPredicate({
        rootMetadataName: 'workflow',
        tableAlias: 'workflow',
        userWorkspaceIdParameter: '$1',
        caller: { type: 'withoutWorkspaceMember' },
      }),
    ).toEqual({ sql: WORKFLOW_SQL, userWorkspaceId: null });
  });

  it('restricts nothing for a caller that bypasses privacy', () => {
    expect(
      buildVisibleToCallerSqlPredicate({
        rootMetadataName: 'workflow',
        tableAlias: 'workflow',
        userWorkspaceIdParameter: '$1',
        caller: { type: 'bypassesPrivacy' },
      }),
    ).toBeUndefined();
  });

  it('quotes the table alias it is given', () => {
    expect(
      buildVisibleToCallerSqlPredicate({
        rootMetadataName: 'workflow',
        tableAlias: 'coreWorkflow',
        userWorkspaceIdParameter: ':userWorkspaceId',
        caller: { type: 'withoutWorkspaceMember' },
      })?.sql,
    ).toBe(
      `(NOT ("coreWorkflow"."visibility" <> 'WORKSPACE') OR "coreWorkflow"."createdByUserWorkspaceId" = :userWorkspaceId::uuid)`,
    );
  });
});
