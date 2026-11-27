import { getMetadataNamesToLoadForWorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-metadata-names-to-load-for-workspace-migration.util';

describe('getMetadataNamesToLoadForWorkspaceMigration', () => {
  it('loads the workflow a workflow version belongs to', () => {
    expect(
      getMetadataNamesToLoadForWorkspaceMigration(['workflowVersion']),
    ).toEqual(['workflowVersion', 'workflow']);
  });
});
