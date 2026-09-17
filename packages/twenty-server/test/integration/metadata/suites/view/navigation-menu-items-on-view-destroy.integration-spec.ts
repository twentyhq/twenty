import { NavigationMenuItemType } from 'twenty-shared/types';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { isDefined } from 'twenty-shared/utils';

const NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  viewId
`;

const findNavigationMenuItemRow = async (
  navigationMenuItemId: string,
): Promise<{ id: string }[]> =>
  global.testDataSource.query(
    `SELECT id FROM core."navigationMenuItem" WHERE id = $1`,
    [navigationMenuItemId],
  );

describe('Navigation menu items on view destroy', () => {
  const uniqueSuffix = Date.now().toString().slice(-8);

  let objectMetadataId: string | undefined = undefined;
  let navigationMenuItemId: string | undefined = undefined;

  beforeAll(async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        namePlural: `viewOrphans${uniqueSuffix}`,
        nameSingular: `viewOrphan${uniqueSuffix}`,
        labelPlural: `View Orphans ${uniqueSuffix}`,
        labelSingular: `View Orphan ${uniqueSuffix}`,
        description: 'Object for navigation menu item view destroy tests',
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id',
    });

    objectMetadataId = createOneObject.id;
  });

  afterAll(async () => {
    if (
      isDefined(navigationMenuItemId) &&
      (await findNavigationMenuItemRow(navigationMenuItemId)).length > 0
    ) {
      await deleteNavigationMenuItem({
        input: { id: navigationMenuItemId },
        expectToFail: false,
      });
    }

    if (!isDefined(objectMetadataId)) {
      return;
    }

    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('should stop returning a VIEW navigation menu item once its view is destroyed', async () => {
    if (!isDefined(objectMetadataId)) {
      throw new Error('Object metadata should have been created');
    }

    const {
      data: { createView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: `Extra view ${uniqueSuffix}`,
        objectMetadataId,
        icon: 'IconList',
      },
      gqlFields: 'id',
    });

    const {
      data: { createNavigationMenuItem: createdNavigationMenuItem },
    } = await createNavigationMenuItem({
      expectToFail: false,
      input: { type: NavigationMenuItemType.VIEW, viewId: createView.id },
      gqlFields: 'id',
    });

    navigationMenuItemId = createdNavigationMenuItem.id;

    const {
      data: { destroyView },
    } = await destroyOneView({
      viewId: createView.id,
      expectToFail: false,
    });

    expect(destroyView).toBe(true);

    const {
      data: { navigationMenuItems },
    } = await findNavigationMenuItems({
      expectToFail: false,
      input: undefined,
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    });

    // Asserted together so a failure shows both layers at once: rows left
    // behind, or an API still serving a row that is gone.
    expect({
      apiItems: navigationMenuItems
        .filter((item) => item.id === navigationMenuItemId)
        .map(({ id, type, viewId }) => ({ id, type, viewId })),
      databaseRows: await findNavigationMenuItemRow(navigationMenuItemId),
    }).toEqual({ apiItems: [], databaseRows: [] });
  });
});
