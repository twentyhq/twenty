import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import {
  type FrontComponentManifest,
  type FrontComponentWidgetAvailabilityManifest,
  type Manifest,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

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
});
