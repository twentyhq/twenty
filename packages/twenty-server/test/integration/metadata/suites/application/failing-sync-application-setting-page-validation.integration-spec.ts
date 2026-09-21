import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type SettingPageManifest } from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

const TEST_APP_ID = 'd1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'd1b2c3d4-0002-4000-a000-000000000002';
const TEST_FRONT_COMPONENT_ID = 'd1b2c3d4-0003-4000-a000-000000000003';
const TEST_SETTING_PAGE_ID = 'd1b2c3d4-0004-4000-a000-000000000004';
const OTHER_SETTING_PAGE_ID = 'd1b2c3d4-0005-4000-a000-000000000005';
const UNKNOWN_FRONT_COMPONENT_ID = 'd1b2c3d4-0006-4000-a000-000000000006';

type TestContext = {
  settingPages: SettingPageManifest[];
};

const failingSettingPageSyncTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when syncing a page with an empty title',
    context: {
      settingPages: [
        {
          universalIdentifier: TEST_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: TEST_FRONT_COMPONENT_ID,
          title: '',
        },
      ],
    },
  },
  {
    title: 'when syncing a page with the reserved General title',
    context: {
      settingPages: [
        {
          universalIdentifier: TEST_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: TEST_FRONT_COMPONENT_ID,
          title: 'General',
        },
      ],
    },
  },
  {
    title: 'when syncing a page pointing at an unknown front component',
    context: {
      settingPages: [
        {
          universalIdentifier: TEST_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: UNKNOWN_FRONT_COMPONENT_ID,
          title: 'Orphan',
        },
      ],
    },
  },
  {
    title: 'when two pages of the same scope share a position',
    context: {
      settingPages: [
        {
          universalIdentifier: TEST_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: TEST_FRONT_COMPONENT_ID,
          title: 'First',
          position: 1,
        },
        {
          universalIdentifier: OTHER_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: TEST_FRONT_COMPONENT_ID,
          title: 'Second',
          position: 1,
        },
      ],
    },
  },
  {
    title: 'when two pages collide on the position the manifest omits',
    context: {
      settingPages: [
        {
          universalIdentifier: TEST_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: TEST_FRONT_COMPONENT_ID,
          title: 'First',
        },
        {
          universalIdentifier: OTHER_SETTING_PAGE_ID,
          frontComponentUniversalIdentifier: TEST_FRONT_COMPONENT_ID,
          title: 'Second',
        },
      ],
    },
  },
];

// Every case below is rejected while the migration is still being built, so
// the front component is never created and needs no built file in storage.
describe('Sync application should fail on invalid setting pages', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid Setting Page App',
      description: 'App for testing setting page manifest validation',
      sourcePath: 'test-invalid-setting-page',
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingSettingPageSyncTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildBaseManifest({
          appId: TEST_APP_ID,
          roleId: TEST_ROLE_ID,
          overrides: {
            frontComponents: [
              {
                universalIdentifier: TEST_FRONT_COMPONENT_ID,
                name: 'SettingsComponent',
                description: 'The settings page of the application',
                sourceComponentPath: 'src/front-components/settings.tsx',
                builtComponentPath: 'src/front-components/settings.mjs',
                builtComponentChecksum: 'settings-checksum',
                componentName: 'SettingsComponent',
                isHeadless: false,
              },
            ],
            settingPages: context.settingPages,
          },
        }),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );
});
