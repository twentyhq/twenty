import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type FieldManifest,
  type Manifest,
  type ObjectManifest,
  type StandalonePageLayoutWidgetManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  ViewType,
} from 'twenty-shared/types';

const TEST_APP_ID = 'e7a1c2d3-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'e7a1c2d3-0002-4000-a000-000000000002';
const TEST_OBJECT_ID = 'e7a1c2d3-0003-4000-a000-000000000003';
const TEST_VIEW_ID = 'e7a1c2d3-0004-4000-a000-000000000004';
const TEST_WIDGET_ID = 'e7a1c2d3-0005-4000-a000-000000000005';
const NAME_FIELD_ID = 'e7a1c2d3-0100-4000-a000-000000000001';
const INVALID_FIELD_ID = 'e7a1c2d3-0100-4000-a000-000000000002';

type ManifestPatch<TManifest> = Partial<Record<keyof TManifest, unknown>>;

const buildObject = (additionalFields: ManifestPatch<FieldManifest>[] = []) =>
  ({
    universalIdentifier: TEST_OBJECT_ID,
    nameSingular: 'enumSubject',
    namePlural: 'enumSubjects',
    labelSingular: 'Enum Subject',
    labelPlural: 'Enum Subjects',
    labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
    fields: [
      {
        universalIdentifier: NAME_FIELD_ID,
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
      },
      ...additionalFields,
    ],
  }) as ObjectManifest;

const buildView = (patch: ManifestPatch<ViewManifest> = {}) =>
  ({
    universalIdentifier: TEST_VIEW_ID,
    name: 'Enum Subjects',
    objectUniversalIdentifier: TEST_OBJECT_ID,
    type: ViewType.TABLE,
    ...patch,
  }) as ViewManifest;

const buildStandaloneWidget = (
  patch: ManifestPatch<StandalonePageLayoutWidgetManifest>,
) =>
  ({
    universalIdentifier: TEST_WIDGET_ID,
    pageLayoutTabUniversalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
        .universalIdentifier,
    title: 'Activity',
    type: 'TIMELINE',
    position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
    configuration: { configurationType: 'TIMELINE' },
    ...patch,
  }) as StandalonePageLayoutWidgetManifest;

const buildManifest = (overrides: Partial<Manifest>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

type TestContext = {
  overrides: Partial<Manifest>;
};

const failingEnumPropertyCreationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when a view type is unknown',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ type: 'GRID' })],
        },
      },
    },
    {
      title: 'when a field type is inherited from Object.prototype',
      context: {
        overrides: {
          objects: [
            buildObject([
              {
                universalIdentifier: INVALID_FIELD_ID,
                name: 'invalidTypeField',
                label: 'Invalid Type Field',
                type: 'constructor',
              },
            ]),
          ],
        },
      },
    },
    {
      title:
        'when a page layout widget type is inherited from Object.prototype',
      context: {
        overrides: {
          pageLayoutWidgets: [buildStandaloneWidget({ type: 'constructor' })],
        },
      },
    },
  ];

describe('Sync application should fail on invalid enum values at creation', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid Enum Creation App',
      description: 'App for testing enum validation on manifest creation',
      sourcePath: 'test-invalid-enum-creation',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingEnumPropertyCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildManifest(context.overrides),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );
});

describe('Sync application should fail on invalid enum values at update', () => {
  const validOverrides = { objects: [buildObject()], views: [buildView()] };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid Enum Update App',
      description: 'App for testing enum validation on manifest update',
      sourcePath: 'test-invalid-enum-update',
    });

    const { errors } = await syncApplication({
      manifest: buildManifest(validOverrides),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('when a view type is updated to an unknown value', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        ...validOverrides,
        views: [buildView({ type: 'BOARD' })],
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should still sync the valid manifest after the rejected update', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest(validOverrides),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  }, 60000);
});
