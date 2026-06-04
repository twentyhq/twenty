import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const APP_A_ID = uuidv4();
const APP_A_ROLE_ID = uuidv4();
const APP_A_OBJECT_ID = uuidv4();
const APP_A_VIEW_ID = uuidv4();

const APP_B_ID = uuidv4();
const APP_B_ROLE_ID = uuidv4();
const APP_B_OBJECT_ID = uuidv4();
const APP_B_FIELD_ID = uuidv4();
const APP_B_VIEW_FIELD_ID = uuidv4();

const buildAppAObject = () =>
  buildDefaultObjectManifest({
    nameSingular: 'appAResource',
    namePlural: 'appAResources',
    labelSingular: 'App A Resource',
    labelPlural: 'App A Resources',
    universalIdentifier: APP_A_OBJECT_ID,
  });

const buildAppBObject = () =>
  buildDefaultObjectManifest({
    nameSingular: 'appBResource',
    namePlural: 'appBResources',
    labelSingular: 'App B Resource',
    labelPlural: 'App B Resources',
    universalIdentifier: APP_B_OBJECT_ID,
    additionalFields: [
      {
        universalIdentifier: APP_B_FIELD_ID,
        type: FieldMetadataType.TEXT,
        name: 'appBField',
        label: 'App B Field',
      },
    ],
  });

describe('Sync application should fail when creating a view field on a view owned by another app', () => {
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
      description: 'App attempting to add a view field on App A view',
      sourcePath: 'test-cross-app-view-field-app-b',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_A_ID,
        roleId: APP_A_ROLE_ID,
        overrides: {
          objects: [buildAppAObject()],
          views: [
            {
              universalIdentifier: APP_A_VIEW_ID,
              name: 'App A View',
              objectUniversalIdentifier: APP_A_OBJECT_ID,
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

  it('rejects a standalone view field from App B targeting an App A view', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_B_ID,
        roleId: APP_B_ROLE_ID,
        overrides: {
          objects: [buildAppBObject()],
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
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');
  }, 60000);
});
