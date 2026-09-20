import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type ObjectManifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const APP_A_ID = uuidv4();
const APP_A_ROLE_ID = uuidv4();
const APP_A_OBJECT_ID = uuidv4();
const APP_A_NAME_FIELD_ID = uuidv4();

const APP_B_ID = uuidv4();
const APP_B_ROLE_ID = uuidv4();
const APP_B_OBJECT_ID = uuidv4();
const WIDGET_NAME_FIELD_ID = uuidv4();
const WIDGET_TARGET_RELATION_FIELD_ID = uuidv4();
// Not actually installed on App A's object: the exclusion this test proves
// happens before any inverse-field lookup is reached (see
// validateMorphOrRelationFlatFieldMetadata, which returns as soon as the
// relation's target OBJECT is unresolved, never checking the target field).
const APP_A_OBJECT_BACK_RELATION_FIELD_ID = uuidv4();

const APP_A_NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: APP_A_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

const WIDGET_NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: WIDGET_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

describe('Sync application should fail when a RELATION field targets another app custom object', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_A_ID,
      name: 'App A',
      description: 'App owning the target object',
      sourcePath: 'test-cross-app-relation-target-app-a',
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_B_ID,
      name: 'App B',
      description: 'App whose object relates to App A object',
      sourcePath: 'test-cross-app-relation-target-app-b',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_A_ID,
        roleId: APP_A_ROLE_ID,
        overrides: {
          // Role labels are unique workspace-wide (PG constraint), so each
          // app must ship a distinct label
          roles: [
            {
              universalIdentifier: APP_A_ROLE_ID,
              label: 'App A Role',
              description: 'Role owned by App A',
            },
          ],
          objects: [
            buildDefaultObjectManifest({
              applicationUniversalIdentifier: APP_A_ID,
              universalIdentifier: APP_A_OBJECT_ID,
              nameSingular: 'targetThing',
              namePlural: 'targetThings',
              labelSingular: 'Target Thing',
              labelPlural: 'Target Things',
              labelIdentifierFieldMetadataUniversalIdentifier:
                APP_A_NAME_FIELD_ID,
              additionalFields: [APP_A_NAME_FIELD],
            }),
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

  it("fails to sync App B when its RELATION field targets App A's custom object", async () => {
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
          objects: [
            buildDefaultObjectManifest({
              applicationUniversalIdentifier: APP_B_ID,
              universalIdentifier: APP_B_OBJECT_ID,
              nameSingular: 'widget',
              namePlural: 'widgets',
              labelSingular: 'Widget',
              labelPlural: 'Widgets',
              additionalFields: [
                WIDGET_NAME_FIELD,
                {
                  universalIdentifier: WIDGET_TARGET_RELATION_FIELD_ID,
                  type: FieldMetadataType.RELATION,
                  name: 'target',
                  label: 'Target',
                  relationTargetFieldMetadataUniversalIdentifier:
                    APP_A_OBJECT_BACK_RELATION_FIELD_ID,
                  // Cross-app: owned by App A, not App B — this is the
                  // pointer that reproduces the bug.
                  relationTargetObjectMetadataUniversalIdentifier:
                    APP_A_OBJECT_ID,
                  universalSettings: {
                    relationType: RelationType.MANY_TO_ONE,
                    joinColumnName: 'targetId',
                    onDelete: RelationOnDeleteAction.SET_NULL,
                  },
                },
              ],
            }),
          ],
        },
      }),
      expectToFail: true,
    });

    // TODO(DIAG-06): tighten to the exact confirmed error message once Task 3 captures evidence
    expect(isDefined(errors)).toBe(true);
    expect(errors!.length).toBeGreaterThan(0);
  }, 60000);
});
