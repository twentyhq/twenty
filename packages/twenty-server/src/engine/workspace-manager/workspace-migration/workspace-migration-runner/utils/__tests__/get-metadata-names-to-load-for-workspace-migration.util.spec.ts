import { getMetadataNamesToLoadForWorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-metadata-names-to-load-for-workspace-migration.util';

describe('getMetadataNamesToLoadForWorkspaceMigration', () => {
  it('keeps workflow version writes from invalidating object and field metadata', () => {
    const metadataNames = getMetadataNamesToLoadForWorkspaceMigration([
      'workflowVersion',
    ]);

    expect(metadataNames).not.toContain('objectMetadata');
    expect(metadataNames).not.toContain('fieldMetadata');
  });
});
