import { buildVisibleToCallerSqlPredicate } from 'src/engine/metadata-modules/metadata-ownership/utils/build-visible-to-caller-sql-predicate.util';

describe('buildVisibleToCallerSqlPredicate', () => {
  it('keeps workspace views and the views owned by the caller', () => {
    expect(
      buildVisibleToCallerSqlPredicate({
        rootMetadataName: 'view',
        tableAlias: 'view',
        userWorkspaceIdParameter: '$2',
      }),
    ).toBe(
      `(view."visibility" = 'WORKSPACE' OR view."createdByUserWorkspaceId" = $2::uuid)`,
    );
  });

  it('keeps workspace workflows and the workflows owned by the caller', () => {
    expect(
      buildVisibleToCallerSqlPredicate({
        rootMetadataName: 'workflow',
        tableAlias: 'workflow',
        userWorkspaceIdParameter: ':userWorkspaceId',
      }),
    ).toBe(
      `(workflow."visibility" = 'WORKSPACE' OR workflow."createdByUserWorkspaceId" = :userWorkspaceId::uuid)`,
    );
  });
});
