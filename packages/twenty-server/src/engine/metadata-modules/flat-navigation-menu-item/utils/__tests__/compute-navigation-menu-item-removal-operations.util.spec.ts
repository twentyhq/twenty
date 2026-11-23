import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { computeNavigationMenuItemRemovalOperations } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/compute-navigation-menu-item-removal-operations.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER = 'custom-application';
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER = 'standard-application';
const NOW = '2026-11-19T00:00:00.000Z';

const buildFlatNavigationMenuItem = (
  properties: Partial<FlatNavigationMenuItem> & { id: string },
): FlatNavigationMenuItem => ({
  type: NavigationMenuItemType.FOLDER,
  universalIdentifier: `${properties.id}-universal-identifier`,
  applicationId: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  workspaceId: 'workspace-id',
  userWorkspaceId: null,
  targetRecordId: null,
  targetObjectMetadataId: null,
  targetObjectMetadataUniversalIdentifier: null,
  viewId: null,
  viewUniversalIdentifier: null,
  parentId: null,
  parentUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  agentChatChannelId: null,
  agentChatChannelUniversalIdentifier: null,
  workflowId: null,
  workflowUniversalIdentifier: null,
  agentId: null,
  agentUniversalIdentifier: null,
  name: null,
  link: null,
  nativePageKey: null,
  builtInSectionKey: null,
  icon: null,
  color: null,
  position: 0,
  isActive: true,
  overrides: null,
  createdAt: NOW,
  updatedAt: NOW,
  ...properties,
});

const computeRemoval = ({
  rootNavigationMenuItems,
  navigationMenuItems,
}: {
  rootNavigationMenuItems: FlatNavigationMenuItem[];
  navigationMenuItems: FlatNavigationMenuItem[];
}) => {
  const childrenByParentId: Partial<Record<string, FlatNavigationMenuItem[]>> =
    {};

  for (const navigationMenuItem of navigationMenuItems) {
    if (isDefined(navigationMenuItem.parentId)) {
      childrenByParentId[navigationMenuItem.parentId] = [
        ...(childrenByParentId[navigationMenuItem.parentId] ?? []),
        navigationMenuItem,
      ];
    }
  }

  return computeNavigationMenuItemRemovalOperations({
    rootNavigationMenuItems,
    childrenByUserWorkspaceIdAndParentId: { null: childrenByParentId },
    workspaceCustomApplicationUniversalIdentifier:
      CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  });
};

const isEffectivelyActive = (navigationMenuItem: FlatNavigationMenuItem) =>
  resolveEffectiveFlatEntity({
    metadataName: 'navigationMenuItem',
    flatEntity: navigationMenuItem,
  }).isActive;

describe('computeNavigationMenuItemRemovalOperations', () => {
  it('should delete a workspace item with its workspace descendants, deepest first', () => {
    const folder = buildFlatNavigationMenuItem({ id: 'folder' });
    const child = buildFlatNavigationMenuItem({
      id: 'child',
      parentId: folder.id,
    });

    const { flatEntityToDelete, flatEntityToUpdate } = computeRemoval({
      rootNavigationMenuItems: [folder],
      navigationMenuItems: [folder, child],
    });

    expect(flatEntityToDelete.map(({ id }) => id)).toEqual(['child', 'folder']);
    expect(flatEntityToUpdate).toEqual([]);
  });

  it('should hide an item another application owns instead of deleting it', () => {
    const standardFolder = buildFlatNavigationMenuItem({
      id: 'standard-folder',
      applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    const workspaceChild = buildFlatNavigationMenuItem({
      id: 'workspace-child',
      parentId: standardFolder.id,
    });

    const { flatEntityToDelete, flatEntityToUpdate } = computeRemoval({
      rootNavigationMenuItems: [standardFolder],
      navigationMenuItems: [standardFolder, workspaceChild],
    });

    expect(flatEntityToDelete).toEqual([]);
    expect(flatEntityToUpdate.map(({ id }) => id)).toEqual(['standard-folder']);
    expect(isEffectivelyActive(flatEntityToUpdate[0])).toBe(false);
    expect(flatEntityToUpdate[0].parentId).toBeNull();
  });

  it('should hide an item another application owns and lift it out of a deleted folder', () => {
    const workspaceFolder = buildFlatNavigationMenuItem({
      id: 'workspace-folder',
      parentId: 'workspace-section',
      parentUniversalIdentifier: 'workspace-section-universal-identifier',
    });
    const standardChild = buildFlatNavigationMenuItem({
      id: 'standard-child',
      parentId: workspaceFolder.id,
      parentUniversalIdentifier: workspaceFolder.universalIdentifier,
      applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    const grandchildOfStandardChild = buildFlatNavigationMenuItem({
      id: 'grandchild',
      parentId: standardChild.id,
    });

    const { flatEntityToDelete, flatEntityToUpdate } = computeRemoval({
      rootNavigationMenuItems: [workspaceFolder],
      navigationMenuItems: [
        workspaceFolder,
        standardChild,
        grandchildOfStandardChild,
      ],
    });

    expect(flatEntityToDelete.map(({ id }) => id)).toEqual([
      'workspace-folder',
    ]);
    expect(flatEntityToUpdate).toHaveLength(1);
    expect(flatEntityToUpdate[0]).toMatchObject({
      id: 'standard-child',
      parentId: 'workspace-section',
      parentUniversalIdentifier: 'workspace-section-universal-identifier',
    });
    expect(isEffectivelyActive(flatEntityToUpdate[0])).toBe(false);
  });

  it('should not touch an item twice when its folder is removed in the same batch', () => {
    const workspaceFolder = buildFlatNavigationMenuItem({
      id: 'workspace-folder',
    });
    const workspaceChild = buildFlatNavigationMenuItem({
      id: 'workspace-child',
      parentId: workspaceFolder.id,
    });

    const { flatEntityToDelete } = computeRemoval({
      rootNavigationMenuItems: [workspaceFolder, workspaceChild],
      navigationMenuItems: [workspaceFolder, workspaceChild],
    });

    expect(flatEntityToDelete.map(({ id }) => id)).toEqual([
      'workspace-child',
      'workspace-folder',
    ]);
  });

  it('should only hide a container another application owns when its descendants are removed with it', () => {
    const standardFolder = buildFlatNavigationMenuItem({
      id: 'standard-folder',
      applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    const workspaceChild = buildFlatNavigationMenuItem({
      id: 'workspace-child',
      parentId: standardFolder.id,
    });
    const standardChild = buildFlatNavigationMenuItem({
      id: 'standard-child',
      parentId: standardFolder.id,
      applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    const workspaceGrandchild = buildFlatNavigationMenuItem({
      id: 'workspace-grandchild',
      parentId: standardChild.id,
    });
    const navigationMenuItems = [
      standardFolder,
      workspaceChild,
      standardChild,
      workspaceGrandchild,
    ];

    const { flatEntityToDelete, flatEntityToUpdate } = computeRemoval({
      rootNavigationMenuItems: navigationMenuItems,
      navigationMenuItems,
    });

    expect(flatEntityToDelete).toEqual([]);
    expect(flatEntityToUpdate.map(({ id }) => id)).toEqual(['standard-folder']);
    expect(isEffectivelyActive(flatEntityToUpdate[0])).toBe(false);
  });
});
