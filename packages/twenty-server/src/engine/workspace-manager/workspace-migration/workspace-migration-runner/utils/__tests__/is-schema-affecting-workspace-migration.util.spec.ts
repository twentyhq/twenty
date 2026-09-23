import { isSchemaAffectingWorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/is-schema-affecting-workspace-migration.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

const buildAction = (
  metadataName: string,
  type = 'create',
): AllUniversalWorkspaceMigrationAction =>
  ({ metadataName, type }) as AllUniversalWorkspaceMigrationAction;

describe('isSchemaAffectingWorkspaceMigration', () => {
  it.each(['objectMetadata', 'fieldMetadata', 'index'])(
    'should return true for a migration touching %s',
    (metadataName) => {
      expect(
        isSchemaAffectingWorkspaceMigration([
          buildAction('view'),
          buildAction(metadataName),
        ]),
      ).toBe(true);
    },
  );

  it('should return false for a migration touching no workspace schema metadata', () => {
    expect(
      isSchemaAffectingWorkspaceMigration([
        buildAction('view'),
        buildAction('viewField'),
        buildAction('logicFunction'),
      ]),
    ).toBe(false);
  });

  it('should return false for an empty migration', () => {
    expect(isSchemaAffectingWorkspaceMigration([])).toBe(false);
  });
});
