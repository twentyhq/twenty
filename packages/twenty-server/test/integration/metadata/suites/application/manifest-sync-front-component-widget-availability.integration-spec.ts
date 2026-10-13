import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import {
  type CommandMenuItemManifest,
  type FrontComponentManifest,
  type FrontComponentWidgetAvailabilityManifest,
  type Manifest,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type FrontComponentWidgetAvailabilityDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component-widget-availability.dto';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const WIDGET_FRONT_COMPONENT_ID = uuidv4();
const MENU_FRONT_COMPONENT_ID = uuidv4();
const SETTINGS_MENU_ITEM_ID = uuidv4();
const COMMAND_MENU_ITEM_ID = uuidv4();

const WIDGET_COMPONENT_NAME = 'WidgetComponent';
const MENU_COMPONENT_NAME = 'MenuComponent';

const ALL_WIDGET_PICKERS = [
  { pageLayoutType: PageLayoutType.RECORD_PAGE, objectMetadataId: null },
  { pageLayoutType: PageLayoutType.DASHBOARD, objectMetadataId: null },
];

const buildFrontComponent = ({
  universalIdentifier,
  componentName,
  isHeadless = false,
  widgetAvailability,
}: {
  universalIdentifier: string;
  componentName: string;
  isHeadless?: boolean;
  widgetAvailability?: FrontComponentWidgetAvailabilityManifest[];
}): FrontComponentManifest => ({
  universalIdentifier,
  name: componentName,
  sourceComponentPath: `src/front-components/${componentName}.tsx`,
  builtComponentPath: `src/front-components/${componentName}.mjs`,
  builtComponentChecksum: `${componentName}-checksum`,
  componentName,
  isHeadless,
  ...(isDefined(widgetAvailability) ? { widgetAvailability } : {}),
});

const SETTINGS_MENU_ITEM: SettingsMenuItemManifest = {
  universalIdentifier: SETTINGS_MENU_ITEM_ID,
  frontComponentUniversalIdentifier: MENU_FRONT_COMPONENT_ID,
  title: 'Settings',
};

const COMMAND_MENU_ITEM: CommandMenuItemManifest = {
  universalIdentifier: COMMAND_MENU_ITEM_ID,
  frontComponentUniversalIdentifier: MENU_FRONT_COMPONENT_ID,
  label: 'Open form',
};

const buildManifest = ({
  settingsMenuItems = [],
  commandMenuItems = [],
  isWidgetHeadless,
  isMenuHeadless,
  widgetWidgetAvailability,
  menuWidgetAvailability,
}: {
  settingsMenuItems?: SettingsMenuItemManifest[];
  commandMenuItems?: CommandMenuItemManifest[];
  isWidgetHeadless?: boolean;
  isMenuHeadless?: boolean;
  widgetWidgetAvailability?: FrontComponentWidgetAvailabilityManifest[];
  menuWidgetAvailability?: FrontComponentWidgetAvailabilityManifest[];
} = {}): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      frontComponents: [
        buildFrontComponent({
          universalIdentifier: WIDGET_FRONT_COMPONENT_ID,
          componentName: WIDGET_COMPONENT_NAME,
          isHeadless: isWidgetHeadless,
          widgetAvailability: widgetWidgetAvailability,
        }),
        buildFrontComponent({
          universalIdentifier: MENU_FRONT_COMPONENT_ID,
          componentName: MENU_COMPONENT_NAME,
          isHeadless: isMenuHeadless,
          widgetAvailability: menuWidgetAvailability,
        }),
      ],
      settingsMenuItems,
      commandMenuItems,
    },
  });

const findWidgetAvailabilityByUniversalIdentifier = async (): Promise<
  Record<string, FrontComponentWidgetAvailabilityDTO[]>
> => {
  const { data } = await findFrontComponents({
    gqlFields: `
      universalIdentifier
      widgetAvailability {
        pageLayoutType
        objectMetadataId
      }
    `,
    expectToFail: false,
  });

  return Object.fromEntries(
    data.frontComponents
      .filter((frontComponent) =>
        [WIDGET_FRONT_COMPONENT_ID, MENU_FRONT_COMPONENT_ID].includes(
          frontComponent.universalIdentifier ?? '',
        ),
      )
      .map((frontComponent) => [
        frontComponent.universalIdentifier,
        frontComponent.widgetAvailability,
      ]),
  );
};

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

const uploadBuiltComponentFile = async (componentName: string) => {
  await uploadApplicationFile({
    applicationUniversalIdentifier: TEST_APP_ID,
    fileFolder: 'BuiltFrontComponent',
    filePath: `src/front-components/${componentName}.mjs`,
    fileBuffer: Buffer.from('dummy built component content'),
    filename: `${componentName}.mjs`,
    contentType: 'application/javascript',
    expectToFail: false,
  });
};

const expectSyncToBeRejected = async (manifest: Manifest) => {
  const { errors } = await syncApplication({
    manifest,
    expectToFail: true,
  });

  expect(errors).toBeDefined();
  expect(errors?.[0]?.extensions?.code).not.toBe('INTERNAL_SERVER_ERROR');
  expect(await findWidgetAvailabilityByUniversalIdentifier()).toEqual({
    [WIDGET_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
    [MENU_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
  });
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

    await uploadBuiltComponentFile(WIDGET_COMPONENT_NAME);
    await uploadBuiltComponentFile(MENU_COMPONENT_NAME);
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

  it('offers front components in both widget pickers for every object by default', async () => {
    expect(await findWidgetAvailabilityByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
      [MENU_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
    });
  }, 60000);

  it('keeps a front component rendered by a settings menu item out of the widget pickers by default', async () => {
    await syncApplication({
      manifest: buildManifest({ settingsMenuItems: [SETTINGS_MENU_ITEM] }),
      expectToFail: false,
    });

    expect(await findWidgetAvailabilityByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
      [MENU_FRONT_COMPONENT_ID]: [],
    });
  }, 60000);

  it('renders a front component behind a settings menu item even when declared headless', async () => {
    await syncApplication({
      manifest: buildManifest({
        settingsMenuItems: [SETTINGS_MENU_ITEM],
        isMenuHeadless: true,
      }),
      expectToFail: false,
    });

    const { data } = await findFrontComponents({
      gqlFields: `
        universalIdentifier
        isHeadless
        widgetAvailability {
          pageLayoutType
        }
      `,
      expectToFail: false,
    });

    expect(
      data.frontComponents.find(
        (frontComponent) =>
          frontComponent.universalIdentifier === MENU_FRONT_COMPONENT_ID,
      ),
    ).toMatchObject({ isHeadless: false, widgetAvailability: [] });
  }, 60000);

  it('keeps a front component opened by a command menu item out of the widget pickers by default', async () => {
    await syncApplication({
      manifest: buildManifest({ commandMenuItems: [COMMAND_MENU_ITEM] }),
      expectToFail: false,
    });

    expect(await findWidgetAvailabilityByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
      [MENU_FRONT_COMPONENT_ID]: [],
    });
  }, 60000);

  it('keeps a headless front component out of the widget pickers by default', async () => {
    await syncApplication({
      manifest: buildManifest({ isWidgetHeadless: true }),
      expectToFail: false,
    });

    expect(await findWidgetAvailabilityByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: [],
      [MENU_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
    });
  }, 60000);

  it('keeps the deprecated settings front component out of the widget pickers by default', async () => {
    const baseManifest = buildManifest();

    await syncApplication({
      manifest: {
        ...baseManifest,
        application: {
          ...baseManifest.application,
          settingsFrontComponent: {
            universalIdentifier: MENU_FRONT_COMPONENT_ID,
          },
        },
      },
      expectToFail: false,
    });

    expect(await findWidgetAvailabilityByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ALL_WIDGET_PICKERS,
      [MENU_FRONT_COMPONENT_ID]: [],
    });
  }, 60000);

  it('honors an explicit widgetAvailability over the default', async () => {
    await syncApplication({
      manifest: buildManifest({
        settingsMenuItems: [SETTINGS_MENU_ITEM],
        commandMenuItems: [COMMAND_MENU_ITEM],
        widgetWidgetAvailability: [],
        menuWidgetAvailability: [{ pageLayoutType: PageLayoutType.DASHBOARD }],
      }),
      expectToFail: false,
    });

    expect(await findWidgetAvailabilityByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: [],
      [MENU_FRONT_COMPONENT_ID]: [
        { pageLayoutType: PageLayoutType.DASHBOARD, objectMetadataId: null },
      ],
    });
  }, 60000);

  it('restricts the record page widget picker to the declared objects', async () => {
    await syncApplication({
      manifest: buildManifest({
        widgetWidgetAvailability: [
          {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectUniversalIdentifiers: [
              STANDARD_OBJECTS.company.universalIdentifier,
            ],
          },
          { pageLayoutType: PageLayoutType.DASHBOARD },
        ],
      }),
      expectToFail: false,
    });

    expect(
      (await findWidgetAvailabilityByUniversalIdentifier())[
        WIDGET_FRONT_COMPONENT_ID
      ],
    ).toEqual([
      {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: await findCompanyObjectMetadataId(),
      },
      { pageLayoutType: PageLayoutType.DASHBOARD, objectMetadataId: null },
    ]);
  }, 60000);

  it('restores the default once no menu item opens the front component', async () => {
    await syncApplication({
      manifest: buildManifest({
        settingsMenuItems: [SETTINGS_MENU_ITEM],
        commandMenuItems: [COMMAND_MENU_ITEM],
      }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(
      (await findWidgetAvailabilityByUniversalIdentifier())[
        MENU_FRONT_COMPONENT_ID
      ],
    ).toEqual(ALL_WIDGET_PICKERS);
  }, 60000);

  it('rejects a page layout type without a widget picker', async () => {
    await expectSyncToBeRejected(
      buildManifest({
        widgetWidgetAvailability: [
          {
            pageLayoutType:
              PageLayoutType.STANDALONE_PAGE as FrontComponentWidgetAvailabilityManifest['pageLayoutType'],
          },
        ],
      }),
    );
  }, 60000);

  it('rejects an object restriction on dashboards', async () => {
    await expectSyncToBeRejected(
      buildManifest({
        widgetWidgetAvailability: [
          {
            pageLayoutType: PageLayoutType.DASHBOARD,
            objectUniversalIdentifiers: [
              STANDARD_OBJECTS.company.universalIdentifier,
            ],
          },
        ],
      }),
    );
  }, 60000);

  it('rejects an object restriction on an unknown object', async () => {
    await expectSyncToBeRejected(
      buildManifest({
        widgetWidgetAvailability: [
          {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectUniversalIdentifiers: [uuidv4()],
          },
        ],
      }),
    );
  }, 60000);
});
