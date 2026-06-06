import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import type { FieldManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
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

const appBPersonField: FieldManifest = {
  universalIdentifier: APP_B_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'appBContributedColumn',
  label: 'App B Contributed Column',
  description: 'Custom field App B owns on the standard Person object',
  icon: 'IconStar',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

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
          views: [
            {
              universalIdentifier: APP_A_VIEW_ID,
              name: 'App A View',
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

  it('rejects a standalone view field from App B targeting an App A view', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_B_ID,
        roleId: APP_B_ROLE_ID,
        overrides: {
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
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBeGreaterThan(0);

    const [error] = errors;

    expect(error.extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(error.extensions.summary.totalErrors).toBe(1);
    expect(error.extensions.summary.viewField).toBe(1);
    expect(error.extensions.message).toMatch(/viewField/);
  }, 60000);
});
