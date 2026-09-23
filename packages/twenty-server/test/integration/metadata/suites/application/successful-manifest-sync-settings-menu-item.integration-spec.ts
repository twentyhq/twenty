import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type FrontComponentManifest,
  getLegacySettingsMenuItemUniversalIdentifier,
  type Manifest,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const SYNC_FRONT_COMPONENT_ID = uuidv4();
const BILLING_FRONT_COMPONENT_ID = uuidv4();
const SYNC_SETTINGS_MENU_ITEM_ID = uuidv4();
const BILLING_SETTINGS_MENU_ITEM_ID = uuidv4();

type PersistedSettingsMenuItem = {
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

const SYNC_SETTINGS_MENU_ITEM: SettingsMenuItemManifest = {
  universalIdentifier: SYNC_SETTINGS_MENU_ITEM_ID,
  frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
  title: 'Sync',
  icon: 'IconRefresh',
  position: 1,
};

const BILLING_SETTINGS_MENU_ITEM: SettingsMenuItemManifest = {
  universalIdentifier: BILLING_SETTINGS_MENU_ITEM_ID,
  frontComponentUniversalIdentifier: BILLING_FRONT_COMPONENT_ID,
  title: 'Billing',
  icon: 'IconCreditCard',
  position: 2,
  scope: 'USER',
};

const buildManifest = (
  settingsMenuItems: SettingsMenuItemManifest[],
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
      settingsMenuItems,
      ...overrides,
    },
  });

const findAppSettingsMenuItems = async (): Promise<
  PersistedSettingsMenuItem[]
> =>
  await globalThis.testDataSource.query(
    `SELECT "settingsMenuItem"."universalIdentifier" AS "universalIdentifier",
            "settingsMenuItem"."title" AS "title",
            "settingsMenuItem"."icon" AS "icon",
            "settingsMenuItem"."position" AS "position",
            "settingsMenuItem"."scope" AS "scope",
            "frontComponent"."universalIdentifier" AS "frontComponentUniversalIdentifier"
     FROM core."settingsMenuItem" "settingsMenuItem"
     INNER JOIN core."application" "application"
       ON "application"."id" = "settingsMenuItem"."applicationId"
     INNER JOIN core."frontComponent" "frontComponent"
       ON "frontComponent"."id" = "settingsMenuItem"."frontComponentId"
     WHERE "application"."universalIdentifier" = $1
     ORDER BY "settingsMenuItem"."position" ASC`,
    [TEST_APP_ID],
  );

// The migration runner refuses to create a front component whose built file is
// not in storage, so every component an item points at needs one uploaded first.
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

describe('Manifest sync - settings menu items', () => {
  // The application, its role and its front components are identical for every
  // test, and installing them costs far more than the syncs under test, so they
  // are set up once and only the items are reset between tests.
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Settings Menu Item Test Application',
      description: 'App for testing settings menu item manifest sync',
      sourcePath: 'settings-menu-item-manifest-sync',
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

  it('persists every declared item with its position, icon and scope', async () => {
    await syncApplication({
      manifest: buildManifest([
        BILLING_SETTINGS_MENU_ITEM,
        SYNC_SETTINGS_MENU_ITEM,
      ]),
      expectToFail: false,
    });

    const settingsMenuItems = await findAppSettingsMenuItems();

    expect(settingsMenuItems).toHaveLength(2);
    expect(settingsMenuItems[0]).toMatchObject({
      universalIdentifier: SYNC_SETTINGS_MENU_ITEM_ID,
      title: 'Sync',
      icon: 'IconRefresh',
      position: 1,
      scope: 'WORKSPACE',
      frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
    });
    expect(settingsMenuItems[1]).toMatchObject({
      universalIdentifier: BILLING_SETTINGS_MENU_ITEM_ID,
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
          universalIdentifier: SYNC_SETTINGS_MENU_ITEM_ID,
          frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
          title: 'Sync',
        },
      ]),
      expectToFail: false,
    });

    const [settingsMenuItem] = await findAppSettingsMenuItems();

    expect(settingsMenuItem).toMatchObject({
      icon: null,
      position: 0,
      scope: 'WORKSPACE',
    });
  }, 60000);

  it('updates an item in place rather than replacing it', async () => {
    await syncApplication({
      manifest: buildManifest([SYNC_SETTINGS_MENU_ITEM]),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest([
        {
          ...SYNC_SETTINGS_MENU_ITEM,
          title: 'Synchronization',
          icon: 'IconRefreshDot',
          position: 1.5,
          scope: 'USER',
        },
      ]),
      expectToFail: false,
    });

    const settingsMenuItems = await findAppSettingsMenuItems();

    expect(settingsMenuItems).toHaveLength(1);
    expect(settingsMenuItems[0]).toMatchObject({
      universalIdentifier: SYNC_SETTINGS_MENU_ITEM_ID,
      title: 'Synchronization',
      icon: 'IconRefreshDot',
      position: 1.5,
      scope: 'USER',
    });
  }, 60000);

  it('lets two items of the same application share a position across scopes', async () => {
    await syncApplication({
      manifest: buildManifest([
        { ...SYNC_SETTINGS_MENU_ITEM, position: 1, scope: 'WORKSPACE' },
        { ...BILLING_SETTINGS_MENU_ITEM, position: 1, scope: 'USER' },
      ]),
      expectToFail: false,
    });

    expect(await findAppSettingsMenuItems()).toHaveLength(2);
  }, 60000);

  it('deletes an item the manifest stopped declaring', async () => {
    await syncApplication({
      manifest: buildManifest([
        SYNC_SETTINGS_MENU_ITEM,
        BILLING_SETTINGS_MENU_ITEM,
      ]),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest([SYNC_SETTINGS_MENU_ITEM]),
      expectToFail: false,
    });

    const settingsMenuItems = await findAppSettingsMenuItems();

    expect(settingsMenuItems).toHaveLength(1);
    expect(settingsMenuItems[0].universalIdentifier).toBe(
      SYNC_SETTINGS_MENU_ITEM_ID,
    );
  }, 60000);

  it('keeps an item the manifest stopped declaring when deletions are turned off', async () => {
    await syncApplication({
      manifest: buildManifest([
        SYNC_SETTINGS_MENU_ITEM,
        BILLING_SETTINGS_MENU_ITEM,
      ]),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest([SYNC_SETTINGS_MENU_ITEM]),
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(await findAppSettingsMenuItems()).toHaveLength(2);
  }, 60000);

  // An application built before defineSettingsMenuItem existed declares no item,
  // only the deprecated settingsFrontComponent pointer. Syncing it must produce
  // the very row the upgrade backfill writes, or the tab it already renders is
  // deleted and recreated on every sync.
  it('synthesizes an item for an application still using settingsFrontComponent', async () => {
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

    const settingsMenuItems = await findAppSettingsMenuItems();

    expect(settingsMenuItems).toHaveLength(1);
    expect(settingsMenuItems[0]).toMatchObject({
      universalIdentifier: getLegacySettingsMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: TEST_APP_ID,
        frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
      }),
      title: 'Settings',
      icon: 'IconAdjustments',
      frontComponentUniversalIdentifier: SYNC_FRONT_COMPONENT_ID,
    });
  }, 60000);

  it('drops the synthesized item once the application declares its own', async () => {
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
        ...buildManifest([SYNC_SETTINGS_MENU_ITEM]),
        application: legacyApplication,
      },
      expectToFail: false,
    });

    const settingsMenuItems = await findAppSettingsMenuItems();

    expect(settingsMenuItems).toHaveLength(1);
    expect(settingsMenuItems[0].universalIdentifier).toBe(
      SYNC_SETTINGS_MENU_ITEM_ID,
    );
  }, 60000);

  // The settings page builds one tab per item off findOneApplication, so the read
  // path has to expose the item's own fields and not just the rows the sync wrote.
  it('exposes the items on findOneApplication, pointing at their front component', async () => {
    await syncApplication({
      manifest: buildManifest([
        BILLING_SETTINGS_MENU_ITEM,
        SYNC_SETTINGS_MENU_ITEM,
      ]),
      expectToFail: false,
    });

    const { data } = await findOneApplication({
      input: { universalIdentifier: TEST_APP_ID },
      gqlFields: `
        id
        frontComponents {
          id
          universalIdentifier
        }
        settingsMenuItems {
          universalIdentifier
          frontComponentId
          title
          icon
          position
          scope
        }
      `,
    });

    const frontComponentIdByUniversalIdentifier = new Map(
      (data.findOneApplication.frontComponents ?? []).map((frontComponent) => [
        frontComponent.universalIdentifier,
        frontComponent.id,
      ]),
    );

    expect(data.findOneApplication.settingsMenuItems).toHaveLength(2);
    expect(data.findOneApplication.settingsMenuItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          universalIdentifier: SYNC_SETTINGS_MENU_ITEM_ID,
          frontComponentId: frontComponentIdByUniversalIdentifier.get(
            SYNC_FRONT_COMPONENT_ID,
          ),
          title: 'Sync',
          icon: 'IconRefresh',
          position: 1,
          scope: 'WORKSPACE',
        }),
        expect.objectContaining({
          universalIdentifier: BILLING_SETTINGS_MENU_ITEM_ID,
          frontComponentId: frontComponentIdByUniversalIdentifier.get(
            BILLING_FRONT_COMPONENT_ID,
          ),
          title: 'Billing',
          icon: 'IconCreditCard',
          position: 2,
          scope: 'USER',
        }),
      ]),
    );
  }, 60000);
});
