import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { validateNavigationMenuItemCommandMenuItemReference } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-command-menu-item-reference.util';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

const GLOBAL_COMMAND_UNIVERSAL_IDENTIFIER =
  '20202020-c001-4c01-8c01-c0aba11c0001';
const RECORD_SELECTION_COMMAND_UNIVERSAL_IDENTIFIER =
  '20202020-c002-4c02-8c02-c0aba11c0002';

const buildFlatCommandMenuItemMaps =
  (): MetadataUniversalFlatEntityMaps<'commandMenuItem'> => ({
    ...createEmptyFlatEntityMaps(),
    byUniversalIdentifier: {
      [GLOBAL_COMMAND_UNIVERSAL_IDENTIFIER]: {
        universalIdentifier: GLOBAL_COMMAND_UNIVERSAL_IDENTIFIER,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      } as MetadataUniversalFlatEntity<'commandMenuItem'>,
      [RECORD_SELECTION_COMMAND_UNIVERSAL_IDENTIFIER]: {
        universalIdentifier: RECORD_SELECTION_COMMAND_UNIVERSAL_IDENTIFIER,
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      } as MetadataUniversalFlatEntity<'commandMenuItem'>,
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
          RECORD_SELECTION_COMMAND_UNIVERSAL_IDENTIFIER,
        flatCommandMenuItemMaps: buildFlatCommandMenuItemMaps(),
      }).map(({ message }) => message),
    ).toEqual([
      'Only a global command menu item can be added to the navigation menu',
    ]);
  });
});
