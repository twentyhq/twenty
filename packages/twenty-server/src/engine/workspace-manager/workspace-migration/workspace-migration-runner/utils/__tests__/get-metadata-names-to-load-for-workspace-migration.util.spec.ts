import { getMetadataNamesToLoadForWorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-metadata-names-to-load-for-workspace-migration.util';

describe('getMetadataNamesToLoadForWorkspaceMigration', () => {
  it('loads no other metadata for workflow version writes', () => {
    expect(
      getMetadataNamesToLoadForWorkspaceMigration(['workflowVersion']),
    ).toEqual(['workflowVersion']);
  });
});
