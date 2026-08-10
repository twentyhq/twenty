import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { getInvalidatedMetadataNamesFromActions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-invalidated-metadata-names-from-actions.util';

const asActions = (
  actions: unknown[],
): AllUniversalWorkspaceMigrationAction[] =>
  actions as AllUniversalWorkspaceMigrationAction[];

describe('getInvalidatedMetadataNamesFromActions', () => {
  it('invalidates only the mutated map for an attribute-only update', () => {
    const result = getInvalidatedMetadataNamesFromActions(
      asActions([
        {
          type: 'update',
          metadataName: 'viewField',
          universalIdentifier: 'view-field-1',
          update: { position: 3 },
        },
      ]),
    );

    expect(result).toEqual(['viewField']);
  });

  it('invalidates related maps when an update moves a relation foreign key', () => {
    const result = getInvalidatedMetadataNamesFromActions(
      asActions([
        {
          type: 'update',
          metadataName: 'viewField',
          universalIdentifier: 'view-field-1',
          update: { viewFieldGroupId: 'group-2' },
        },
      ]),
    );

    expect(result.sort()).toEqual(
      ['fieldMetadata', 'view', 'viewField', 'viewFieldGroup'].sort(),
    );
    expect(result).not.toContain('objectMetadata');
  });

  it('detects relation changes expressed with a universal foreign key', () => {
    const result = getInvalidatedMetadataNamesFromActions(
      asActions([
        {
          type: 'update',
          metadataName: 'viewField',
          universalIdentifier: 'view-field-1',
          update: { viewFieldGroupUniversalIdentifier: 'group-2' },
        },
      ]),
    );

    expect(result).toContain('viewFieldGroup');
  });

  it('invalidates related maps on create', () => {
    const result = getInvalidatedMetadataNamesFromActions(
      asActions([
        {
          type: 'create',
          metadataName: 'viewField',
          flatEntity: {},
        },
      ]),
    );

    expect(result.sort()).toEqual(
      ['fieldMetadata', 'view', 'viewField', 'viewFieldGroup'].sort(),
    );
  });

  it('invalidates related maps on delete', () => {
    const result = getInvalidatedMetadataNamesFromActions(
      asActions([
        {
          type: 'delete',
          metadataName: 'viewField',
          universalIdentifier: 'view-field-1',
        },
      ]),
    );

    expect(result).toContain('view');
    expect(result).toContain('viewField');
  });

  it('deduplicates across multiple actions', () => {
    const result = getInvalidatedMetadataNamesFromActions(
      asActions([
        {
          type: 'update',
          metadataName: 'viewField',
          universalIdentifier: 'view-field-1',
          update: { position: 1 },
        },
        {
          type: 'update',
          metadataName: 'viewField',
          universalIdentifier: 'view-field-2',
          update: { position: 2 },
        },
      ]),
    );

    expect(result).toEqual(['viewField']);
  });
});
