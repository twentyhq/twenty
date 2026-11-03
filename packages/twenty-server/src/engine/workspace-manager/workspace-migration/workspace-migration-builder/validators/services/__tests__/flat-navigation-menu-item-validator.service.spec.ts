import { type NavigationMenuItemManifest } from 'twenty-shared/application';
import { FeatureFlagKey, NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-navigation-menu-item-manifest-to-universal-flat-navigation-menu-item.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';
import { FlatNavigationMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-navigation-menu-item-validator.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const NOW = new Date().toISOString();

const buildNavigationMenuItem = (
  manifest: Omit<
    NavigationMenuItemManifest,
    'universalIdentifier' | 'position'
  > &
    Partial<Pick<NavigationMenuItemManifest, 'universalIdentifier'>>,
): UniversalFlatNavigationMenuItem =>
  fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
    navigationMenuItemManifest: {
      universalIdentifier: v4(),
      name: 'Item',
      position: 0,
      ...manifest,
    },
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  });

const buildNavigationMenuItemMaps = (
  navigationMenuItems: UniversalFlatNavigationMenuItem[],
): MetadataUniversalFlatEntityMaps<'navigationMenuItem'> => {
  const navigationMenuItemMaps = createEmptyFlatEntityMaps();

  for (const navigationMenuItem of navigationMenuItems) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: navigationMenuItem,
      universalFlatEntityMapsToMutate: navigationMenuItemMaps,
    });
  }

  return navigationMenuItemMaps;
};

const buildFeatureFlagsMap =
  (): WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'] =>
    Object.values(FeatureFlagKey).reduce(
      (featureFlagsMap, key) => ({ ...featureFlagsMap, [key]: false }),
      {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    );

const validateUpdate = ({
  from,
  to,
  otherNavigationMenuItems = [],
}: {
  from: UniversalFlatNavigationMenuItem;
  to: UniversalFlatNavigationMenuItem;
  otherNavigationMenuItems?: UniversalFlatNavigationMenuItem[];
}) => {
  const optimisticFlatEntityMapsAndRelatedFlatEntityMaps = {
    ...createEmptyAllFlatEntityMaps(),
    flatNavigationMenuItemMaps: buildNavigationMenuItemMaps([
      from,
      ...otherNavigationMenuItems,
    ]),
  };

  const comparison = compareTwoFlatEntity({
    fromUniversalFlatEntity: from,
    toUniversalFlatEntity: to,
    metadataName: 'navigationMenuItem',
  });

  return new FlatNavigationMenuItemValidatorService().validateFlatNavigationMenuItemUpdate(
    {
      universalIdentifier: from.universalIdentifier,
      flatEntityUpdate: comparison?.update ?? {},
      finalFlatEntityMaps: buildNavigationMenuItemMaps([
        to,
        ...otherNavigationMenuItems,
      ]),
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      additionalCacheDataMaps: {
        featureFlagsMap: buildFeatureFlagsMap(),
        billingEntitlements: {},
      },
      workspaceId: v4(),
      buildOptions: {
        isSystemBuild: false,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceCustomApplicationUniversalIdentifier: v4(),
        flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
      },
    },
  );
};

const errorMessages = (result: { errors: { message: string }[] }) =>
  result.errors.map(({ message }) => message);

describe('FlatNavigationMenuItemValidatorService update', () => {
  it('accepts a link item re-pointed to a page layout', () => {
    const universalIdentifier = v4();

    expect(
      errorMessages(
        validateUpdate({
          from: buildNavigationMenuItem({
            universalIdentifier,
            type: NavigationMenuItemType.LINK,
            link: 'https://example.com/dashboard',
          }),
          to: buildNavigationMenuItem({
            universalIdentifier,
            type: NavigationMenuItemType.PAGE_LAYOUT,
            pageLayoutUniversalIdentifier: v4(),
          }),
        }),
      ),
    ).toEqual([]);
  });

  it('rejects an item re-pointed to a view that does not exist', () => {
    const universalIdentifier = v4();

    expect(
      errorMessages(
        validateUpdate({
          from: buildNavigationMenuItem({
            universalIdentifier,
            type: NavigationMenuItemType.OBJECT,
            targetObjectUniversalIdentifier: v4(),
          }),
          to: buildNavigationMenuItem({
            universalIdentifier,
            type: NavigationMenuItemType.VIEW,
            viewUniversalIdentifier: v4(),
          }),
        }),
      ),
    ).toEqual(['Target view not found']);
  });

  it('rejects a folder that still contains items changing type', () => {
    const folderUniversalIdentifier = v4();

    expect(
      errorMessages(
        validateUpdate({
          from: buildNavigationMenuItem({
            universalIdentifier: folderUniversalIdentifier,
            type: NavigationMenuItemType.FOLDER,
          }),
          to: buildNavigationMenuItem({
            universalIdentifier: folderUniversalIdentifier,
            type: NavigationMenuItemType.LINK,
            link: 'https://example.com',
          }),
          otherNavigationMenuItems: [
            buildNavigationMenuItem({
              type: NavigationMenuItemType.LINK,
              link: 'https://example.com/child',
              folderUniversalIdentifier,
            }),
          ],
        }),
      ),
    ).toEqual(['A folder that still contains items cannot change type']);
  });

  it('accepts an empty folder changing type', () => {
    const folderUniversalIdentifier = v4();

    expect(
      errorMessages(
        validateUpdate({
          from: buildNavigationMenuItem({
            universalIdentifier: folderUniversalIdentifier,
            type: NavigationMenuItemType.FOLDER,
          }),
          to: buildNavigationMenuItem({
            universalIdentifier: folderUniversalIdentifier,
            type: NavigationMenuItemType.LINK,
            link: 'https://example.com',
          }),
        }),
      ),
    ).toEqual([]);
  });
});
