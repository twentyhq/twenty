import { ObjectNavigationMenuItemOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-navigation-menu-item-on-delete-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const DELETED_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000001';
const LIVE_OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000002';

const DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const LIVE_OBJECT_VIEW_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';

const OBJECT_ITEM_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000001';
const VIEW_ITEM_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000002';
const RECORD_ITEM_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000003';
const LIVE_OBJECT_ITEM_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000004';
const LIVE_VIEW_ITEM_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000005';
const FOLDER_ITEM_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000006';

type NavigationMenuItemFixture = {
  universalIdentifier: string;
  targetObjectMetadataUniversalIdentifier?: string | null;
  viewUniversalIdentifier?: string | null;
};

const buildNavigationMenuItemMaps = (items: NavigationMenuItemFixture[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    items.map((item) => [
      item.universalIdentifier,
      {
        targetObjectMetadataUniversalIdentifier: null,
        viewUniversalIdentifier: null,
        ...item,
      },
    ]),
  ),
});

const buildArgs = ({
  viewUniversalIdentifiers = [],
  navigationMenuItems = [],
}: {
  viewUniversalIdentifiers?: string[];
  navigationMenuItems?: NavigationMenuItemFixture[];
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: {
      universalIdentifier: DELETED_OBJECT_UNIVERSAL_IDENTIFIER,
      viewUniversalIdentifiers,
    },
    allFlatEntityOperationRecordByMetadataName: {},
    relatedFlatEntityMaps: {
      flatNavigationMenuItemMaps:
        buildNavigationMenuItemMaps(navigationMenuItems),
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectNavigationMenuItemOnDeleteSideEffectHandlerService', () => {
  const handler =
    new (ObjectNavigationMenuItemOnDeleteSideEffectHandlerService as unknown as new () => ObjectNavigationMenuItemOnDeleteSideEffectHandlerService)();

  describe('when the workspace has navigation menu items for the deleted object', () => {
    it('should delete the items targeting the object and the items targeting one of its views', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          viewUniversalIdentifiers: [DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER],
          navigationMenuItems: [
            {
              universalIdentifier: OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
              targetObjectMetadataUniversalIdentifier:
                DELETED_OBJECT_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: VIEW_ITEM_UNIVERSAL_IDENTIFIER,
              viewUniversalIdentifier: DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: RECORD_ITEM_UNIVERSAL_IDENTIFIER,
              targetObjectMetadataUniversalIdentifier:
                DELETED_OBJECT_UNIVERSAL_IDENTIFIER,
            },
          ],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        return;
      }

      expect(
        Object.keys(
          result.operations.navigationMenuItem?.flatEntityToDelete ?? {},
        ).sort(),
      ).toEqual(
        [
          OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
          VIEW_ITEM_UNIVERSAL_IDENTIFIER,
          RECORD_ITEM_UNIVERSAL_IDENTIFIER,
        ].sort(),
      );
    });
  });

  describe('when the workspace also has navigation menu items for other objects', () => {
    it('should leave the items of a live object untouched', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          viewUniversalIdentifiers: [DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER],
          navigationMenuItems: [
            {
              universalIdentifier: OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
              targetObjectMetadataUniversalIdentifier:
                DELETED_OBJECT_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: LIVE_OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
              targetObjectMetadataUniversalIdentifier:
                LIVE_OBJECT_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: LIVE_VIEW_ITEM_UNIVERSAL_IDENTIFIER,
              viewUniversalIdentifier: LIVE_OBJECT_VIEW_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: FOLDER_ITEM_UNIVERSAL_IDENTIFIER,
            },
          ],
        }),
      );

      expect(result.status).toBe('success');

      if (result.status !== 'success') {
        return;
      }

      expect(
        Object.keys(
          result.operations.navigationMenuItem?.flatEntityToDelete ?? {},
        ),
      ).toEqual([OBJECT_ITEM_UNIVERSAL_IDENTIFIER]);
    });
  });

  describe('when no navigation menu item resolves to the deleted object', () => {
    it('should noop', () => {
      const result = handler.buildSideEffects(
        buildArgs({
          viewUniversalIdentifiers: [DELETED_OBJECT_VIEW_UNIVERSAL_IDENTIFIER],
          navigationMenuItems: [
            {
              universalIdentifier: LIVE_OBJECT_ITEM_UNIVERSAL_IDENTIFIER,
              targetObjectMetadataUniversalIdentifier:
                LIVE_OBJECT_UNIVERSAL_IDENTIFIER,
            },
            {
              universalIdentifier: FOLDER_ITEM_UNIVERSAL_IDENTIFIER,
            },
          ],
        }),
      );

      expect(result).toEqual({ status: 'noop' });
    });
  });
});
