import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import {
  getSystemViewFieldUniversalIdentifier,
  type FieldManifest,
  type Manifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

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

const buildManifest = (overrides?: Partial<Pick<Manifest, 'fields'>>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const findPersonObject = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  const person = objects.find(
    (object) =>
      object.universalIdentifier === PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  );

  if (!person) {
    throw new Error('Standard Person object not found in workspace');
  }

  return person;
};

const findIndexViewId = async (personObjectId: string) => {
  const { data } = await findViews({
    objectMetadataId: personObjectId,
    gqlFields: 'id key type',
    expectToFail: false,
  });

  const indexView = data?.getViews.find((view) => view.key === ViewKey.INDEX);

  if (!indexView) {
    throw new Error('Standard INDEX view not found for Person');
  }

  return indexView.id;
};

// Coverage of fieldIndexViewFieldOnCreate through the manifest path on a
// standard object: the own-object variants live in
// same-batch-relation-index-view-field-manifest-sync.
describe('Manifest sync - engine-emitted INDEX view field for an app field on a standard object', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing engine-emitted INDEX view fields',
      sourcePath: 'test-standard-object-index-view-field-manifest-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('emits a visible INDEX view field appended after the standard columns', async () => {
    const person = await findPersonObject();
    const indexViewId = await findIndexViewId(person.id);

    const { data: viewFieldsBeforeSyncData } = await findViewFields({
      viewId: indexViewId,
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      expectToFail: false,
    });
    const viewFieldsBeforeSync = viewFieldsBeforeSyncData?.getViewFields ?? [];
    const highestExistingActivePosition = Math.max(
      ...viewFieldsBeforeSync.map((viewField) => viewField.position),
    );

    await syncApplication({
      manifest: buildManifest({ fields: [personFieldManifest] }),
      expectToFail: false,
    });

    const personAfterSync = await findPersonObject();
    const customField = personAfterSync.fieldsList.find(
      (field) => field.universalIdentifier === TEST_FIELD_ID,
    );

    expect(customField).toBeDefined();

    const { data: viewFieldsAfterSyncData } = await findViewFields({
      viewId: indexViewId,
      gqlFields: VIEW_FIELD_GQL_FIELDS,
      expectToFail: false,
    });

    const emittedIndexViewField = (
      viewFieldsAfterSyncData?.getViewFields ?? []
    ).find((viewField) => viewField.fieldMetadataId === customField?.id);

    expect(emittedIndexViewField).toBeDefined();
    expect(emittedIndexViewField?.isVisible).toBe(true);
    expect(emittedIndexViewField?.position).toBeGreaterThan(
      highestExistingActivePosition,
    );

    // Engine-owned but attributed to the contributing app: the identifier is
    // keyed on the displayed field's application.
    expect(emittedIndexViewField?.universalIdentifier).toBe(
      getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier: TEST_APP_ID,
        viewUniversalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
        fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
      }),
    );
    expect(emittedIndexViewField?.applicationId).toBe(
      customField?.applicationId,
    );
    expect(emittedIndexViewField?.isSystemSideEffect).toBe(true);
  }, 60000);
});
