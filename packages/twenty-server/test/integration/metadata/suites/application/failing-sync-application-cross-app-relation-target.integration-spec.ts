import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type FieldManifest,
  type ObjectManifest,
} from 'twenty-shared/application';
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
// App B's manifest also declares this inverse field directly on App A's
// (pre-existing) object, in the same batch as the forward field — this
// mirrors how same-app bidirectional relations are declared together, and
// is what actually exercises the cross-app exclusion: App B's app-scoped
// flatObjectMetadataMaps has no way to resolve App A's object at all.
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

// Declared as a top-level manifest field (not nested under App A's object)
// because it targets an object owned by a different app, mirroring how
// successful-sync-application-cross-app-view-field.integration-spec.ts lets
// App B contribute a field to an object it does not own.
const APP_A_BACK_RELATION_FIELD: FieldManifest = {
  universalIdentifier: APP_A_OBJECT_BACK_RELATION_FIELD_ID,
  type: FieldMetadataType.RELATION,
  name: 'widgets',
  label: 'Widgets',
  objectUniversalIdentifier: APP_A_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    WIDGET_TARGET_RELATION_FIELD_ID,
  relationTargetObjectMetadataUniversalIdentifier: APP_B_OBJECT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
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
              nameSingular: 'crossAppTarget',
              namePlural: 'crossAppTargets',
              labelSingular: 'Cross App Target',
              labelPlural: 'Cross App Targets',
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
  }, 60000);

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
          fields: [APP_A_BACK_RELATION_FIELD],
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

    // Confirmed via captured runtime evidence (06-DIAGNOSIS.md): the throw
    // site is ObjectMetadataWithRelationsGqlObjectTypeGenerator.generateFields
    // (GraphQL-schema-build time), not the field-type validator — the
    // validator's own flatObjectMetadataMaps resolves the cross-app target
    // fine, but the app-scoped schema/SDK-generation map does not.
    expect(isDefined(errors)).toBe(true);
    expect(errors!.length).toBeGreaterThan(0);
    expect(JSON.stringify(errors)).toMatch(
      /has no relation target object metadata/,
    );
  }, 60000);
});
