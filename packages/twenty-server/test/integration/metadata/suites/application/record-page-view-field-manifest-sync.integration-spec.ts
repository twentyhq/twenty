import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
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

const findRecordPageViewId = async (personObjectId: string) => {
  const { data } = await findViews({
    objectMetadataId: personObjectId,
    gqlFields: 'id key name type',
    expectToFail: false,
  });

  const recordPageView = data?.getViews.find(
    (view) => view.type === ViewType.FIELDS_WIDGET,
  );

  if (!recordPageView) {
    throw new Error('Standard record-page view not found for Person');
  }

  return recordPageView.id;
};

const findRecordPageViewFields = async (viewId: string) => {
  const { data } = await findViewFields({
    viewId,
    gqlFields: VIEW_FIELD_GQL_FIELDS,
    expectToFail: false,
  });

  return data?.getViewFields ?? [];
};

describe('Manifest sync - engine-emitted record-page view field for an app field on a standard object', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing engine-emitted record-page view fields',
      sourcePath: 'test-record-page-view-field-manifest-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('emits a record-page view field for the app field without any manifest declaration', async () => {
    const person = await findPersonObject();
    const recordPageViewId = await findRecordPageViewId(person.id);
    const standardViewFields = await findRecordPageViewFields(recordPageViewId);
    const standardViewFieldIds = standardViewFields.map(
      (viewField) => viewField.id,
    );

    expect(standardViewFields.length).toBeGreaterThan(0);

    const { data, errors } = await syncApplication({
      manifest: buildManifest({ fields: [personFieldManifest] }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.syncApplication).toBeDefined();

    const personAfterSync = await findPersonObject();
    const customField = personAfterSync.fieldsList.find(
      (field) => field.universalIdentifier === TEST_FIELD_ID,
    );

    expect(customField).toBeDefined();

    const viewFieldsAfterSync =
      await findRecordPageViewFields(recordPageViewId);

    const emittedViewField = viewFieldsAfterSync.find(
      (viewField) => viewField.fieldMetadataId === customField?.id,
    );

    expect(emittedViewField).toBeDefined();
    expect(emittedViewField?.isVisible).toBe(true);
    expect(emittedViewField?.viewFieldGroupId).not.toBeNull();

    expect(viewFieldsAfterSync.length).toBe(standardViewFields.length + 1);
    for (const standardViewFieldId of standardViewFieldIds) {
      expect(
        viewFieldsAfterSync.some(
          (viewField) => viewField.id === standardViewFieldId,
        ),
      ).toBe(true);
    }
  }, 60000);

  it('removes the emitted view field on uninstall while keeping the standard view intact', async () => {
    const person = await findPersonObject();
    const recordPageViewId = await findRecordPageViewId(person.id);
    const standardViewFields = await findRecordPageViewFields(recordPageViewId);
    const standardViewFieldIds = standardViewFields.map(
      (viewField) => viewField.id,
    );

    await syncApplication({
      manifest: buildManifest({ fields: [personFieldManifest] }),
      expectToFail: false,
    });

    const personAfterSync = await findPersonObject();
    const customFieldId = personAfterSync.fieldsList.find(
      (field) => field.universalIdentifier === TEST_FIELD_ID,
    )?.id;

    expect(customFieldId).toBeDefined();
    expect(
      (await findRecordPageViewFields(recordPageViewId)).some(
        (viewField) => viewField.fieldMetadataId === customFieldId,
      ),
    ).toBe(true);

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    const recordPageViewIdAfterUninstall = await findRecordPageViewId(
      person.id,
    );

    expect(recordPageViewIdAfterUninstall).toBe(recordPageViewId);

    const viewFieldsAfterUninstall =
      await findRecordPageViewFields(recordPageViewId);

    expect(
      viewFieldsAfterUninstall.some(
        (viewField) => viewField.fieldMetadataId === customFieldId,
      ),
    ).toBe(false);
    expect(viewFieldsAfterUninstall.length).toBe(standardViewFields.length);
    for (const standardViewFieldId of standardViewFieldIds) {
      expect(
        viewFieldsAfterUninstall.some(
          (viewField) => viewField.id === standardViewFieldId,
        ),
      ).toBe(true);
    }
  }, 60000);
});
