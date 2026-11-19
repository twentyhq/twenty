import {
  dismissApplicationSuggestedViewFields,
  findApplicationSuggestedViewFields,
} from 'test/integration/metadata/suites/application/utils/application-suggested-view-fields.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type FieldManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const INDEX_VIEW_SUGGESTION_ID = uuidv4();
const RECORD_PAGE_VIEW_SUGGESTION_ID = uuidv4();
const UNKNOWN_VIEW_SUGGESTION_ID = uuidv4();

const personFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'integrationSuggestedColumn',
  label: 'Integration Suggested Column',
  description: 'Custom field contributed to the standard Person object',
  icon: 'IconStar',
  objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
};

const manifest = buildBaseManifest({
  appId: TEST_APP_ID,
  roleId: TEST_ROLE_ID,
  overrides: {
    fields: [personFieldManifest],
    viewFields: [
      {
        universalIdentifier: INDEX_VIEW_SUGGESTION_ID,
        viewUniversalIdentifier:
          STANDARD_OBJECTS.person.views.allPeople.universalIdentifier,
        fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
        position: 0,
        isVisible: true,
      },
      {
        universalIdentifier: RECORD_PAGE_VIEW_SUGGESTION_ID,
        viewUniversalIdentifier:
          STANDARD_OBJECTS.person.views.personRecordPageFields
            .universalIdentifier,
        fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
        position: 1,
        isVisible: true,
      },
      {
        universalIdentifier: UNKNOWN_VIEW_SUGGESTION_ID,
        viewUniversalIdentifier: uuidv4(),
        fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
        position: 2,
        isVisible: true,
      },
    ],
  },
});

const findPersonInitialViewIdAndFieldId = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  const person = objects.find(
    ({ universalIdentifier }) =>
      universalIdentifier === STANDARD_OBJECTS.person.universalIdentifier,
  );

  const { data } = await findViews({
    objectMetadataId: person?.id,
    gqlFields: 'id key type name',
    expectToFail: false,
  });

  const initialView = data?.getViews.find(
    (view) =>
      !isDefined(view.key) &&
      view.type === ViewType.TABLE &&
      view.name === 'All People',
  );

  const fieldId = person?.fieldsList.find(
    ({ universalIdentifier }) => universalIdentifier === TEST_FIELD_ID,
  )?.id;

  if (!isDefined(initialView) || !isDefined(fieldId)) {
    throw new Error('Person initial view or suggested field not found');
  }

  return { initialViewId: initialView.id, fieldId };
};

const countApplicationOwnedViewFieldsOfField = async (fieldId: string) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count
     FROM core."viewField" vf
     JOIN core."application" a ON a.id = vf."applicationId"
     WHERE a."universalIdentifier" = $1
       AND vf."fieldMetadataId" = $2
       AND vf."isSystemSideEffect" = false`,
    [TEST_APP_ID, fieldId],
  );

  return count;
};

describe('Manifest sync - view fields on views the app does not own become suggestions', () => {
  let applicationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App suggesting view fields on standard views',
      sourcePath: 'test-suggested-view-fields',
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const { data } = await findOneApplication({
      input: { universalIdentifier: TEST_APP_ID },
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates no view field on the views the app does not own', async () => {
    const { fieldId } = await findPersonInitialViewIdAndFieldId();

    expect(await countApplicationOwnedViewFieldsOfField(fieldId)).toBe(0);
  }, 60000);

  it('suggests the INDEX view field on the initial view, and nothing for views that already show the field or do not exist', async () => {
    const { initialViewId, fieldId } =
      await findPersonInitialViewIdAndFieldId();

    const suggestedViewFields = await findApplicationSuggestedViewFields({
      applicationId,
    });

    expect(suggestedViewFields).toEqual([
      expect.objectContaining({
        universalIdentifier: INDEX_VIEW_SUGGESTION_ID,
        viewId: initialViewId,
        fieldMetadataId: fieldId,
      }),
    ]);
  }, 60000);

  it('stops suggesting a field once the user dismissed it', async () => {
    await dismissApplicationSuggestedViewFields({
      applicationId,
      universalIdentifiers: [INDEX_VIEW_SUGGESTION_ID],
    });

    expect(await findApplicationSuggestedViewFields({ applicationId })).toEqual(
      [],
    );
  }, 60000);

  it('lets the app be uninstalled once the user added the suggested column', async () => {
    const { initialViewId, fieldId } =
      await findPersonInitialViewIdAndFieldId();

    const { errors } = await createOneViewField({
      input: { viewId: initialViewId, fieldMetadataId: fieldId },
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    const [{ count }] = await globalThis.testDataSource.query(
      `SELECT COUNT(*)::int AS count FROM core."viewField" WHERE "fieldMetadataId" = $1 AND "deletedAt" IS NULL`,
      [fieldId],
    );

    expect(count).toBe(0);
  }, 60000);
});
