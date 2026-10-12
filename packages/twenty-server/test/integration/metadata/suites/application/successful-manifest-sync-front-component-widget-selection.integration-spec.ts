import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import {
  type FrontComponentManifest,
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
  excludeFromWidgetSelection,
}: {
  universalIdentifier: string;
  componentName: string;
  excludeFromWidgetSelection?: boolean;
}): FrontComponentManifest => ({
  universalIdentifier,
  name: componentName,
  sourceComponentPath: `src/front-components/${componentName}.tsx`,
  builtComponentPath: `src/front-components/${componentName}.mjs`,
  builtComponentChecksum: `${componentName}-checksum`,
  componentName,
  isHeadless: false,
  ...(isDefined(excludeFromWidgetSelection)
    ? { excludeFromWidgetSelection }
    : {}),
});

const SETTINGS_MENU_ITEM: SettingsMenuItemManifest = {
  universalIdentifier: SETTINGS_MENU_ITEM_ID,
  frontComponentUniversalIdentifier: SETTINGS_FRONT_COMPONENT_ID,
  title: 'Settings',
};

const buildManifest = ({
  settingsMenuItems = [],
  widgetExcludeFromWidgetSelection,
  settingsExcludeFromWidgetSelection,
  overrides,
}: {
  settingsMenuItems?: SettingsMenuItemManifest[];
  widgetExcludeFromWidgetSelection?: boolean;
  settingsExcludeFromWidgetSelection?: boolean;
  overrides?: Partial<Manifest>;
} = {}): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      frontComponents: [
        buildFrontComponent({
          universalIdentifier: WIDGET_FRONT_COMPONENT_ID,
          componentName: WIDGET_COMPONENT_NAME,
          excludeFromWidgetSelection: widgetExcludeFromWidgetSelection,
        }),
        buildFrontComponent({
          universalIdentifier: SETTINGS_FRONT_COMPONENT_ID,
          componentName: SETTINGS_COMPONENT_NAME,
          excludeFromWidgetSelection: settingsExcludeFromWidgetSelection,
        }),
      ],
      settingsMenuItems,
      ...overrides,
    },
  });

const findExcludeFromWidgetSelectionByUniversalIdentifier = async (): Promise<
  Record<string, boolean>
> => {
  const { data } = await findFrontComponents({
    gqlFields: `
      universalIdentifier
      excludeFromWidgetSelection
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
        frontComponent.excludeFromWidgetSelection,
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

describe('Manifest sync - front component widget selection', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Front Component Widget Selection Test Application',
      description: 'App for testing front component widget selection sync',
      sourcePath: 'front-component-widget-selection-manifest-sync',
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

  it('keeps front components selectable as widgets by default', async () => {
    expect(await findExcludeFromWidgetSelectionByUniversalIdentifier()).toEqual(
      {
        [WIDGET_FRONT_COMPONENT_ID]: false,
        [SETTINGS_FRONT_COMPONENT_ID]: false,
      },
    );
  }, 60000);

  it('excludes a front component rendered by a settings menu item by default', async () => {
    await syncApplication({
      manifest: buildManifest({ settingsMenuItems: [SETTINGS_MENU_ITEM] }),
      expectToFail: false,
    });

    expect(await findExcludeFromWidgetSelectionByUniversalIdentifier()).toEqual(
      {
        [WIDGET_FRONT_COMPONENT_ID]: false,
        [SETTINGS_FRONT_COMPONENT_ID]: true,
      },
    );
  }, 60000);

  it('excludes the deprecated settings front component by default', async () => {
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

    expect(await findExcludeFromWidgetSelectionByUniversalIdentifier()).toEqual(
      {
        [WIDGET_FRONT_COMPONENT_ID]: false,
        [SETTINGS_FRONT_COMPONENT_ID]: true,
      },
    );
  }, 60000);

  it('honors an explicit excludeFromWidgetSelection over the default', async () => {
    await syncApplication({
      manifest: buildManifest({
        settingsMenuItems: [SETTINGS_MENU_ITEM],
        widgetExcludeFromWidgetSelection: true,
        settingsExcludeFromWidgetSelection: false,
      }),
      expectToFail: false,
    });

    expect(await findExcludeFromWidgetSelectionByUniversalIdentifier()).toEqual(
      {
        [WIDGET_FRONT_COMPONENT_ID]: true,
        [SETTINGS_FRONT_COMPONENT_ID]: false,
      },
    );
  }, 60000);

  it('makes a front component selectable again once no settings menu item renders it', async () => {
    await syncApplication({
      manifest: buildManifest({ settingsMenuItems: [SETTINGS_MENU_ITEM] }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(
      (await findExcludeFromWidgetSelectionByUniversalIdentifier())[
        SETTINGS_FRONT_COMPONENT_ID
      ],
    ).toBe(false);
  }, 60000);
});
