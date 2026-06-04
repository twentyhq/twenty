import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import type { FieldManifest } from 'twenty-shared/application';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const TEST_VIEW_FIELD_ID = uuidv4();
const TEST_SECOND_VIEW_FIELD_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;
const ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.views.allPeople.universalIdentifier;

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

const findAllPeopleViewId = async (personObjectId: string) => {
  const { data } = await findViews({
    objectMetadataId: personObjectId,
    gqlFields: 'id key name',
    expectToFail: false,
  });

  const allPeopleView = data?.getViews.find(
    (view) => view.key === ViewKey.INDEX,
  );

  if (!allPeopleView) {
    throw new Error('Standard allPeople (INDEX) view not found for Person');
  }

  return allPeopleView.id;
};

const findAllPeopleViewFields = async (viewId: string) => {
  const { data } = await findViewFields({
    viewId,
    gqlFields: VIEW_FIELD_GQL_FIELDS,
    expectToFail: false,
  });

  return data?.getViewFields ?? [];
};

describe('Manifest update - standalone view fields on existing views', () => {
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

  it('attaches a standalone view field to the standard allPeople view without recreating the view', async () => {
    const person = await findPersonObject();
    const allPeopleViewId = await findAllPeopleViewId(person.id);
    const standardViewFields = await findAllPeopleViewFields(allPeopleViewId);
    const standardViewFieldIds = standardViewFields.map(
      (viewField) => viewField.id,
    );

    expect(standardViewFields.length).toBeGreaterThan(0);

    const { data, errors } = await syncApplication({
      manifest: buildManifest({
        fields: [personFieldManifest],
        viewFields: [
          {
            universalIdentifier: TEST_VIEW_FIELD_ID,
            viewUniversalIdentifier: ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
            position: 10,
            isVisible: true,
            size: 150,
          },
        ],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.syncApplication).toBeDefined();

    const personAfterSync = await findPersonObject();
    const customField = personAfterSync.fieldsList.find(
      (field) => field.universalIdentifier === TEST_FIELD_ID,
    );

    expect(customField).toBeDefined();

    const viewFieldsAfterSync = await findAllPeopleViewFields(allPeopleViewId);

    const contributedViewField = viewFieldsAfterSync.find(
      (viewField) => viewField.fieldMetadataId === customField?.id,
    );

    expect(contributedViewField).toBeDefined();
    expect(contributedViewField).toMatchObject({
      viewId: allPeopleViewId,
      position: 10,
      isVisible: true,
      size: 150,
    });

    expect(viewFieldsAfterSync.length).toBe(standardViewFields.length + 1);
    for (const standardViewFieldId of standardViewFieldIds) {
      expect(
        viewFieldsAfterSync.some(
          (viewField) => viewField.id === standardViewFieldId,
        ),
      ).toBe(true);
    }
  }, 60000);

  it('removes the contributed view field on uninstall while keeping the standard view intact', async () => {
    const person = await findPersonObject();
    const allPeopleViewId = await findAllPeopleViewId(person.id);
    const standardViewFields = await findAllPeopleViewFields(allPeopleViewId);
    const standardViewFieldIds = standardViewFields.map(
      (viewField) => viewField.id,
    );

    await syncApplication({
      manifest: buildManifest({
        fields: [personFieldManifest],
        viewFields: [
          {
            universalIdentifier: TEST_VIEW_FIELD_ID,
            viewUniversalIdentifier: ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
            position: 10,
            isVisible: true,
            size: 150,
          },
        ],
      }),
      expectToFail: false,
    });

    const personAfterSync = await findPersonObject();
    const customFieldId = personAfterSync.fieldsList.find(
      (field) => field.universalIdentifier === TEST_FIELD_ID,
    )?.id;

    expect(customFieldId).toBeDefined();
    expect(
      (await findAllPeopleViewFields(allPeopleViewId)).some(
        (viewField) => viewField.fieldMetadataId === customFieldId,
      ),
    ).toBe(true);

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    const allPeopleViewIdAfterUninstall = await findAllPeopleViewId(person.id);

    expect(allPeopleViewIdAfterUninstall).toBe(allPeopleViewId);

    const viewFieldsAfterUninstall =
      await findAllPeopleViewFields(allPeopleViewId);

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

  it('rejects two standalone view fields targeting the same field on the same view', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        fields: [personFieldManifest],
        viewFields: [
          {
            universalIdentifier: TEST_VIEW_FIELD_ID,
            viewUniversalIdentifier: ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
            position: 10,
            isVisible: true,
          },
          {
            universalIdentifier: TEST_SECOND_VIEW_FIELD_ID,
            viewUniversalIdentifier: ALL_PEOPLE_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
            position: 11,
            isVisible: true,
          },
        ],
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');
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

    expect(errors).toBeDefined();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');
  }, 60000);
});
