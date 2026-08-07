import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_LAYOUT_ID = uuidv4();
const TEST_TAB_ID = uuidv4();
const TEST_WIDGET_ID = 'a0000000-0000-4000-8000-00000000000a';
const UNKNOWN_VIEW_ID = 'b0000000-0000-4000-8000-00000000000b';

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const buildManifest = (overrides?: Partial<Pick<Manifest, 'pageLayouts'>>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

describe('Failing manifest sync - RECORD_TABLE widget with unknown view universal identifier', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description:
        'App for testing a RECORD_TABLE widget referencing an unknown view universal identifier',
      sourcePath: 'test-manifest-record-table-unknown-view-universal-identifier',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('rejects a dashboard RECORD_TABLE widget whose target view does not exist', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        pageLayouts: [
          {
            universalIdentifier: TEST_LAYOUT_ID,
            name: 'RT dashboard',
            type: PageLayoutType.DASHBOARD,
            tabs: [
              {
                universalIdentifier: TEST_TAB_ID,
                title: 'Tables',
                position: 0,
                layoutMode: PageLayoutTabLayoutMode.CANVAS,
                widgets: [
                  {
                    universalIdentifier: TEST_WIDGET_ID,
                    title: 'RT test table',
                    type: 'RECORD_TABLE',
                    objectUniversalIdentifier:
                      PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                    gridPosition: {
                      row: 0,
                      column: 0,
                      rowSpan: 4,
                      columnSpan: 6,
                    },
                    configuration: {
                      configurationType: 'RECORD_TABLE',
                      viewUniversalIdentifier: UNKNOWN_VIEW_ID,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
