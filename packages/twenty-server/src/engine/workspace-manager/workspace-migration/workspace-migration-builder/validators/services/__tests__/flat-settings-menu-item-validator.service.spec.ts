import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { SettingsMenuItemExceptionCode } from 'src/engine/metadata-modules/settings-menu-item/settings-menu-item.exception';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatSettingsMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-settings-menu-item.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { FlatSettingsMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-settings-menu-item-validator.service';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7f1c2b9e-6a1d-4c55-9a2e-1a6f0d6c2b11';

const WORKSPACE_ID = v4();
const APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const now = new Date().toISOString();

const SLUG_ERROR_CODES: string[] = [
  SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_SLUG,
  SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_SLUG_ALREADY_TAKEN,
];

let nextPosition = 0;

const buildSettingsMenuItem = (
  overrides: Partial<UniversalFlatSettingsMenuItem> = {},
): UniversalFlatSettingsMenuItem => ({
  universalIdentifier: v4(),
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier: v4(),
  title: 'Sync',
  icon: null,
  position: nextPosition++,
  scope: 'WORKSPACE',
  slug: null,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const buildSettingsMenuItemMaps = (
  settingsMenuItems: UniversalFlatSettingsMenuItem[],
): MetadataUniversalFlatEntityMaps<'settingsMenuItem'> => {
  const settingsMenuItemMaps = createEmptyFlatEntityMaps();

  for (const settingsMenuItem of settingsMenuItems) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: settingsMenuItem,
      universalFlatEntityMapsToMutate: settingsMenuItemMaps,
    });
  }

  return settingsMenuItemMaps;
};

const buildFeatureFlagsMap =
  (): WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'] =>
    Object.values(FeatureFlagKey).reduce(
      (featureFlagsMap, key) => ({ ...featureFlagsMap, [key]: false }),
      {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    );

const buildCommonValidationArgs = (
  existingSettingsMenuItems: UniversalFlatSettingsMenuItem[],
) => {
  const optimisticFlatEntityMapsAndRelatedFlatEntityMaps =
    createEmptyAllFlatEntityMaps();

  optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatSettingsMenuItemMaps =
    buildSettingsMenuItemMaps(existingSettingsMenuItems);

  return {
    additionalCacheDataMaps: {
      featureFlagsMap: buildFeatureFlagsMap(),
      billingEntitlements: {},
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    workspaceId: WORKSPACE_ID,
    buildOptions: {
      isSystemBuild: false,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    },
  };
};

const slugErrorCodes = (result: { errors: { code: string }[] }) =>
  result.errors
    .map(({ code }) => code)
    .filter((code) => SLUG_ERROR_CODES.includes(code));

describe('FlatSettingsMenuItemValidatorService slug validation', () => {
  const validator = new FlatSettingsMenuItemValidatorService();

  describe('creation', () => {
    const validate = ({
      settingsMenuItem,
      otherSettingsMenuItems = [],
      queuedCreations = [],
    }: {
      settingsMenuItem: UniversalFlatSettingsMenuItem;
      otherSettingsMenuItems?: UniversalFlatSettingsMenuItem[];
      queuedCreations?: UniversalFlatSettingsMenuItem[];
    }) =>
      validator.validateFlatSettingsMenuItemCreation({
        ...buildCommonValidationArgs(otherSettingsMenuItems),
        flatEntityToValidate: settingsMenuItem,
        finalFlatEntityMaps: buildSettingsMenuItemMaps([
          settingsMenuItem,
          ...otherSettingsMenuItems,
          ...queuedCreations,
        ]),
        remainingFlatEntityMapsToValidate:
          buildSettingsMenuItemMaps(queuedCreations),
      });

    it('accepts an item without a slug', () => {
      expect(
        slugErrorCodes(validate({ settingsMenuItem: buildSettingsMenuItem() })),
      ).toEqual([]);
    });

    it('accepts a kebab-case slug', () => {
      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: buildSettingsMenuItem({ slug: 'sync-settings' }),
          }),
        ),
      ).toEqual([]);
    });

    it.each(['Sync', 'sync_settings', 'sync--settings', 'a'.repeat(65)])(
      'rejects the malformed slug "%s"',
      (slug) => {
        expect(
          slugErrorCodes(
            validate({ settingsMenuItem: buildSettingsMenuItem({ slug }) }),
          ),
        ).toEqual([
          SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_SLUG,
        ]);
      },
    );

    it.each(['general', 'variables'])(
      'rejects the reserved slug "%s"',
      (slug) => {
        expect(
          slugErrorCodes(
            validate({ settingsMenuItem: buildSettingsMenuItem({ slug }) }),
          ),
        ).toEqual([
          SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_SLUG,
        ]);
      },
    );

    it('rejects a slug already used by an item of the same application in another scope', () => {
      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: buildSettingsMenuItem({ slug: 'sync' }),
            otherSettingsMenuItems: [
              buildSettingsMenuItem({ slug: 'sync', scope: 'USER' }),
            ],
          }),
        ),
      ).toEqual([
        SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_SLUG_ALREADY_TAKEN,
      ]);
    });

    it('accepts a slug used by another application', () => {
      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: buildSettingsMenuItem({ slug: 'sync' }),
            otherSettingsMenuItems: [
              buildSettingsMenuItem({
                slug: 'sync',
                applicationUniversalIdentifier:
                  OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
              }),
            ],
          }),
        ),
      ).toEqual([]);
    });

    it('reports a slug shared by two new items only once, on the later one', () => {
      const firstSettingsMenuItem = buildSettingsMenuItem({ slug: 'sync' });
      const secondSettingsMenuItem = buildSettingsMenuItem({ slug: 'sync' });

      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: firstSettingsMenuItem,
            queuedCreations: [secondSettingsMenuItem],
          }),
        ),
      ).toEqual([]);
      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: secondSettingsMenuItem,
            otherSettingsMenuItems: [firstSettingsMenuItem],
          }),
        ),
      ).toEqual([
        SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_SLUG_ALREADY_TAKEN,
      ]);
    });
  });

  describe('update', () => {
    const validate = ({
      settingsMenuItem,
      flatEntityUpdate,
      otherSettingsMenuItems = [],
    }: {
      settingsMenuItem: UniversalFlatSettingsMenuItem;
      flatEntityUpdate: FlatEntityUpdateValidationArgs<'settingsMenuItem'>['flatEntityUpdate'];
      otherSettingsMenuItems?: UniversalFlatSettingsMenuItem[];
    }) =>
      validator.validateFlatSettingsMenuItemUpdate({
        ...buildCommonValidationArgs([
          settingsMenuItem,
          ...otherSettingsMenuItems,
        ]),
        finalFlatEntityMaps: buildSettingsMenuItemMaps([
          { ...settingsMenuItem, ...flatEntityUpdate },
          ...otherSettingsMenuItems,
        ]),
        flatEntityUpdate,
        universalIdentifier: settingsMenuItem.universalIdentifier,
      });

    it('rejects a reserved slug', () => {
      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: buildSettingsMenuItem(),
            flatEntityUpdate: { slug: 'general' },
          }),
        ),
      ).toEqual([
        SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_SLUG,
      ]);
    });

    it('rejects a slug another item of the application ends up with', () => {
      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: buildSettingsMenuItem(),
            flatEntityUpdate: { slug: 'sync' },
            otherSettingsMenuItems: [buildSettingsMenuItem({ slug: 'sync' })],
          }),
        ),
      ).toEqual([
        SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_SLUG_ALREADY_TAKEN,
      ]);
    });

    it('accepts taking a slug another item releases in the same migration', () => {
      const releasingSettingsMenuItem = buildSettingsMenuItem({
        slug: 'sync',
      });

      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: buildSettingsMenuItem(),
            flatEntityUpdate: { slug: 'sync' },
            otherSettingsMenuItems: [
              { ...releasingSettingsMenuItem, slug: 'legacy-sync' },
            ],
          }),
        ),
      ).toEqual([]);
    });

    it('accepts clearing the slug', () => {
      expect(
        slugErrorCodes(
          validate({
            settingsMenuItem: buildSettingsMenuItem({ slug: 'sync' }),
            flatEntityUpdate: { slug: null },
          }),
        ),
      ).toEqual([]);
    });
  });
});
