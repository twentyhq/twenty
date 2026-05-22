import { v5 } from 'uuid';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  CREATE_RECORD_COMMAND_UUID_NAMESPACE,
  CREATE_RECORD_INTERPOLATED_ICON,
  CREATE_RECORD_INTERPOLATED_LABEL,
  CREATE_RECORD_INTERPOLATED_SHORT_LABEL,
  buildCreateRecordFlatCommandMenuItem,
  buildUpdatedCreateRecordFlatCommandMenuItem,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-create-record-flat-command-menu-item.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

describe('buildCreateRecordFlatCommandMenuItem', () => {
  it('builds a deterministic global create command for an object', () => {
    const objectUniversalIdentifier = '5da6fdc9-48db-4cd1-b41c-907d8edaaf7b';

    const result = buildCreateRecordFlatCommandMenuItem({
      objectMetadata: {
        id: 'object-metadata-id',
        universalIdentifier: objectUniversalIdentifier,
        nameSingular: 'company',
      },
      commandMenuItemId: 'command-menu-item-id',
      applicationId: 'application-id',
      workspaceId: 'workspace-id',
      position: 42,
      now: '2026-05-22T00:00:00.000Z',
    });

    expect(result).toEqual({
      id: 'command-menu-item-id',
      universalIdentifier: v5(
        objectUniversalIdentifier,
        CREATE_RECORD_COMMAND_UUID_NAMESPACE,
      ),
      applicationId: 'application-id',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      workspaceId: 'workspace-id',
      label: CREATE_RECORD_INTERPOLATED_LABEL,
      shortLabel: CREATE_RECORD_INTERPOLATED_SHORT_LABEL,
      icon: CREATE_RECORD_INTERPOLATED_ICON,
      position: 42,
      isPinned: false,
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      conditionalAvailabilityExpression:
        'targetObjectWritePermissions.company and not (pageType == "INDEX_PAGE" and objectMetadataItem.nameSingular == "company")',
      frontComponentId: null,
      frontComponentUniversalIdentifier: null,
      engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
      payload: { objectMetadataItemId: 'object-metadata-id' },
      hotKeys: null,
      workflowVersionId: null,
      availabilityObjectMetadataId: null,
      availabilityObjectMetadataUniversalIdentifier: null,
      pageLayoutId: null,
      pageLayoutUniversalIdentifier: null,
      createdAt: '2026-05-22T00:00:00.000Z',
      updatedAt: '2026-05-22T00:00:00.000Z',
    });
  });

  it('updates stale create command metadata while preserving stable fields', () => {
    const existingCommandMenuItem = buildCreateRecordFlatCommandMenuItem({
      objectMetadata: {
        id: 'object-metadata-id',
        universalIdentifier: '5da6fdc9-48db-4cd1-b41c-907d8edaaf7b',
        nameSingular: 'company',
      },
      commandMenuItemId: 'command-menu-item-id',
      applicationId: 'application-id',
      workspaceId: 'workspace-id',
      position: 42,
      now: '2026-05-22T00:00:00.000Z',
    });

    const result = buildUpdatedCreateRecordFlatCommandMenuItem({
      existingCommandMenuItem,
      objectMetadata: {
        id: 'object-metadata-id',
        universalIdentifier: '5da6fdc9-48db-4cd1-b41c-907d8edaaf7b',
        nameSingular: 'organization',
      },
      now: '2026-05-23T00:00:00.000Z',
    });

    expect(result).toMatchObject({
      id: 'command-menu-item-id',
      applicationId: 'application-id',
      workspaceId: 'workspace-id',
      position: 42,
      conditionalAvailabilityExpression:
        'targetObjectWritePermissions.organization and not (pageType == "INDEX_PAGE" and objectMetadataItem.nameSingular == "organization")',
      payload: { objectMetadataItemId: 'object-metadata-id' },
      createdAt: '2026-05-22T00:00:00.000Z',
      updatedAt: '2026-05-23T00:00:00.000Z',
    });
  });

  it('does not update an already current create command', () => {
    const existingCommandMenuItem = buildCreateRecordFlatCommandMenuItem({
      objectMetadata: {
        id: 'object-metadata-id',
        universalIdentifier: '5da6fdc9-48db-4cd1-b41c-907d8edaaf7b',
        nameSingular: 'company',
      },
      commandMenuItemId: 'command-menu-item-id',
      applicationId: 'application-id',
      workspaceId: 'workspace-id',
      position: 42,
      now: '2026-05-22T00:00:00.000Z',
    });

    const result = buildUpdatedCreateRecordFlatCommandMenuItem({
      existingCommandMenuItem,
      objectMetadata: {
        id: 'object-metadata-id',
        universalIdentifier: '5da6fdc9-48db-4cd1-b41c-907d8edaaf7b',
        nameSingular: 'company',
      },
      now: '2026-05-23T00:00:00.000Z',
    });

    expect(result).toBeUndefined();
  });
});
