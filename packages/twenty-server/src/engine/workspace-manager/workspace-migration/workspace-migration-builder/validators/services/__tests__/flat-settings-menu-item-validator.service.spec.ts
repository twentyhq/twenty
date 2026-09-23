import { SettingsMenuItemExceptionCode } from 'src/engine/metadata-modules/settings-menu-item/settings-menu-item.exception';
import { FlatSettingsMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-settings-menu-item-validator.service';

type CreationArgs = Parameters<
  FlatSettingsMenuItemValidatorService['validateFlatSettingsMenuItemCreation']
>[0];

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '22222222-2222-4222-8222-222222222222';

const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '33333333-3333-4333-8333-333333333333';

const buildSettingsMenuItem = ({
  universalIdentifier,
  position,
  scope = 'WORKSPACE',
}: {
  universalIdentifier: string;
  position: number;
  scope?: string;
}) => ({
  universalIdentifier,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: `Item ${universalIdentifier}`,
  icon: 'IconRefresh',
  position,
  scope,
});

const buildMaps = (items: ReturnType<typeof buildSettingsMenuItem>[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    items.map((item) => [item.universalIdentifier, item]),
  ),
});

const buildArgs = ({
  itemToCreate,
  optimisticItems,
  finalItems,
  remainingItems = [],
  frontComponentApplicationUniversalIdentifier = APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  itemToCreate: ReturnType<typeof buildSettingsMenuItem>;
  optimisticItems: ReturnType<typeof buildSettingsMenuItem>[];
  finalItems: ReturnType<typeof buildSettingsMenuItem>[];
  remainingItems?: ReturnType<typeof buildSettingsMenuItem>[];
  frontComponentApplicationUniversalIdentifier?: string;
}) =>
  ({
    flatEntityToValidate: itemToCreate,
    remainingFlatEntityMapsToValidate: buildMaps(remainingItems),
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSettingsMenuItemMaps: buildMaps(optimisticItems),
      flatFrontComponentMaps: {
        byUniversalIdentifier: {
          [FRONT_COMPONENT_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier:
              frontComponentApplicationUniversalIdentifier,
          },
        },
      },
    },
    finalFlatEntityMaps: buildMaps(finalItems),
  }) as unknown as CreationArgs;

describe('settings menu item position collision on creation', () => {
  const service = new FlatSettingsMenuItemValidatorService();

  // The positions to compare against are the ones the migration ends on, not the
  // ones it started from: an item moved out of the way in the same sync has already
  // freed its position by the time the migration runs.
  it('should accept a position freed by another item moved in the same migration', () => {
    const itemBeforeMove = buildSettingsMenuItem({
      universalIdentifier: 'item-moved',
      position: 1,
    });
    const itemAfterMove = buildSettingsMenuItem({
      universalIdentifier: 'item-moved',
      position: 2,
    });
    const itemToCreate = buildSettingsMenuItem({
      universalIdentifier: 'item-new',
      position: 1,
    });

    const { errors } = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate,
        optimisticItems: [itemBeforeMove],
        finalItems: [itemAfterMove, itemToCreate],
      }),
    );

    expect(errors).toEqual([]);
  });

  it('should reject a position another item still holds in the final state', () => {
    const stayingItem = buildSettingsMenuItem({
      universalIdentifier: 'item-staying',
      position: 1,
    });
    const itemToCreate = buildSettingsMenuItem({
      universalIdentifier: 'item-new',
      position: 1,
    });

    const { errors } = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate,
        optimisticItems: [stayingItem],
        finalItems: [stayingItem, itemToCreate],
      }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_POSITION_ALREADY_TAKEN,
    );
  });

  // Both items are in the final state from the start, so comparing against it
  // naively reports the clash twice; the sync must surface it once.
  it('should report a position shared by two new items once, on the later one', () => {
    const firstItem = buildSettingsMenuItem({
      universalIdentifier: 'item-first',
      position: 1,
    });
    const secondItem = buildSettingsMenuItem({
      universalIdentifier: 'item-second',
      position: 1,
    });
    const finalItems = [firstItem, secondItem];

    const firstResult = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate: firstItem,
        optimisticItems: [],
        finalItems,
        remainingItems: [secondItem],
      }),
    );
    const secondResult = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate: secondItem,
        optimisticItems: [firstItem],
        finalItems,
        remainingItems: [],
      }),
    );

    expect(firstResult.errors).toEqual([]);
    expect(secondResult.errors).toHaveLength(1);
    expect(secondResult.errors[0].code).toBe(
      SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_POSITION_ALREADY_TAKEN,
    );
  });
});

describe('settings menu item input validation on creation', () => {
  const service = new FlatSettingsMenuItemValidatorService();

  it('should reject a front component owned by another application', () => {
    const itemToCreate = buildSettingsMenuItem({
      universalIdentifier: 'item-new',
      position: 1,
    });

    const { errors } = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate,
        optimisticItems: [],
        finalItems: [itemToCreate],
        frontComponentApplicationUniversalIdentifier:
          OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_INPUT,
    );
    expect(errors[0].message).toContain('belongs to another application');
  });

  it('should accept a front component owned by the same application', () => {
    const itemToCreate = buildSettingsMenuItem({
      universalIdentifier: 'item-new',
      position: 1,
    });

    const { errors } = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate,
        optimisticItems: [],
        finalItems: [itemToCreate],
      }),
    );

    expect(errors).toEqual([]);
  });

  it('should reject a scope the database enum does not accept', () => {
    const itemToCreate = buildSettingsMenuItem({
      universalIdentifier: 'item-new',
      position: 1,
      scope: 'GLOBAL',
    });

    const { errors } = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate,
        optimisticItems: [],
        finalItems: [itemToCreate],
      }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_INPUT,
    );
    expect(errors[0].message).toContain('scope');
  });

  it('should reject a position that is not a number', () => {
    const itemToCreate = {
      ...buildSettingsMenuItem({
        universalIdentifier: 'item-new',
        position: 1,
      }),
      position: '1' as unknown as number,
    };

    const { errors } = service.validateFlatSettingsMenuItemCreation(
      buildArgs({
        itemToCreate,
        optimisticItems: [],
        finalItems: [itemToCreate],
      }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_INPUT,
    );
    expect(errors[0].message).toContain('position must be a number');
  });
});
