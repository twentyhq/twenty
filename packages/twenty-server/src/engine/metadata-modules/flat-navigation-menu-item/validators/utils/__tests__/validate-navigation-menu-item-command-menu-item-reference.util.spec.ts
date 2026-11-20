import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { validateNavigationMenuItemCommandMenuItemReference } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-command-menu-item-reference.util';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

const GLOBAL_COMMAND_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.openCommandMenu.universalIdentifier;
const FALLBACK_COMMAND_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.searchRecordsFallback.universalIdentifier;

const buildFlatCommandMenuItem = (
  commandMenuItemName: keyof typeof STANDARD_COMMAND_MENU_ITEMS,
) =>
  createStandardCommandMenuItemFlatMetadata({
    commandMenuItemName,
    commandMenuItemId: `${commandMenuItemName}-id`,
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'twenty-standard-application-id',
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    },
    now: '2026-11-20T00:00:00.000Z',
  });

const buildFlatCommandMenuItemMaps =
  (): MetadataUniversalFlatEntityMaps<'commandMenuItem'> => ({
    ...createEmptyFlatEntityMaps(),
    byUniversalIdentifier: {
      [GLOBAL_COMMAND_UNIVERSAL_IDENTIFIER]:
        buildFlatCommandMenuItem('openCommandMenu'),
      [FALLBACK_COMMAND_UNIVERSAL_IDENTIFIER]: buildFlatCommandMenuItem(
        'searchRecordsFallback',
      ),
    },
  });

describe('validateNavigationMenuItemCommandMenuItemReference', () => {
  it('should accept a global command', () => {
    expect(
      validateNavigationMenuItemCommandMenuItemReference({
        commandMenuItemUniversalIdentifier: GLOBAL_COMMAND_UNIVERSAL_IDENTIFIER,
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(),
      }),
    ).toEqual([]);
  });

  it('should ignore an item that targets no command', () => {
    expect(
      validateNavigationMenuItemCommandMenuItemReference({
        commandMenuItemUniversalIdentifier: null,
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(),
      }),
    ).toEqual([]);
  });

  it('should refuse a command that does not exist', () => {
    expect(
      validateNavigationMenuItemCommandMenuItemReference({
        commandMenuItemUniversalIdentifier:
          '20202020-c003-4c03-8c03-c0aba11c0003',
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(),
      }).map(({ message }) => message),
    ).toEqual(['Target command menu item not found']);
  });

  it('should refuse a command that is not global', () => {
    expect(
      validateNavigationMenuItemCommandMenuItemReference({
        commandMenuItemUniversalIdentifier:
          FALLBACK_COMMAND_UNIVERSAL_IDENTIFIER,
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(),
      }).map(({ message }) => message),
    ).toEqual([
      'Only a global command menu item can be added to the navigation menu',
    ]);
  });
});
