import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { getInvalidatedMetadataNamesFromActions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-invalidated-metadata-names-from-actions.util';

describe('getInvalidatedMetadataNamesFromActions', () => {
  it('invalidates only the mutated map for an attribute-only update', () => {
    const actions = [
      {
        type: 'update' as const,
        metadataName: 'viewField' as const,
        universalIdentifier: 'view-field-1',
        update: { position: 3 },
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    const result = getInvalidatedMetadataNamesFromActions(actions);

    expect(result).toEqual(['viewField']);
  });

  it('invalidates related maps when an update moves a relation foreign key', () => {
    const actions = [
      {
        type: 'update' as const,
        metadataName: 'viewField' as const,
        universalIdentifier: 'view-field-1',
        update: { viewUniversalIdentifier: 'view-2' },
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    const result = getInvalidatedMetadataNamesFromActions(actions);

    expect(result.sort()).toEqual(
      ['fieldMetadata', 'view', 'viewField', 'viewFieldGroup'].sort(),
    );
    expect(result).not.toContain('objectMetadata');
  });

  it('detects relation changes expressed with a universal foreign key', () => {
    const actions = [
      {
        type: 'update' as const,
        metadataName: 'viewField' as const,
        universalIdentifier: 'view-field-1',
        update: { viewFieldGroupUniversalIdentifier: 'group-2' },
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    const result = getInvalidatedMetadataNamesFromActions(actions);

    expect(result).toContain('viewFieldGroup');
  });

  it('invalidates serialized relation maps when an update modifies serialized relations', () => {
    const actions = [
      {
        type: 'update' as const,
        metadataName: 'pageLayoutWidget' as const,
        universalIdentifier: 'widget-1',
        update: { universalConfiguration: {} as any },
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    const result = getInvalidatedMetadataNamesFromActions(actions);

    expect(result).toContain('pageLayoutWidget');
    expect(result).toContain('fieldMetadata');
    expect(result).toContain('view');
    expect(result).toContain('viewFieldGroup');
    expect(result).toContain('frontComponent');
  });

  it('invalidates related maps on create', () => {
    const actions = [
      {
        type: 'create' as const,
        metadataName: 'viewField' as const,
        flatEntity: {},
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    const result = getInvalidatedMetadataNamesFromActions(actions);

    expect(result.sort()).toEqual(
      ['fieldMetadata', 'view', 'viewField', 'viewFieldGroup'].sort(),
    );
  });

  it('invalidates related maps on delete', () => {
    const actions = [
      {
        type: 'delete' as const,
        metadataName: 'viewField' as const,
        universalIdentifier: 'view-field-1',
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    const result = getInvalidatedMetadataNamesFromActions(actions);

    expect(result).toContain('view');
    expect(result).toContain('viewField');
  });

  it('deduplicates across multiple actions', () => {
    const actions = [
      {
        type: 'update' as const,
        metadataName: 'viewField' as const,
        universalIdentifier: 'view-field-1',
        update: { position: 1 },
      },
      {
        type: 'update' as const,
        metadataName: 'viewField' as const,
        universalIdentifier: 'view-field-2',
        update: { position: 2 },
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    const result = getInvalidatedMetadataNamesFromActions(actions);

    expect(result).toEqual(['viewField']);
  });
});
