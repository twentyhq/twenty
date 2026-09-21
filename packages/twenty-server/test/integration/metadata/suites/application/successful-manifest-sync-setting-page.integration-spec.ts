import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type FrontComponentManifest,
  getLegacySettingPageUniversalIdentifier,
  type Manifest,
  type SettingPageManifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const SYNC_FRONT_COMPONENT_ID = uuidv4();
const BILLING_FRONT_COMPONENT_ID = uuidv4();
const SYNC_SETTING_PAGE_ID = uuidv4();
const BILLING_SETTING_PAGE_ID = uuidv4();

type PersistedSettingPage = {
  universalIdentifier: string;
  title: string;
  icon: string | null;
  position: number;
  scope: string;
  frontComponentUniversalIdentifier: string;
};

const buildFrontComponent = (
  universalIdentifier: string,
  componentName: string,
): FrontComponentManifest => ({
  universalIdentifier,
  name: componentName,
  description: `The ${componentName} page of the application`,
  sourceComponentPath: `src/front-components/${componentName}.tsx`,
  builtComponentPath: `src/front-components/${componentName}.mjs`,
  builtComponentChecksum: `${componentName}-checksum`,
  componentName,
  isHeadless: false,
});

const SYNC_SETTING_PAGE: SettingPageManifest = {
  universalIdentifier: SYNC_SETTING_PAGE_ID,
  frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
  title: 'Sync',
  icon: 'IconRefresh',
  position: 1,
};

const BILLING_SETTING_PAGE: SettingPageManifest = {
  universalIdentifier: BILLING_SETTING_PAGE_ID,
  frontComponentUniversalIdentifier: BILLING_FRONT_COMPONENT_ID,
  title: 'Billing',
  icon: 'IconCreditCard',
  position: 2,
  scope: 'USER',
};

const buildManifest = (
  settingPages: SettingPageManifest[],
  overrides?: Partial<Manifest>,
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      frontComponents: [
        buildFrontComponent(SYNC_FRONT_COMPONENT_ID, 'SyncSettings'),
        buildFrontComponent(BILLING_FRONT_COMPONENT_ID, 'BillingSettings'),
      ],
      settingPages,
      ...overrides,
    },
  });

const findAppSettingPages = async (): Promise<PersistedSettingPage[]> =>
  await globalThis.testDataSource.query(
    `SELECT "settingPage"."universalIdentifier" AS "universalIdentifier",
            "settingPage"."title" AS "title",
            "settingPage"."icon" AS "icon",
            "settingPage"."position" AS "position",
            "settingPage"."scope" AS "scope",
            "frontComponent"."universalIdentifier" AS "frontComponentUniversalIdentifier"
     FROM core."settingPage" "settingPage"
     INNER JOIN core."application" "application"
       ON "application"."id" = "settingPage"."applicationId"
     INNER JOIN core."frontComponent" "frontComponent"
       ON "frontComponent"."id" = "settingPage"."frontComponentId"
     WHERE "application"."universalIdentifier" = $1
     ORDER BY "settingPage"."position" ASC`,
    [TEST_APP_ID],
  );

// The migration runner refuses to create a front component whose built file is
// not in storage, so every component a page points at needs one uploaded first.
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

describe('Manifest sync - setting pages', () => {
  // The application, its role and its front components are identical for every
  // test, and installing them costs far more than the syncs under test, so they
  // are set up once and only the pages are reset between tests.
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Setting Page Test Application',
      description: 'App for testing setting page manifest sync',
      sourcePath: 'setting-page-manifest-sync',
    });

    // setupApplicationForSync leaves fake timers installed, under which the
    // multipart upload never resolves.
    jest.useRealTimers();

    await uploadBuiltComponentFile('SyncSettings');
    await uploadBuiltComponentFile('BillingSettings');
  }, 120000);

  beforeEach(async () => {
    await syncApplication({
      manifest: buildManifest([]),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('persists every declared page with its position, icon and scope', async () => {
    await syncApplication({
      manifest: buildManifest([BILLING_SETTING_PAGE, SYNC_SETTING_PAGE]),
      expectToFail: false,
    });

    const settingPages = await findAppSettingPages();

    expect(settingPages).toHaveLength(2);
    expect(settingPages[0]).toMatchObject({
      universalIdentifier: SYNC_SETTING_PAGE_ID,
      title: 'Sync',
      icon: 'IconRefresh',
      position: 1,
      scope: 'WORKSPACE',
      frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
    });
    expect(settingPages[1]).toMatchObject({
      universalIdentifier: BILLING_SETTING_PAGE_ID,
      title: 'Billing',
      icon: 'IconCreditCard',
      position: 2,
      scope: 'USER',
      frontComponentUniversalIdentifier: BILLING_FRONT_COMPONENT_ID,
    });
  }, 60000);

  it('defaults position and scope when the manifest omits them', async () => {
    await syncApplication({
      manifest: buildManifest([
        {
          universalIdentifier: SYNC_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
          title: 'Sync',
        },
      ]),
      expectToFail: false,
    });

    const [settingPage] = await findAppSettingPages();

    expect(settingPage).toMatchObject({
      icon: null,
      position: 0,
      scope: 'WORKSPACE',
    });
  }, 60000);

  it('updates a page in place rather than replacing it', async () => {
    await syncApplication({
      manifest: buildManifest([SYNC_SETTING_PAGE]),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest([
        {
          ...SYNC_SETTING_PAGE,
          title: 'Synchronization',
          icon: 'IconRefreshDot',
          position: 1.5,
          scope: 'USER',
        },
      ]),
      expectToFail: false,
    });

    const settingPages = await findAppSettingPages();

    expect(settingPages).toHaveLength(1);
    expect(settingPages[0]).toMatchObject({
      universalIdentifier: SYNC_SETTING_PAGE_ID,
      title: 'Synchronization',
      icon: 'IconRefreshDot',
      position: 1.5,
      scope: 'USER',
    });
  }, 60000);

  it('lets two pages of the same application share a position across scopes', async () => {
    await syncApplication({
      manifest: buildManifest([
        { ...SYNC_SETTING_PAGE, position: 1, scope: 'WORKSPACE' },
        { ...BILLING_SETTING_PAGE, position: 1, scope: 'USER' },
      ]),
      expectToFail: false,
    });

    expect(await findAppSettingPages()).toHaveLength(2);
  }, 60000);

  it('deletes a page the manifest stopped declaring', async () => {
    await syncApplication({
      manifest: buildManifest([SYNC_SETTING_PAGE, BILLING_SETTING_PAGE]),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest([SYNC_SETTING_PAGE]),
      expectToFail: false,
    });

    const settingPages = await findAppSettingPages();

    expect(settingPages).toHaveLength(1);
    expect(settingPages[0].universalIdentifier).toBe(SYNC_SETTING_PAGE_ID);
  }, 60000);

  it('keeps a page the manifest stopped declaring when deletions are turned off', async () => {
    await syncApplication({
      manifest: buildManifest([SYNC_SETTING_PAGE, BILLING_SETTING_PAGE]),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest([SYNC_SETTING_PAGE]),
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(await findAppSettingPages()).toHaveLength(2);
  }, 60000);

  // An application built before defineSettingPage existed declares no page, only
  // the deprecated settingsFrontComponent pointer. Syncing it must produce the
  // very row the upgrade backfill writes, or the tab it already renders is
  // deleted and recreated on every sync.
  it('synthesizes a page for an application still using settingsFrontComponent', async () => {
    const baseManifest = buildManifest([]);

    await syncApplication({
      manifest: {
        ...baseManifest,
        application: {
          ...baseManifest.application,
          settingsFrontComponent: {
            universalIdentifier: SYNC_FRONT_COMPONENT_ID,
          },
        },
      },
      expectToFail: false,
    });

    const settingPages = await findAppSettingPages();

    expect(settingPages).toHaveLength(1);
    expect(settingPages[0]).toMatchObject({
      universalIdentifier: getLegacySettingPageUniversalIdentifier({
        applicationUniversalIdentifier: TEST_APP_ID,
        frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
      }),
      title: 'Settings',
      icon: 'IconAdjustments',
      frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
    });
  }, 60000);

  it('drops the synthesized page once the application declares its own', async () => {
    const baseManifest = buildManifest([]);
    const legacyApplication = {
      ...baseManifest.application,
      settingsFrontComponent: {
        universalIdentifier: SYNC_FRONT_COMPONENT_ID,
      },
    };

    await syncApplication({
      manifest: { ...baseManifest, application: legacyApplication },
      expectToFail: false,
    });

    await syncApplication({
      manifest: {
        ...buildManifest([SYNC_SETTING_PAGE]),
        application: legacyApplication,
      },
      expectToFail: false,
    });

    const settingPages = await findAppSettingPages();

    expect(settingPages).toHaveLength(1);
    expect(settingPages[0].universalIdentifier).toBe(SYNC_SETTING_PAGE_ID);
  }, 60000);
});
