import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIRST_FIELD_ID = uuidv4();
const TEST_SECOND_FIELD_ID = uuidv4();
const TEST_VIEW_ID = uuidv4();
const TEST_VIEW_FIELD_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const buildPersonTextField = (
  universalIdentifier: string,
  name: string,
): FieldManifest => ({
  universalIdentifier,
  type: FieldMetadataType.TEXT,
  name,
  label: name,
  icon: 'IconStar',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
});

const buildManifest = (fieldMetadataUniversalIdentifier: string): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      fields: [
        buildPersonTextField(TEST_FIRST_FIELD_ID, 'retargetFirstField'),
        buildPersonTextField(TEST_SECOND_FIELD_ID, 'retargetSecondField'),
      ],
      views: [
        {
          universalIdentifier: TEST_VIEW_ID,
          name: 'Retarget view',
          objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
          icon: 'IconList',
          position: 10,
          fields: [
            {
              universalIdentifier: TEST_VIEW_FIELD_ID,
              fieldMetadataUniversalIdentifier,
              position: 0,
              isVisible: true,
              size: 200,
            },
          ],
        },
      ],
    },
  });

const readViewFieldTargetUniversalIdentifier = async () => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT field."universalIdentifier"
     FROM core."viewField" viewField
     JOIN core."fieldMetadata" field ON field.id = viewField."fieldMetadataId"
     WHERE viewField."universalIdentifier" = $1`,
    [TEST_VIEW_FIELD_ID],
  );

  return row?.universalIdentifier;
};

describe('Manifest sync should refuse pointing an existing view field at another field', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test View Field Retarget App',
      description: 'App for testing view field retargeting',
      sourcePath: 'test-view-field-retarget',
    });

    await syncApplication({
      manifest: buildManifest(TEST_FIRST_FIELD_ID),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should keep the view field on its original field', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest(TEST_SECOND_FIELD_ID),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(await readViewFieldTargetUniversalIdentifier()).toBe(
      TEST_FIRST_FIELD_ID,
    );
  }, 60000);
});
