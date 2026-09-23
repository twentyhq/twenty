import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import {
  type FieldManifest,
  type Manifest,
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
const APP_A_TARGET_RELATION_FIELD_ID = uuidv4();
const APP_A_SOURCES_RELATION_FIELD_ID = uuidv4();

const APP_B_ID = uuidv4();
const APP_B_ROLE_ID = uuidv4();
const APP_B_OBJECT_ID = uuidv4();
const APP_B_NAME_FIELD_ID = uuidv4();

const APP_A_NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: APP_A_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

const APP_B_NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: APP_B_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

// Forward side, on App A's own object, pointing at App B's object.
const APP_A_TARGET_RELATION_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: APP_A_TARGET_RELATION_FIELD_ID,
  type: FieldMetadataType.RELATION,
  name: 'target',
  label: 'Target',
  relationTargetFieldMetadataUniversalIdentifier:
    APP_A_SOURCES_RELATION_FIELD_ID,
  relationTargetObjectMetadataUniversalIdentifier: APP_B_OBJECT_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetId',
    onDelete: RelationOnDeleteAction.SET_NULL,
  },
};

// Inverse side, owned by App A but placed on App B's object. It is a
// top-level manifest field because App A does not declare App B's object.
const APP_A_SOURCES_RELATION_FIELD: FieldManifest = {
  universalIdentifier: APP_A_SOURCES_RELATION_FIELD_ID,
  type: FieldMetadataType.RELATION,
  name: 'crossAppRelationSources',
  label: 'Cross App Relation Sources',
  objectUniversalIdentifier: APP_B_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    APP_A_TARGET_RELATION_FIELD_ID,
  relationTargetObjectMetadataUniversalIdentifier: APP_A_OBJECT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
};

const buildAppBManifest = (): Manifest =>
  buildBaseManifest({
    appId: APP_B_ID,
    roleId: APP_B_ROLE_ID,
    overrides: {
      // Role labels are unique workspace-wide, so each app ships its own
      roles: [
        {
          universalIdentifier: APP_B_ROLE_ID,
          label: 'App B Cross App Relation Role',
          description: 'Role owned by App B',
        },
      ],
      objects: [
        buildDefaultObjectManifest({
          applicationUniversalIdentifier: APP_B_ID,
          universalIdentifier: APP_B_OBJECT_ID,
          nameSingular: 'crossAppRelationTarget',
          namePlural: 'crossAppRelationTargets',
          labelSingular: 'Cross App Relation Target',
          labelPlural: 'Cross App Relation Targets',
          labelIdentifierFieldMetadataUniversalIdentifier: APP_B_NAME_FIELD_ID,
          additionalFields: [APP_B_NAME_FIELD],
        }),
      ],
    },
  });

const buildAppAManifest = (): Manifest =>
  buildBaseManifest({
    appId: APP_A_ID,
    roleId: APP_A_ROLE_ID,
    overrides: {
      roles: [
        {
          universalIdentifier: APP_A_ROLE_ID,
          label: 'App A Cross App Relation Role',
          description: 'Role owned by App A',
        },
      ],
      objects: [
        buildDefaultObjectManifest({
          applicationUniversalIdentifier: APP_A_ID,
          universalIdentifier: APP_A_OBJECT_ID,
          nameSingular: 'crossAppRelationSource',
          namePlural: 'crossAppRelationSources',
          labelSingular: 'Cross App Relation Source',
          labelPlural: 'Cross App Relation Sources',
          labelIdentifierFieldMetadataUniversalIdentifier: APP_A_NAME_FIELD_ID,
          additionalFields: [APP_A_NAME_FIELD, APP_A_TARGET_RELATION_FIELD],
        }),
      ],
      fields: [APP_A_SOURCES_RELATION_FIELD],
    },
  });

const findApplicationIdByUniversalIdentifier = async (
  applicationUniversalIdentifier: string,
) => {
  const { data } = await findManyApplications({ expectToFail: false });

  return data.findManyApplications.find(
    (application) =>
      application.universalIdentifier === applicationUniversalIdentifier,
  )?.id;
};

const findObjectsByUniversalIdentifier = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  return {
    appAObject: objects.find(
      (objectMetadata) =>
        objectMetadata.universalIdentifier === APP_A_OBJECT_ID,
    ),
    appBObject: objects.find(
      (objectMetadata) =>
        objectMetadata.universalIdentifier === APP_B_OBJECT_ID,
    ),
  };
};

describe('Sync application should succeed when App A declares a RELATION between its own object and an App B object', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_B_ID,
      name: 'App B',
      description: 'App owning the relation target object',
      sourcePath: 'test-cross-app-relation-field-app-b',
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_A_ID,
      name: 'App A',
      description: 'App relating its own object to an App B object',
      sourcePath: 'test-cross-app-relation-field-app-a',
    });

    await syncApplication({
      manifest: buildAppBManifest(),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_A_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_B_ID,
    });
  }, 60000);

  it('syncs App A with a relation field on its own object and its inverse on the App B object', async () => {
    const { errors } = await syncApplication({
      manifest: buildAppAManifest(),
      expectToFail: false,
    });

    expect(isDefined(errors)).toBe(false);

    const appAApplicationId =
      await findApplicationIdByUniversalIdentifier(APP_A_ID);
    const { appAObject, appBObject } = await findObjectsByUniversalIdentifier();

    expect(appAApplicationId).toBeDefined();
    expect(appAObject).toBeDefined();
    expect(appBObject).toBeDefined();

    const targetField = appAObject?.fieldsList.find(
      (field) => field.universalIdentifier === APP_A_TARGET_RELATION_FIELD_ID,
    );

    expect(targetField).toBeDefined();
    expect(targetField?.applicationId).toBe(appAApplicationId);
    expect(targetField?.relation?.type).toBe(RelationType.MANY_TO_ONE);
    expect(targetField?.relation?.targetObjectMetadata.id).toBe(
      appBObject?.id,
    );

    const sourcesField = appBObject?.fieldsList.find(
      (field) => field.universalIdentifier === APP_A_SOURCES_RELATION_FIELD_ID,
    );

    expect(sourcesField).toBeDefined();
    expect(sourcesField?.applicationId).toBe(appAApplicationId);
    expect(sourcesField?.relation?.type).toBe(RelationType.ONE_TO_MANY);
    expect(sourcesField?.relation?.targetObjectMetadata.id).toBe(
      appAObject?.id,
    );
    expect(sourcesField?.relation?.targetFieldMetadata.id).toBe(
      targetField?.id,
    );
  }, 60000);

  it('re-syncs App A with the same manifest without error', async () => {
    const { errors } = await syncApplication({
      manifest: buildAppAManifest(),
      expectToFail: false,
    });

    expect(isDefined(errors)).toBe(false);
  }, 60000);
});
