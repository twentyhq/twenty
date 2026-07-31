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
const TEST_FIELD_ID = uuidv4();
const TEST_VIEW_FIELD_ID = uuidv4();
const TEST_SECOND_VIEW_FIELD_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;
const PERSON_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.views.personRecordPageFields.universalIdentifier;
const PERSON_RECORD_PAGE_GENERAL_GROUP_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.views.personRecordPageFields.viewFieldGroups.general
    .universalIdentifier;

const CUSTOM_FIELD_NAME = 'integrationContributedColumn';

const personFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: CUSTOM_FIELD_NAME,
  label: 'Integration Contributed Column',
  description: 'Custom field contributed to the standard Person object',
  icon: 'IconStar',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'fields' | 'viewFields'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

describe('Failing manifest update - standalone view fields on existing views', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing standalone view field manifest updates',
      sourcePath: 'test-manifest-update-view-field',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('rejects two standalone view fields targeting the same field on the same view', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        fields: [personFieldManifest],
        viewFields: [
          {
            universalIdentifier: TEST_VIEW_FIELD_ID,
            viewUniversalIdentifier:
              PERSON_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
            viewFieldGroupUniversalIdentifier:
              PERSON_RECORD_PAGE_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
            position: 10,
            isVisible: true,
          },
          {
            universalIdentifier: TEST_SECOND_VIEW_FIELD_ID,
            viewUniversalIdentifier:
              PERSON_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
            viewFieldGroupUniversalIdentifier:
              PERSON_RECORD_PAGE_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
            position: 11,
            isVisible: true,
          },
        ],
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('rejects a standalone view field whose target view does not exist', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        fields: [personFieldManifest],
        viewFields: [
          {
            universalIdentifier: TEST_VIEW_FIELD_ID,
            viewUniversalIdentifier: uuidv4(),
            fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
            position: 10,
            isVisible: true,
          },
        ],
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
