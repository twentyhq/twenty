import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import {
  type CommandMenuItemManifest,
  type FrontComponentManifest,
  type FrontComponentSurface,
  type Manifest,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const WIDGET_FRONT_COMPONENT_ID = uuidv4();
const MENU_FRONT_COMPONENT_ID = uuidv4();
const SETTINGS_MENU_ITEM_ID = uuidv4();
const COMMAND_MENU_ITEM_ID = uuidv4();

const WIDGET_COMPONENT_NAME = 'WidgetComponent';
const MENU_COMPONENT_NAME = 'MenuComponent';

const buildFrontComponent = ({
  universalIdentifier,
  componentName,
  isHeadless = false,
  availableOn,
}: {
  universalIdentifier: string;
  componentName: string;
  isHeadless?: boolean;
  availableOn?: FrontComponentSurface[];
}): FrontComponentManifest => ({
  universalIdentifier,
  name: componentName,
  sourceComponentPath: `src/front-components/${componentName}.tsx`,
  builtComponentPath: `src/front-components/${componentName}.mjs`,
  builtComponentChecksum: `${componentName}-checksum`,
  componentName,
  isHeadless,
  ...(isDefined(availableOn) ? { availableOn } : {}),
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
  widgetAvailableOn,
  menuAvailableOn,
}: {
  settingsMenuItems?: SettingsMenuItemManifest[];
  commandMenuItems?: CommandMenuItemManifest[];
  isWidgetHeadless?: boolean;
  isMenuHeadless?: boolean;
  widgetAvailableOn?: FrontComponentSurface[];
  menuAvailableOn?: FrontComponentSurface[];
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
          availableOn: widgetAvailableOn,
        }),
        buildFrontComponent({
          universalIdentifier: MENU_FRONT_COMPONENT_ID,
          componentName: MENU_COMPONENT_NAME,
          isHeadless: isMenuHeadless,
          availableOn: menuAvailableOn,
        }),
      ],
      settingsMenuItems,
      commandMenuItems,
    },
  });

const findAvailableOnByUniversalIdentifier = async (): Promise<
  Record<string, FrontComponentSurface[]>
> => {
  const { data } = await findFrontComponents({
    gqlFields: `
      universalIdentifier
      availableOn
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
        frontComponent.availableOn,
      ]),
  );
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

describe('Manifest sync - front component availableOn', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Front Component Available On Test Application',
      description: 'App for testing front component availableOn sync',
      sourcePath: 'front-component-available-on-manifest-sync',
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

  it('offers front components in both widget pickers by default', async () => {
    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [MENU_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
    });
  }, 60000);

  it('keeps a front component rendered by a settings menu item out of the widget pickers by default', async () => {
    await syncApplication({
      manifest: buildManifest({ settingsMenuItems: [SETTINGS_MENU_ITEM] }),
      expectToFail: false,
    });

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
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
        availableOn
      `,
      expectToFail: false,
    });

    expect(
      data.frontComponents.find(
        (frontComponent) =>
          frontComponent.universalIdentifier === MENU_FRONT_COMPONENT_ID,
      ),
    ).toMatchObject({ isHeadless: false, availableOn: [] });
  }, 60000);

  it('keeps a front component opened by a command menu item out of the widget pickers by default', async () => {
    await syncApplication({
      manifest: buildManifest({ commandMenuItems: [COMMAND_MENU_ITEM] }),
      expectToFail: false,
    });

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [MENU_FRONT_COMPONENT_ID]: [],
    });
  }, 60000);

  it('keeps a headless front component out of the widget pickers by default', async () => {
    await syncApplication({
      manifest: buildManifest({ isWidgetHeadless: true }),
      expectToFail: false,
    });

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: [],
      [MENU_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
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

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [MENU_FRONT_COMPONENT_ID]: [],
    });
  }, 60000);

  it('honors an explicit availableOn over the default', async () => {
    await syncApplication({
      manifest: buildManifest({
        settingsMenuItems: [SETTINGS_MENU_ITEM],
        commandMenuItems: [COMMAND_MENU_ITEM],
        widgetAvailableOn: [],
        menuAvailableOn: ['OBJECTS'],
      }),
      expectToFail: false,
    });

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: [],
      [MENU_FRONT_COMPONENT_ID]: ['OBJECTS'],
    });
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
      (await findAvailableOnByUniversalIdentifier())[MENU_FRONT_COMPONENT_ID],
    ).toEqual(['OBJECTS', 'DASHBOARDS']);
  }, 60000);

  it('rejects a surface that is not a layout editor', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        widgetAvailableOn: ['SETTINGS' as FrontComponentSurface],
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.[0]?.extensions?.code).not.toBe('INTERNAL_SERVER_ERROR');
    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [MENU_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
    });
  }, 60000);
});
