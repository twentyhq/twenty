import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import {
  type FrontComponentManifest,
  type FrontComponentWidgetAvailabilityManifest,
  type Manifest,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const FRONT_COMPONENT_ID = uuidv4();
const SETTINGS_MENU_ITEM_ID = uuidv4();

const COMPONENT_NAME = 'WidgetComponent';

const buildManifest = ({
  widgetAvailability,
  isHeadless = false,
  settingsMenuItems = [],
}: {
  widgetAvailability?: FrontComponentWidgetAvailabilityManifest;
  isHeadless?: boolean;
  settingsMenuItems?: SettingsMenuItemManifest[];
} = {}): Manifest => {
  const frontComponent: FrontComponentManifest = {
    universalIdentifier: FRONT_COMPONENT_ID,
    name: COMPONENT_NAME,
    sourceComponentPath: `src/front-components/${COMPONENT_NAME}.tsx`,
    builtComponentPath: `src/front-components/${COMPONENT_NAME}.mjs`,
    builtComponentChecksum: `${COMPONENT_NAME}-checksum`,
    componentName: COMPONENT_NAME,
    isHeadless,
    ...(isDefined(widgetAvailability) ? { widgetAvailability } : {}),
  };

  return buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      frontComponents: [frontComponent],
      settingsMenuItems,
    },
  });
};

const findFrontComponent = async () => {
  const { data } = await findFrontComponents({
    gqlFields: `
      id
      universalIdentifier
      isHeadless
      widgetAvailability {
        pageLayoutType
        objectMetadataId
      }
    `,
    expectToFail: false,
  });

  return data.frontComponents.find(
    (frontComponent) =>
      frontComponent.universalIdentifier === FRONT_COMPONENT_ID,
  );
};

const findWidgetAvailability = async () =>
  (await findFrontComponent())?.widgetAvailability;

const findCompanyObjectMetadataId = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  const company = objects.find(
    (object) =>
      object.universalIdentifier ===
      STANDARD_OBJECTS.company.universalIdentifier,
  );

  if (!isDefined(company)) {
    throw new Error('Standard Company object not found in workspace');
  }

  return company.id;
};

const expectSyncToBeRejected = async (manifest: Manifest) => {
  const { errors } = await syncApplication({
    manifest,
    expectToFail: true,
  });

  expect(errors).toBeDefined();
  expect(errors?.[0]?.extensions?.code).not.toBe('INTERNAL_SERVER_ERROR');
  expect(await findWidgetAvailability()).toEqual([]);

  return errors;
};

describe('Manifest sync - front component widgetAvailability', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Front Component Widget Availability Test Application',
      description: 'App for testing front component widgetAvailability sync',
      sourcePath: 'front-component-widget-availability-manifest-sync',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: `src/front-components/${COMPONENT_NAME}.mjs`,
      fileBuffer: Buffer.from('dummy built component content'),
      filename: `${COMPONENT_NAME}.mjs`,
      contentType: 'application/javascript',
      expectToFail: false,
    });
  }, 120000);

  beforeEach(async () => {
    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('keeps a front component out of every widget picker when widgetAvailability is omitted', async () => {
    expect(await findWidgetAvailability()).toEqual([]);
  }, 60000);

  it('offers a front component on every record page', async () => {
    await syncApplication({
      manifest: buildManifest({
        widgetAvailability: { pageLayoutType: PageLayoutType.RECORD_PAGE },
      }),
      expectToFail: false,
    });

    expect(await findWidgetAvailability()).toEqual([
      { pageLayoutType: PageLayoutType.RECORD_PAGE, objectMetadataId: null },
    ]);
  }, 60000);

  it('restricts the record page widget picker to the declared objects', async () => {
    await syncApplication({
      manifest: buildManifest({
        widgetAvailability: {
          pageLayoutType: PageLayoutType.RECORD_PAGE,
          objectUniversalIdentifiers: [
            STANDARD_OBJECTS.company.universalIdentifier,
          ],
        },
      }),
      expectToFail: false,
    });

    expect(await findWidgetAvailability()).toEqual([
      {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: await findCompanyObjectMetadataId(),
      },
    ]);
  }, 60000);

  it('offers a front component on dashboards', async () => {
    await syncApplication({
      manifest: buildManifest({
        widgetAvailability: { pageLayoutType: PageLayoutType.DASHBOARD },
      }),
      expectToFail: false,
    });

    expect(await findWidgetAvailability()).toEqual([
      { pageLayoutType: PageLayoutType.DASHBOARD, objectMetadataId: null },
    ]);
  }, 60000);

  it('hides the front component again once its declaration is removed', async () => {
    await syncApplication({
      manifest: buildManifest({
        widgetAvailability: { pageLayoutType: PageLayoutType.DASHBOARD },
      }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(await findWidgetAvailability()).toEqual([]);
  }, 60000);

  it('renders a front component behind a settings menu item even when declared headless', async () => {
    await syncApplication({
      manifest: buildManifest({
        isHeadless: true,
        settingsMenuItems: [
          {
            universalIdentifier: SETTINGS_MENU_ITEM_ID,
            frontComponentUniversalIdentifier: FRONT_COMPONENT_ID,
            title: 'Settings',
          },
        ],
      }),
      expectToFail: false,
    });

    expect(await findFrontComponent()).toMatchObject({
      isHeadless: false,
      widgetAvailability: [],
    });
  }, 60000);

  it('rejects a page layout type without a widget picker', async () => {
    const errors = await expectSyncToBeRejected(
      buildManifest({
        widgetAvailability: {
          pageLayoutType:
            PageLayoutType.STANDALONE_PAGE as FrontComponentWidgetAvailabilityManifest['pageLayoutType'],
        },
      }),
    );

    expect(JSON.stringify(errors)).toContain(
      'supported values are RECORD_PAGE, DASHBOARD, received STANDALONE_PAGE',
    );
  }, 60000);

  it('rejects an object restriction on dashboards', async () => {
    await expectSyncToBeRejected(
      buildManifest({
        widgetAvailability: {
          pageLayoutType: PageLayoutType.DASHBOARD,
          objectUniversalIdentifiers: [
            STANDARD_OBJECTS.company.universalIdentifier,
          ],
        } as FrontComponentWidgetAvailabilityManifest,
      }),
    );
  }, 60000);

  it('rejects an object restriction on an unknown object', async () => {
    await expectSyncToBeRejected(
      buildManifest({
        widgetAvailability: {
          pageLayoutType: PageLayoutType.RECORD_PAGE,
          objectUniversalIdentifiers: [uuidv4()],
        },
      }),
    );
  }, 60000);

  describe('AI page-layout tools', () => {
    let pageLayoutId: string;
    let pageLayoutTabId: string;
    let companyObjectMetadataId: string;
    const getContext = async () => ({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      authContext: await resolveWorkspaceMemberAuthContext({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      }),
    });
    const executeTool = async ({
      name,
      arguments: toolArguments,
    }: {
      name: string;
      arguments: Record<string, unknown>;
    }) =>
      getAppProviderByClassName<ToolRegistryService>(
        'ToolRegistryService',
      ).resolveAndExecute(name, toolArguments, await getContext());

    beforeEach(async () => {
      companyObjectMetadataId = await findCompanyObjectMetadataId();
      const { data: layoutData } = await createOnePageLayout({
        input: {
          name: 'Placement test',
          type: PageLayoutType.RECORD_PAGE,
          objectMetadataId: companyObjectMetadataId,
        },
      });
      pageLayoutId = layoutData.createPageLayout.id;
      const { data: tabData } = await createOnePageLayoutTab({
        input: {
          pageLayoutId,
          title: 'Overview',
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        },
      });
      pageLayoutTabId = tabData.createPageLayoutTab.id;
    });

    afterEach(async () => {
      await destroyOnePageLayout({ input: { id: pageLayoutId } });
    });

    it('exposes each page-layout tool once alongside the existing dashboard tools', async () => {
      const catalog = await getAppProviderByClassName<ToolRegistryService>(
        'ToolRegistryService',
      ).getCatalog(await getContext(), {
        categories: [ToolCategory.PAGE_LAYOUT],
      });
      expect(catalog.map(({ name }) => name).sort()).toEqual([
        'add_page_layout_tab',
        'add_page_layout_widget',
        'create_complete_dashboard',
        'delete_page_layout_widget',
        'get_dashboard',
        'list_dashboards',
        'list_record_page_layouts',
        'place_front_component',
        'update_page_layout_widget',
      ]);
    });

    it('allows reading layouts but denies placement without layout permission', async () => {
      const permissions = getAppProviderByClassName<SettingPermissionsService>(
        'SettingPermissionsService',
      );
      const hasPermissionFlag = permissions.hasPermissionFlag.bind(permissions);
      const permissionCheck = jest
        .spyOn(permissions, 'hasPermissionFlag')
        .mockImplementation((input) =>
          input.permissionFlag === PermissionFlagType.LAYOUTS
            ? Promise.resolve(false)
            : hasPermissionFlag(input),
        );
      try {
        expect(
          await executeTool({
            name: 'list_record_page_layouts',
            arguments: { objectName: 'company' },
          }),
        ).toMatchObject({
          success: true,
          result: {
            layouts: expect.arrayContaining([
              expect.objectContaining({ id: pageLayoutId }),
            ]),
          },
        });
        expect(
          await executeTool({
            name: 'place_front_component',
            arguments: {
              frontComponentId: uuidv4(),
              pageLayoutTabId,
              title: 'Forbidden',
              position: {
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                index: 0,
              },
            },
          }),
        ).toMatchObject({
          success: false,
          message: 'Tool "place_front_component" not found',
        });
        const { data } = await findPageLayoutWidgets({
          input: { pageLayoutTabId },
        });
        expect(data.getPageLayoutWidgets).toHaveLength(0);
      } finally {
        permissionCheck.mockRestore();
      }
    });

    it.each(['company', 'companies'])(
      'finds the record layout using %s',
      async (objectName) => {
        expect(
          await executeTool({
            name: 'list_record_page_layouts',
            arguments: { objectName },
          }),
        ).toMatchObject({
          success: true,
          result: {
            layouts: expect.arrayContaining([
              expect.objectContaining({
                id: pageLayoutId,
                objectMetadataId: companyObjectMetadataId,
                tabs: expect.arrayContaining([
                  expect.objectContaining({
                    id: pageLayoutTabId,
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  }),
                ]),
              }),
            ]),
          },
        });
      },
    );

    it('rejects an unknown object instead of listing every layout', async () => {
      expect(
        await executeTool({
          name: 'list_record_page_layouts',
          arguments: { objectName: 'unknown-placement-object' },
        }),
      ).toMatchObject({
        success: false,
        error: 'Object "unknown-placement-object" not found',
      });
    });

    it('rejects a missing widget configuration without creating a widget', async () => {
      expect(
        await executeTool({
          name: 'add_page_layout_widget',
          arguments: {
            pageLayoutTabId,
            title: 'Missing configuration',
            type: 'FRONT_COMPONENT',
            position: {
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              index: 0,
            },
          },
        }),
      ).toMatchObject({
        success: false,
        error: 'Widget configuration is required',
      });
      const { data } = await findPageLayoutWidgets({
        input: { pageLayoutTabId },
      });
      expect(data.getPageLayoutWidgets).toHaveLength(0);
    });

    it('persists an inserted component and renumbers existing siblings', async () => {
      await syncApplication({
        manifest: buildManifest({
          widgetAvailability: {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectUniversalIdentifiers: [
              STANDARD_OBJECTS.company.universalIdentifier,
            ],
          },
        }),
        expectToFail: false,
      });
      const frontComponent = await findFrontComponent();
      const { data: otherTabData } = await createOnePageLayoutTab({
        input: {
          pageLayoutId,
          title: 'Other tab',
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        },
      });
      const otherTabId = otherTabData.createPageLayoutTab.id;
      expect(
        await executeTool({
          name: 'place_front_component',
          arguments: {
            frontComponentId: frontComponent?.id,
            pageLayoutTabId: otherTabId,
            title: 'Other tab widget',
            position: {
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              index: 0,
            },
          },
        }),
      ).toMatchObject({ success: true });
      for (const title of ['First', 'Inserted']) {
        expect(
          await executeTool({
            name: 'place_front_component',
            arguments: {
              frontComponentId: frontComponent?.id,
              pageLayoutTabId,
              title,
              position: {
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                index: 0,
              },
            },
          }),
        ).toMatchObject({ success: true });
      }
      const { data } = await findPageLayoutWidgets({
        input: { pageLayoutTabId },
      });
      expect(data.getPageLayoutWidgets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Inserted',
            position: expect.objectContaining({ index: 0 }),
          }),
          expect.objectContaining({
            title: 'First',
            position: expect.objectContaining({ index: 1 }),
          }),
        ]),
      );
      expect(data.getPageLayoutWidgets).toHaveLength(2);
      const { data: otherTabWidgets } = await findPageLayoutWidgets({
        input: { pageLayoutTabId: otherTabId },
      });
      expect(otherTabWidgets.getPageLayoutWidgets).toEqual([
        expect.objectContaining({
          title: 'Other tab widget',
          position: expect.objectContaining({ index: 0 }),
        }),
      ]);
    });

    it.each([
      { name: 'headless', options: { isHeadless: true } },
      { name: 'unlisted', options: {} },
      {
        name: 'wrong surface',
        options: {
          widgetAvailability: {
            pageLayoutType: PageLayoutType.DASHBOARD as const,
          },
        },
      },
      {
        name: 'wrong object',
        options: {
          widgetAvailability: {
            pageLayoutType: PageLayoutType.RECORD_PAGE as const,
            objectUniversalIdentifiers: [
              STANDARD_OBJECTS.person.universalIdentifier,
            ],
          },
        },
      },
    ])(
      'rejects a $name component without creating a widget',
      async ({ options }) => {
        await syncApplication({
          manifest: buildManifest(options),
          expectToFail: false,
        });
        const frontComponent = await findFrontComponent();
        expect(
          await executeTool({
            name: 'place_front_component',
            arguments: {
              frontComponentId: frontComponent?.id,
              pageLayoutTabId,
              title: 'Rejected',
              position: {
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                index: 0,
              },
            },
          }),
        ).toMatchObject({
          success: false,
          error: expect.stringContaining('not available on this page layout'),
        });
        const { data } = await findPageLayoutWidgets({
          input: { pageLayoutTabId },
        });
        expect(data.getPageLayoutWidgets).toHaveLength(0);
      },
    );

    it('rejects grid coordinates on a vertical-list tab', async () => {
      await syncApplication({
        manifest: buildManifest({
          widgetAvailability: { pageLayoutType: PageLayoutType.RECORD_PAGE },
        }),
        expectToFail: false,
      });
      const frontComponent = await findFrontComponent();
      expect(
        await executeTool({
          name: 'place_front_component',
          arguments: {
            frontComponentId: frontComponent?.id,
            pageLayoutTabId,
            title: 'Rejected',
            position: {
              layoutMode: PageLayoutTabLayoutMode.GRID,
              row: 0,
              column: 0,
              rowSpan: 4,
              columnSpan: 6,
            },
          },
        }),
      ).toMatchObject({
        success: false,
        error: expect.stringContaining(
          'Choose an active tab and a widget position matching its layout mode',
        ),
      });
      const { data } = await findPageLayoutWidgets({
        input: { pageLayoutTabId },
      });
      expect(data.getPageLayoutWidgets).toHaveLength(0);
    });
  });
});
