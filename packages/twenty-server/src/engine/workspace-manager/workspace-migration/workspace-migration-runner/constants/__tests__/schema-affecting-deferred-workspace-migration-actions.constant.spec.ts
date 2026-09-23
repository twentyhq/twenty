import { SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/schema-affecting-deferred-workspace-migration-actions.constant';

describe('SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS', () => {
  it('should hold the deferrable actions that build workspace schema objects', () => {
    expect(SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS).toEqual([
      'create_index',
    ]);
  });

  it('should leave out the deferrable actions that only touch external resources', () => {
    expect(SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS).not.toContain(
      'delete_logicFunction',
    );
  });
});
