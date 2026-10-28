import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import { getFlatEntityMapsKeysToInvalidateForWorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-flat-entity-maps-keys-to-invalidate-for-workspace-migration.util';

const buildAction = (
  action: Partial<AllUniversalWorkspaceMigrationAction> &
    Pick<AllUniversalWorkspaceMigrationAction, 'type' | 'metadataName'>,
): AllUniversalWorkspaceMigrationAction =>
  action as AllUniversalWorkspaceMigrationAction;

describe('getFlatEntityMapsKeysToInvalidateForWorkspaceMigration', () => {
  it('invalidates only the view field map for a viewField reorder', () => {
    const result = getFlatEntityMapsKeysToInvalidateForWorkspaceMigration([
      buildAction({
        type: 'update',
        metadataName: 'viewField',
        universalIdentifier: 'view-field-1',
        update: { position: 2 },
      }),
    ]);

    expect(result).toEqual(['flatViewFieldMaps']);
  });

  it('invalidates the view field group map when a viewField update moves it between groups', () => {
    const result = getFlatEntityMapsKeysToInvalidateForWorkspaceMigration([
      buildAction({
        type: 'update',
        metadataName: 'viewField',
        universalIdentifier: 'view-field-1',
        update: {
          position: 2,
          viewFieldGroupUniversalIdentifier: 'view-field-group-1',
        },
      }),
    ]);

    expect(result.sort()).toEqual(
      ['flatViewFieldGroupMaps', 'flatViewFieldMaps'].sort(),
    );
    expect(result).not.toContain('flatObjectMetadataMaps');
    expect(result).not.toContain('flatFieldMetadataMaps');
  });

  it('invalidates the view field map plus every many-to-one related map on create', () => {
    const result = getFlatEntityMapsKeysToInvalidateForWorkspaceMigration([
      buildAction({
        type: 'create',
        metadataName: 'viewField',
      }),
    ]);

    expect(result.sort()).toEqual(
      [
        'flatFieldMetadataMaps',
        'flatViewFieldGroupMaps',
        'flatViewFieldMaps',
        'flatViewMaps',
      ].sort(),
    );
    expect(result).not.toContain('flatObjectMetadataMaps');
  });

  it('invalidates the view field map plus every many-to-one related map on delete', () => {
    const result = getFlatEntityMapsKeysToInvalidateForWorkspaceMigration([
      buildAction({
        type: 'delete',
        metadataName: 'viewField',
        universalIdentifier: 'view-field-1',
      }),
    ]);

    expect(result.sort()).toEqual(
      [
        'flatFieldMetadataMaps',
        'flatViewFieldGroupMaps',
        'flatViewFieldMaps',
        'flatViewMaps',
      ].sort(),
    );
    expect(result).not.toContain('flatObjectMetadataMaps');
  });

  it('invalidates only the field metadata map for a non-relation field update', () => {
    const result = getFlatEntityMapsKeysToInvalidateForWorkspaceMigration([
      buildAction({
        type: 'update',
        metadataName: 'fieldMetadata',
        universalIdentifier: 'field-1',
        update: { label: 'Renamed' },
      }),
    ]);

    expect(result).toEqual(['flatFieldMetadataMaps']);
  });

  it('still invalidates the object metadata map when a field is created', () => {
    const result = getFlatEntityMapsKeysToInvalidateForWorkspaceMigration([
      buildAction({
        type: 'create',
        metadataName: 'fieldMetadata',
      }),
    ]);

    expect(result.sort()).toEqual(
      ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'].sort(),
    );
  });

  it('deduplicates keys across several actions', () => {
    const result = getFlatEntityMapsKeysToInvalidateForWorkspaceMigration([
      buildAction({
        type: 'update',
        metadataName: 'viewField',
        universalIdentifier: 'view-field-1',
        update: { position: 1 },
      }),
      buildAction({
        type: 'update',
        metadataName: 'viewField',
        universalIdentifier: 'view-field-2',
        update: { position: 2 },
      }),
    ]);

    expect(result).toEqual(['flatViewFieldMaps']);
  });
});
