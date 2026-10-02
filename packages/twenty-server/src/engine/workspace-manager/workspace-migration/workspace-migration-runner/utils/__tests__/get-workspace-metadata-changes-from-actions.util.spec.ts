import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import { getWorkspaceMetadataChangesFromActions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-metadata-changes-from-actions.util';

describe('getWorkspaceMetadataChangesFromActions', () => {
  it('lists each action with the properties its update touches', () => {
    const actions = [
      {
        type: 'create',
        metadataName: 'roleTarget',
        flatEntity: {},
      },
      {
        type: 'update',
        metadataName: 'objectMetadata',
        universalIdentifier: 'object-universal-identifier',
        update: {
          labelIdentifierFieldMetadataUniversalIdentifier:
            'field-universal-identifier',
          labelSingular: 'Company',
        },
      },
      {
        type: 'delete',
        metadataName: 'fieldMetadata',
        universalIdentifier: 'field-universal-identifier',
      },
    ] as AllUniversalWorkspaceMigrationAction[];

    expect(getWorkspaceMetadataChangesFromActions(actions)).toEqual([
      { metadataName: 'roleTarget', actionType: 'create' },
      {
        metadataName: 'objectMetadata',
        actionType: 'update',
        updatedProperties: [
          'labelIdentifierFieldMetadataUniversalIdentifier',
          'labelSingular',
        ],
      },
      { metadataName: 'fieldMetadata', actionType: 'delete' },
    ]);
  });
});
