import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  getViewFieldUniversalIdentifier,
  type Manifest,
  type StandaloneViewFieldManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();

const ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.views.allPeople.universalIdentifier;

// For a field the app owns this equals getSystemViewFieldUniversalIdentifier,
// the identifier of the column the engine provisions when the field is created
const ENGINE_VIEW_FIELD_UNIVERSAL_IDENTIFIER = getViewFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_ID,
  viewUniversalIdentifier: ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
});

const buildManifest = (
  viewFields: StandaloneViewFieldManifest[] = [],
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      fields: [
        {
          universalIdentifier: TEST_FIELD_ID,
          type: FieldMetadataType.TEXT,
          name: 'engineViewFieldTarget',
          label: 'Engine View Field Target',
          icon: 'IconStar',
          objectUniversalIdentifier:
            STANDARD_OBJECTS.person.universalIdentifier,
        },
      ],
      viewFields,
    },
  });

const readEngineViewField = async () => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "isSystemSideEffect", position, size
     FROM core."viewField"
     WHERE "universalIdentifier" = $1`,
    [ENGINE_VIEW_FIELD_UNIVERSAL_IDENTIFIER],
  );

  return row;
};

describe('Manifest sync of a view field declared under the identifier the engine provisioned it with', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Engine View Field Claim App',
      description: 'App for testing claims on engine-provisioned view fields',
      sourcePath: 'test-engine-view-field-claim',
    });

    await syncApplication({ manifest: buildManifest(), expectToFail: false });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should apply the declared layout and keep the view field engine-owned', async () => {
    await syncApplication({
      manifest: buildManifest([
        {
          universalIdentifier: ENGINE_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
          position: 0.5,
          size: 321,
          isVisible: true,
        },
      ]),
      expectToFail: false,
    });

    expect(await readEngineViewField()).toEqual({
      isSystemSideEffect: true,
      position: 0.5,
      size: 321,
    });
  }, 60000);

  it('should keep the view field once the manifest stops declaring it', async () => {
    await syncApplication({ manifest: buildManifest(), expectToFail: false });

    expect(await readEngineViewField()).toEqual({
      isSystemSideEffect: true,
      position: 0.5,
      size: 321,
    });
  }, 60000);
});
