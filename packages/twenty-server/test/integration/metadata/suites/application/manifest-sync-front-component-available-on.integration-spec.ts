import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import {
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
const SETTINGS_FRONT_COMPONENT_ID = uuidv4();
const SETTINGS_MENU_ITEM_ID = uuidv4();

const WIDGET_COMPONENT_NAME = 'WidgetComponent';
const SETTINGS_COMPONENT_NAME = 'SettingsComponent';

const buildFrontComponent = ({
  universalIdentifier,
  componentName,
  availableOn,
}: {
  universalIdentifier: string;
  componentName: string;
  availableOn?: FrontComponentSurface[];
}): FrontComponentManifest => ({
  universalIdentifier,
  name: componentName,
  sourceComponentPath: `src/front-components/${componentName}.tsx`,
  builtComponentPath: `src/front-components/${componentName}.mjs`,
  builtComponentChecksum: `${componentName}-checksum`,
  componentName,
  isHeadless: false,
  ...(isDefined(availableOn) ? { availableOn } : {}),
});

const SETTINGS_MENU_ITEM: SettingsMenuItemManifest = {
  universalIdentifier: SETTINGS_MENU_ITEM_ID,
  frontComponentUniversalIdentifier: SETTINGS_FRONT_COMPONENT_ID,
  title: 'Settings',
};

const buildManifest = ({
  settingsMenuItems = [],
  widgetAvailableOn,
  settingsAvailableOn,
}: {
  settingsMenuItems?: SettingsMenuItemManifest[];
  widgetAvailableOn?: FrontComponentSurface[];
  settingsAvailableOn?: FrontComponentSurface[];
} = {}): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      frontComponents: [
        buildFrontComponent({
          universalIdentifier: WIDGET_FRONT_COMPONENT_ID,
          componentName: WIDGET_COMPONENT_NAME,
          availableOn: widgetAvailableOn,
        }),
        buildFrontComponent({
          universalIdentifier: SETTINGS_FRONT_COMPONENT_ID,
          componentName: SETTINGS_COMPONENT_NAME,
          availableOn: settingsAvailableOn,
        }),
      ],
      settingsMenuItems,
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
        [WIDGET_FRONT_COMPONENT_ID, SETTINGS_FRONT_COMPONENT_ID].includes(
          frontComponent.universalIdentifier ?? '',
        ),
      )
      .map((frontComponent) => [
        frontComponent.universalIdentifier,
        frontComponent.availableOn,
      ]),
  );
};

// The migration runner refuses to create a front component whose built file is
// not in storage, so every synced component needs one uploaded first.
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

    // setupApplicationForSync leaves fake timers installed, under which the
    // multipart upload never resolves.
    jest.useRealTimers();

    await uploadBuiltComponentFile(WIDGET_COMPONENT_NAME);
    await uploadBuiltComponentFile(SETTINGS_COMPONENT_NAME);
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

  it('makes front components available on objects and dashboards by default', async () => {
    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [SETTINGS_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
    });
  }, 60000);

  it('makes a front component rendered by a settings menu item available on settings only by default', async () => {
    await syncApplication({
      manifest: buildManifest({ settingsMenuItems: [SETTINGS_MENU_ITEM] }),
      expectToFail: false,
    });

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [SETTINGS_FRONT_COMPONENT_ID]: ['SETTINGS'],
    });
  }, 60000);

  it('makes the deprecated settings front component available on settings only by default', async () => {
    const baseManifest = buildManifest();

    await syncApplication({
      manifest: {
        ...baseManifest,
        application: {
          ...baseManifest.application,
          settingsFrontComponent: {
            universalIdentifier: SETTINGS_FRONT_COMPONENT_ID,
          },
        },
      },
      expectToFail: false,
    });

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [SETTINGS_FRONT_COMPONENT_ID]: ['SETTINGS'],
    });
  }, 60000);

  it('honors an explicit availableOn over the default', async () => {
    await syncApplication({
      manifest: buildManifest({
        settingsMenuItems: [SETTINGS_MENU_ITEM],
        widgetAvailableOn: ['DASHBOARDS'],
        settingsAvailableOn: ['SETTINGS', 'OBJECTS'],
      }),
      expectToFail: false,
    });

    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['DASHBOARDS'],
      [SETTINGS_FRONT_COMPONENT_ID]: ['SETTINGS', 'OBJECTS'],
    });
  }, 60000);

  it('restores the default once no settings menu item renders the front component', async () => {
    await syncApplication({
      manifest: buildManifest({ settingsMenuItems: [SETTINGS_MENU_ITEM] }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(
      (await findAvailableOnByUniversalIdentifier())[
        SETTINGS_FRONT_COMPONENT_ID
      ],
    ).toEqual(['OBJECTS', 'DASHBOARDS']);
  }, 60000);

  it('rejects an unknown surface', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        widgetAvailableOn: ['UNKNOWN' as FrontComponentSurface],
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.[0]?.extensions?.code).not.toBe('INTERNAL_SERVER_ERROR');
    expect(await findAvailableOnByUniversalIdentifier()).toEqual({
      [WIDGET_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
      [SETTINGS_FRONT_COMPONENT_ID]: ['OBJECTS', 'DASHBOARDS'],
    });
  }, 60000);
});
