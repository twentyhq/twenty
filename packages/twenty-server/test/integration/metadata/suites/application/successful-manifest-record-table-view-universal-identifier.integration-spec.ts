import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  ViewType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_VIEW_ID = uuidv4();
const TEST_LAYOUT_ID = uuidv4();
const TEST_TAB_ID = uuidv4();
const TEST_WIDGET_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'views' | 'pageLayouts'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const buildManifestWithRecordTableDashboard = () =>
  buildManifest({
    views: [
      {
        universalIdentifier: TEST_VIEW_ID,
        name: 'RT test view',
        objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
        type: ViewType.TABLE,
        icon: 'IconList',
        position: 0,
      },
    ],
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
                objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 6 },
                configuration: {
                  configurationType: 'RECORD_TABLE',
                  viewUniversalIdentifier: TEST_VIEW_ID,
                },
              },
            ],
          },
        ],
      },
    ],
  });

describe('Manifest sync - RECORD_TABLE widget view universal identifier', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description:
        'App for testing RECORD_TABLE widget viewUniversalIdentifier resolution',
      sourcePath: 'test-manifest-record-table-view-universal-identifier',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('resolves a dashboard RECORD_TABLE widget viewUniversalIdentifier to the concrete view id', async () => {
    const { data, errors } = await syncApplication({
      manifest: buildManifestWithRecordTableDashboard(),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.syncApplication).toBeDefined();

    const [viewRow] = await globalThis.testDataSource.query(
      `SELECT id FROM core."view" WHERE "universalIdentifier" = $1`,
      [TEST_VIEW_ID],
    );

    expect(viewRow?.id).toBeDefined();
    expect(viewRow.id).not.toBe(TEST_VIEW_ID);

    const [widgetRow] = await globalThis.testDataSource.query(
      `SELECT configuration FROM core."pageLayoutWidget" WHERE "universalIdentifier" = $1`,
      [TEST_WIDGET_ID],
    );

    expect(widgetRow?.configuration).toEqual({
      configurationType: 'RECORD_TABLE',
      viewId: viewRow.id,
    });
  }, 60000);
});
