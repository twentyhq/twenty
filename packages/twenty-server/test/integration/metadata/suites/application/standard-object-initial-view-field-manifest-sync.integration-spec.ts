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
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const personFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'integrationInitialViewColumn',
  label: 'Integration Initial View Column',
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

  if (!isDefined(person)) {
    throw new Error('Standard Person object not found in workspace');
  }

  return person;
};

const findInitialViewId = async (personObjectId: string) => {
  const { data } = await findViews({
    objectMetadataId: personObjectId,
    gqlFields: 'id key type name',
    expectToFail: false,
  });

  const initialView = data?.getViews.find(
    (view) =>
      !isDefined(view.key) &&
      view.type === ViewType.TABLE &&
      view.name === 'All People',
  );

  if (!isDefined(initialView)) {
    throw new Error('User-owned initial view not found for Person');
  }

  return initialView.id;
};

const findInitialViewFields = async (initialViewId: string) => {
  const { data } = await findViewFields({
    viewId: initialViewId,
    gqlFields: VIEW_FIELD_GQL_FIELDS,
    expectToFail: false,
  });

  return data?.getViewFields ?? [];
};

describe('Manifest sync - engine-emitted initial view field for an app field on a standard object', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing engine-emitted initial view fields',
      sourcePath: 'test-standard-object-initial-view-field-manifest-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('shows the app field on the view users land on, appended after its columns', async () => {
    const person = await findPersonObject();
    const initialViewId = await findInitialViewId(person.id);

    const initialViewFieldsBeforeSync =
      await findInitialViewFields(initialViewId);
    const highestExistingPosition = Math.max(
      ...initialViewFieldsBeforeSync.map((viewField) => viewField.position),
    );

    await syncApplication({
      manifest: buildManifest({ fields: [personFieldManifest] }),
      expectToFail: false,
    });

    const customField = (await findPersonObject()).fieldsList.find(
      (field) => field.universalIdentifier === TEST_FIELD_ID,
    );

    expect(customField).toBeDefined();

    const emittedInitialViewField = (
      await findInitialViewFields(initialViewId)
    ).find((viewField) => viewField.fieldMetadataId === customField?.id);

    expect(emittedInitialViewField).toBeDefined();
    expect(emittedInitialViewField?.isVisible).toBe(true);
    expect(emittedInitialViewField?.position).toBeGreaterThan(
      highestExistingPosition,
    );
    expect(emittedInitialViewField?.applicationId).toBe(
      customField?.applicationId,
    );
    expect(emittedInitialViewField?.isSystemSideEffect).toBe(true);
  }, 60000);

  it('removes the app field from the initial view on uninstall and leaves its other columns', async () => {
    const person = await findPersonObject();
    const initialViewId = await findInitialViewId(person.id);
    const initialViewFieldIdsBeforeSync = (
      await findInitialViewFields(initialViewId)
    ).map((viewField) => viewField.id);

    await syncApplication({
      manifest: buildManifest({ fields: [personFieldManifest] }),
      expectToFail: false,
    });

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    const initialViewFieldIdsAfterUninstall = (
      await findInitialViewFields(initialViewId)
    ).map((viewField) => viewField.id);

    expect([...initialViewFieldIdsAfterUninstall].sort()).toEqual(
      [...initialViewFieldIdsBeforeSync].sort(),
    );
  }, 60000);
});
