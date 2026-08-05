import { getObjectNavigationMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { ObjectNavigationMenuItemOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-navigation-menu-item-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const APP_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';

const DERIVED_UNIVERSAL_IDENTIFIER =
  getObjectNavigationMenuItemUniversalIdentifier({
    applicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

type PendingFlatObjectMetadata = {
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
};

type SyncedFlatNavigationMenuItem = {
  universalIdentifier: string;
  type: NavigationMenuItemType;
  position: number;
  userWorkspaceId: string | null;
  targetObjectMetadataUniversalIdentifier: string | null;
};

const buildFlatObjectMetadata = (
  universalIdentifier: string,
  applicationUniversalIdentifier = WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
): PendingFlatObjectMetadata => ({
  universalIdentifier,
  applicationUniversalIdentifier,
});

const buildArgs = ({
  flatObjectMetadata = buildFlatObjectMetadata(OBJECT_UNIVERSAL_IDENTIFIER),
  pendingFlatObjectMetadatas = [flatObjectMetadata],
  pendingFlatNavigationMenuItems = [],
  syncedFlatNavigationMenuItems = [],
}: {
  flatObjectMetadata?: PendingFlatObjectMetadata;
  pendingFlatObjectMetadatas?: PendingFlatObjectMetadata[];
  pendingFlatNavigationMenuItems?: (Partial<SyncedFlatNavigationMenuItem> & {
    universalIdentifier: string;
    isSystemSideEffect?: boolean;
  })[];
  syncedFlatNavigationMenuItems?: SyncedFlatNavigationMenuItem[];
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName: {
      objectMetadata: {
        flatEntityToCreate: Object.fromEntries(
          pendingFlatObjectMetadatas.map((pendingFlatObjectMetadata) => [
            pendingFlatObjectMetadata.universalIdentifier,
            pendingFlatObjectMetadata,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      navigationMenuItem: {
        flatEntityToCreate: Object.fromEntries(
          pendingFlatNavigationMenuItems.map(
            (pendingFlatNavigationMenuItem) => [
              pendingFlatNavigationMenuItem.universalIdentifier,
              pendingFlatNavigationMenuItem,
            ],
          ),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatNavigationMenuItemMaps: {
        byUniversalIdentifier: Object.fromEntries(
          syncedFlatNavigationMenuItems.map((syncedFlatNavigationMenuItem) => [
            syncedFlatNavigationMenuItem.universalIdentifier,
            syncedFlatNavigationMenuItem,
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectNavigationMenuItemOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectNavigationMenuItemOnCreateSideEffectHandlerService as unknown as new () => ObjectNavigationMenuItemOnCreateSideEffectHandlerService)();

  const getCreatedFlatNavigationMenuItems = (
    result: ReturnType<typeof handler.buildSideEffects>,
  ) => {
    if (result.status !== 'success') {
      throw new Error('expected success');
    }

    return Object.values(
      result.operations.navigationMenuItem?.flatEntityToCreate ?? {},
    );
  };

  it('should emit an engine-owned OBJECT item with the derived identifier', () => {
    const result = handler.buildSideEffects(buildArgs({}));

    const [flatNavigationMenuItem] = getCreatedFlatNavigationMenuItems(result);

    expect(flatNavigationMenuItem).toMatchObject({
      universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
      type: NavigationMenuItemType.OBJECT,
      targetObjectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      userWorkspaceId: null,
      isSystemSideEffect: true,
      position: 0,
    });
  });

  it('should own the item with the application owning the object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        flatObjectMetadata: buildFlatObjectMetadata(
          OBJECT_UNIVERSAL_IDENTIFIER,
          APP_APPLICATION_UNIVERSAL_IDENTIFIER,
        ),
      }),
    );

    const [flatNavigationMenuItem] = getCreatedFlatNavigationMenuItems(result);

    expect(flatNavigationMenuItem).toMatchObject({
      applicationUniversalIdentifier: APP_APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: getObjectNavigationMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP_APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      }),
    });
  });

  it('should append after the last workspace-level item, whatever its type', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        syncedFlatNavigationMenuItems: [
          {
            universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
            type: NavigationMenuItemType.FOLDER,
            position: 4,
            userWorkspaceId: null,
            targetObjectMetadataUniversalIdentifier: null,
          },
        ],
      }),
    );

    const [flatNavigationMenuItem] = getCreatedFlatNavigationMenuItems(result);

    expect(flatNavigationMenuItem).toMatchObject({ position: 5 });
  });

  it('should ignore user-scoped items when computing the next position', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        syncedFlatNavigationMenuItems: [
          {
            universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000002',
            type: NavigationMenuItemType.OBJECT,
            position: 42,
            userWorkspaceId: 'd1d2d3d4-d5d6-4000-8000-000000000001',
            targetObjectMetadataUniversalIdentifier:
              OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    const [flatNavigationMenuItem] = getCreatedFlatNavigationMenuItems(result);

    expect(flatNavigationMenuItem).toMatchObject({ position: 0 });
  });

  it('should lay out a batch object creation contiguously, whatever the invocation order', () => {
    const pendingFlatObjectMetadatas = [
      buildFlatObjectMetadata(OBJECT_UNIVERSAL_IDENTIFIER),
      buildFlatObjectMetadata(OTHER_OBJECT_UNIVERSAL_IDENTIFIER),
    ];

    const positions = [...pendingFlatObjectMetadatas]
      .reverse()
      .map((flatObjectMetadata) => {
        const result = handler.buildSideEffects(
          buildArgs({ flatObjectMetadata, pendingFlatObjectMetadatas }),
        );

        const [flatNavigationMenuItem] =
          getCreatedFlatNavigationMenuItems(result);

        return flatNavigationMenuItem.position;
      });

    expect(positions).toEqual([1, 0]);
  });

  it('should noop when a synced workspace-level item already targets the object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        syncedFlatNavigationMenuItems: [
          {
            universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000003',
            type: NavigationMenuItemType.OBJECT,
            position: 0,
            userWorkspaceId: null,
            targetObjectMetadataUniversalIdentifier:
              OBJECT_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should noop when a caller authors the item in the same batch, whatever its identifier', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingFlatNavigationMenuItems: [
          {
            universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000004',
            type: NavigationMenuItemType.OBJECT,
            position: 0,
            userWorkspaceId: null,
            targetObjectMetadataUniversalIdentifier:
              OBJECT_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: false,
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('should still emit when the pending item targeting the object is user-scoped', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingFlatNavigationMenuItems: [
          {
            universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000005',
            type: NavigationMenuItemType.OBJECT,
            position: 0,
            userWorkspaceId: 'd1d2d3d4-d5d6-4000-8000-000000000001',
            targetObjectMetadataUniversalIdentifier:
              OBJECT_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: false,
          },
        ],
      }),
    );

    const [flatNavigationMenuItem] = getCreatedFlatNavigationMenuItems(result);

    expect(flatNavigationMenuItem).toMatchObject({
      universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
    });
  });
});
