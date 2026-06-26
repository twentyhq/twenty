import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

const ARM_FIELD_ID = uuidv4();
const LEG_FIELD_ID = uuidv4();
const HEAD_FIELD_ID = uuidv4();
const TAIL_FIELD_ID = uuidv4();

const BODY_VIEW_ID = uuidv4();
const ARM_VIEW_FIELD_ID = uuidv4();
const HEAD_VIEW_FIELD_ID = uuidv4();
const TAIL_VIEW_FIELD_ID = uuidv4();

const INITIAL_ANY_FIELD_FILTER_VALUE = 'arm';
const UPDATED_ANY_FIELD_FILTER_VALUE = 'tail';

const HUMAN_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'human',
  namePlural: 'humans',
  labelSingular: 'Human',
  labelPlural: 'Humans',
  description: 'A human being',
  icon: 'IconUser',
  additionalFields: [
    {
      universalIdentifier: ARM_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'arm',
      label: 'Arm',
    },
    {
      universalIdentifier: LEG_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'leg',
      label: 'Leg',
    },
    {
      universalIdentifier: HEAD_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'head',
      label: 'Head',
    },
  ],
});

const buildInitialManifest = (): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [HUMAN_OBJECT],
      views: [
        {
          universalIdentifier: BODY_VIEW_ID,
          name: 'Body',
          objectUniversalIdentifier: HUMAN_OBJECT.universalIdentifier,
          anyFieldFilterValue: INITIAL_ANY_FIELD_FILTER_VALUE,
          fields: [
            {
              universalIdentifier: ARM_VIEW_FIELD_ID,
              fieldMetadataUniversalIdentifier: ARM_FIELD_ID,
              position: 0,
            },
            {
              universalIdentifier: HEAD_VIEW_FIELD_ID,
              fieldMetadataUniversalIdentifier: HEAD_FIELD_ID,
              position: 1,
            },
          ],
        },
      ],
    },
  });

const buildResyncManifest = (): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [
        {
          ...HUMAN_OBJECT,
          fields: [
            ...HUMAN_OBJECT.fields,
            {
              universalIdentifier: TAIL_FIELD_ID,
              type: FieldMetadataType.TEXT,
              name: 'tail',
              label: 'Tail',
            },
          ],
        },
      ],
      views: [
        {
          universalIdentifier: BODY_VIEW_ID,
          name: 'Body',
          objectUniversalIdentifier: HUMAN_OBJECT.universalIdentifier,
          anyFieldFilterValue: UPDATED_ANY_FIELD_FILTER_VALUE,
          fields: [
            {
              universalIdentifier: ARM_VIEW_FIELD_ID,
              fieldMetadataUniversalIdentifier: ARM_FIELD_ID,
              position: 0,
            },
            {
              universalIdentifier: HEAD_VIEW_FIELD_ID,
              fieldMetadataUniversalIdentifier: HEAD_FIELD_ID,
              position: 1,
            },
            {
              universalIdentifier: TAIL_VIEW_FIELD_ID,
              fieldMetadataUniversalIdentifier: TAIL_FIELD_ID,
              position: 2,
            },
          ],
        },
      ],
    },
  });

const findHumanObject = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  return objects.find(
    (objectMetadata) =>
      objectMetadata.universalIdentifier === HUMAN_OBJECT.universalIdentifier,
  );
};

describe('Successful re-sync of an application whose app-owned view references a cross-app-owned view field', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Human Application',
      description: 'App for testing view field ownership conflicts on re-sync',
      sourcePath: 'test-api-owned-view-field',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should re-sync successfully when the app-owned Body view carries a view field owned by another application', async () => {
    await syncApplication({
      manifest: buildInitialManifest(),
      expectToFail: false,
    });

    const humanObject = await findHumanObject();

    expect(humanObject).toBeDefined();

    const legField = humanObject?.fieldsList.find(
      (field) => field.name === 'leg',
    );

    expect(legField).toBeDefined();

    const { data: viewsData } = await findViews({
      objectMetadataId: humanObject?.id,
      expectToFail: false,
    });

    const bodyView = viewsData?.getViews.find((view) => view.name === 'Body');

    expect(bodyView).toBeDefined();
    expect(bodyView?.anyFieldFilterValue).toBe(INITIAL_ANY_FIELD_FILTER_VALUE);

    const { data: createViewFieldData } = await createOneViewField({
      input: {
        fieldMetadataId: legField?.id ?? '',
        viewId: bodyView?.id ?? '',
        position: 2,
      },
      expectToFail: false,
    });

    const legViewFieldId = createViewFieldData?.createViewField.id;

    expect(isDefined(legViewFieldId)).toBe(true);

    const { errors } = await syncApplication({
      manifest: buildResyncManifest(),
      expectToFail: false,
    });

    expect(isDefined(errors)).toBe(false);

    const humanObjectAfterResync = await findHumanObject();
    const tailField = humanObjectAfterResync?.fieldsList.find(
      (field) => field.name === 'tail',
    );

    expect(tailField).toBeDefined();

    const { data: viewsDataAfterResync } = await findViews({
      objectMetadataId: humanObjectAfterResync?.id,
      expectToFail: false,
    });

    const bodyViewAfterResync = viewsDataAfterResync?.getViews.find(
      (view) => view.name === 'Body',
    );

    expect(bodyViewAfterResync?.anyFieldFilterValue).toBe(
      UPDATED_ANY_FIELD_FILTER_VALUE,
    );

    const { data: viewFieldsData } = await findViewFields({
      viewId: bodyView?.id ?? '',
      expectToFail: false,
    });

    const viewFieldFieldMetadataIds = (viewFieldsData?.getViewFields ?? []).map(
      (viewField) => viewField.fieldMetadataId,
    );

    expect(viewFieldFieldMetadataIds).toEqual(
      expect.arrayContaining([legField?.id, tailField?.id]),
    );

    const legViewFieldStillPresent = (viewFieldsData?.getViewFields ?? []).some(
      (viewField) => viewField.id === legViewFieldId,
    );

    expect(legViewFieldStillPresent).toBe(true);
  }, 120000);
});
