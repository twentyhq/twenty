import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import type { FieldManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const APP_A_ID = uuidv4();
const APP_A_ROLE_ID = uuidv4();
const APP_A_VIEW_ID = uuidv4();

const APP_B_ID = uuidv4();
const APP_B_ROLE_ID = uuidv4();
const APP_B_FIELD_ID = uuidv4();
const APP_B_VIEW_FIELD_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const APP_A_VIEW_NAME = 'App A View';

const appBPersonField: FieldManifest = {
  universalIdentifier: APP_B_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'appBContributedColumn',
  label: 'App B Contributed Column',
  description: 'Custom field App B owns on the standard Person object',
  icon: 'IconStar',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

describe('Sync application should succeed when extending another app view with a view field', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_A_ID,
      name: 'App A',
      description: 'App owning the target view',
      sourcePath: 'test-cross-app-view-field-app-a',
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_B_ID,
      name: 'App B',
      description: 'App extending App A view with a view field',
      sourcePath: 'test-cross-app-view-field-app-b',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_A_ID,
        roleId: APP_A_ROLE_ID,
        overrides: {
          // Role labels are unique workspace-wide (PG constraint), so each app
          // must ship a distinct label
          roles: [
            {
              universalIdentifier: APP_A_ROLE_ID,
              label: 'App A Role',
              description: 'Role owned by App A',
            },
          ],
          views: [
            {
              universalIdentifier: APP_A_VIEW_ID,
              name: APP_A_VIEW_NAME,
              objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
              type: ViewType.TABLE,
              icon: 'IconList',
            },
          ],
        },
      }),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_B_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_A_ID,
    });
  });

  it('accepts a standalone view field from App B targeting an App A view', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_B_ID,
        roleId: APP_B_ROLE_ID,
        overrides: {
          roles: [
            {
              universalIdentifier: APP_B_ROLE_ID,
              label: 'App B Role',
              description: 'Role owned by App B',
            },
          ],
          fields: [appBPersonField],
          viewFields: [
            {
              universalIdentifier: APP_B_VIEW_FIELD_ID,
              viewUniversalIdentifier: APP_A_VIEW_ID,
              fieldMetadataUniversalIdentifier: APP_B_FIELD_ID,
              position: 0,
              isVisible: true,
              size: 150,
            },
          ],
        },
      }),
      expectToFail: false,
    });

    expect(isDefined(errors)).toBe(false);

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const personObject = objects.find(
      (objectMetadata) =>
        objectMetadata.universalIdentifier ===
        PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
    );

    expect(personObject).toBeDefined();

    const appBField = personObject?.fieldsList.find(
      (field) => field.name === appBPersonField.name,
    );

    expect(appBField).toBeDefined();

    const { data: viewsData } = await findViews({
      objectMetadataId: personObject?.id,
      expectToFail: false,
    });

    const appAView = viewsData?.getViews.find(
      (view) => view.name === APP_A_VIEW_NAME,
    );

    expect(appAView).toBeDefined();

    const { data: viewFieldsData } = await findViewFields({
      viewId: appAView?.id ?? '',
      expectToFail: false,
    });

    const appBViewField = (viewFieldsData?.getViewFields ?? []).find(
      (viewField) => viewField.fieldMetadataId === appBField?.id,
    );

    expect(appBViewField).toBeDefined();
  }, 60000);
});
