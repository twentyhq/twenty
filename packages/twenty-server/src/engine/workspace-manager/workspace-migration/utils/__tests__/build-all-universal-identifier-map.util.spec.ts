import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { buildAllUniversalIdentifierMap } from 'src/engine/workspace-manager/workspace-migration/utils/build-all-universal-identifier-map.util';

describe('buildAllUniversalIdentifierMap', () => {
  it('should return an empty map when all flat entity maps are empty', () => {
    const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

    const result = buildAllUniversalIdentifierMap(allFlatEntityMaps);

    expect(result.size).toBe(0);
  });

  it('should collect a single entity from one metadata type', () => {
    const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

    allFlatEntityMaps.flatRoleMaps.byUniversalIdentifier = {
      'role-uid-1': {
        universalIdentifier: 'role-uid-1',
        applicationUniversalIdentifier: 'app-uid-1',
      } as MetadataFlatEntity<'role'>,
    };

    const result = buildAllUniversalIdentifierMap(allFlatEntityMaps);

    expect(result.size).toBe(1);
    expect(result.get('role-uid-1')).toEqual({
      metadataName: 'role',
      applicationUniversalIdentifier: 'app-uid-1',
    });
  });

  it('should collect entities across multiple metadata types', () => {
    const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

    allFlatEntityMaps.flatRoleMaps.byUniversalIdentifier = {
      'role-uid-1': {
        universalIdentifier: 'role-uid-1',
        applicationUniversalIdentifier: 'app-uid-1',
      } as MetadataFlatEntity<'role'>,
    };

    allFlatEntityMaps.flatObjectPermissionMaps.byUniversalIdentifier = {
      'perm-uid-1': {
        universalIdentifier: 'perm-uid-1',
        applicationUniversalIdentifier: 'app-uid-1',
      } as MetadataFlatEntity<'objectPermission'>,
    };

    allFlatEntityMaps.flatViewMaps.byUniversalIdentifier = {
      'view-uid-1': {
        universalIdentifier: 'view-uid-1',
        applicationUniversalIdentifier: 'app-uid-2',
      } as MetadataFlatEntity<'view'>,
    };

    const result = buildAllUniversalIdentifierMap(allFlatEntityMaps);

    expect(result.size).toBe(3);
    expect(result.get('role-uid-1')).toEqual({
      metadataName: 'role',
      applicationUniversalIdentifier: 'app-uid-1',
    });
    expect(result.get('perm-uid-1')).toEqual({
      metadataName: 'objectPermission',
      applicationUniversalIdentifier: 'app-uid-1',
    });
    expect(result.get('view-uid-1')).toEqual({
      metadataName: 'view',
      applicationUniversalIdentifier: 'app-uid-2',
    });
  });

  it('should skip undefined entries in byUniversalIdentifier', () => {
    const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

    allFlatEntityMaps.flatRoleMaps.byUniversalIdentifier = {
      'role-uid-1': undefined,
      'role-uid-2': {
        universalIdentifier: 'role-uid-2',
        applicationUniversalIdentifier: 'app-uid-1',
      } as MetadataFlatEntity<'role'>,
    };

    const result = buildAllUniversalIdentifierMap(allFlatEntityMaps);

    expect(result.size).toBe(1);
    expect(result.has('role-uid-1')).toBe(false);
    expect(result.get('role-uid-2')).toEqual({
      metadataName: 'role',
      applicationUniversalIdentifier: 'app-uid-1',
    });
  });

  it('should handle multiple entities within the same metadata type', () => {
    const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier = {
      'field-uid-1': {
        universalIdentifier: 'field-uid-1',
        applicationUniversalIdentifier: 'app-uid-1',
      } as MetadataFlatEntity<'fieldMetadata'>,
      'field-uid-2': {
        universalIdentifier: 'field-uid-2',
        applicationUniversalIdentifier: 'app-uid-1',
      } as MetadataFlatEntity<'fieldMetadata'>,
      'field-uid-3': {
        universalIdentifier: 'field-uid-3',
        applicationUniversalIdentifier: 'app-uid-2',
      } as MetadataFlatEntity<'fieldMetadata'>,
    };

    const result = buildAllUniversalIdentifierMap(allFlatEntityMaps);

    expect(result.size).toBe(3);
    expect(result.get('field-uid-1')?.metadataName).toBe('fieldMetadata');
    expect(result.get('field-uid-2')?.metadataName).toBe('fieldMetadata');
    expect(result.get('field-uid-3')?.applicationUniversalIdentifier).toBe(
      'app-uid-2',
    );
  });
});
