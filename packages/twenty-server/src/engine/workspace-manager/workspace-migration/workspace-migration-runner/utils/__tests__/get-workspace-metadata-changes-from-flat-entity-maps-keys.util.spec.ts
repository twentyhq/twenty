import { getWorkspaceMetadataChangesFromFlatEntityMapsKeys } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-metadata-changes-from-flat-entity-maps-keys.util';

describe('getWorkspaceMetadataChangesFromFlatEntityMapsKeys', () => {
  it('assumes every kind of change for each metadata of the given maps', () => {
    expect(
      getWorkspaceMetadataChangesFromFlatEntityMapsKeys([
        'flatRoleTargetMaps',
        'flatApplicationVariableMaps',
      ]),
    ).toEqual([
      { metadataName: 'roleTarget', actionType: 'delete' },
      { metadataName: 'roleTarget', actionType: 'create' },
      { metadataName: 'roleTarget', actionType: 'update' },
      { metadataName: 'applicationVariable', actionType: 'delete' },
      { metadataName: 'applicationVariable', actionType: 'create' },
      { metadataName: 'applicationVariable', actionType: 'update' },
    ]);
  });

  it('returns no change for no maps', () => {
    expect(getWorkspaceMetadataChangesFromFlatEntityMapsKeys([])).toEqual([]);
  });
});
