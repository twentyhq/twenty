import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_TAB_ID = uuidv4();

const PERSON_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage
    .universalIdentifier;
const COMPANY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage
    .universalIdentifier;

const buildManifest = (pageLayoutUniversalIdentifier: string): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      pageLayoutTabs: [
        {
          universalIdentifier: TEST_TAB_ID,
          pageLayoutUniversalIdentifier,
          title: 'Insights',
          position: 1000,
          layoutMode: PageLayoutTabLayoutMode.CANVAS,
        },
      ],
    },
  });

const readTabPageLayoutUniversalIdentifier = async () => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT pageLayout."universalIdentifier"
     FROM core."pageLayoutTab" tab
     JOIN core."pageLayout" pageLayout ON pageLayout.id = tab."pageLayoutId"
     WHERE tab."universalIdentifier" = $1`,
    [TEST_TAB_ID],
  );

  return row?.universalIdentifier;
};

describe('Manifest sync should refuse moving a page layout tab to another page layout', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Page Layout Tab Reparent App',
      description: 'App for testing page layout tab reparenting',
      sourcePath: 'test-page-layout-tab-reparent',
    });

    await syncApplication({
      manifest: buildManifest(PERSON_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should keep the tab on its original page layout', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest(COMPANY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(await readTabPageLayoutUniversalIdentifier()).toBe(
      PERSON_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
    );
  }, 60000);
});
