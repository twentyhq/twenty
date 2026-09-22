import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type FieldManifest } from 'twenty-shared/application';
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
const APP_A_WIDGETS_RELATION_FIELD_ID = uuidv4();

const APP_B_ID = uuidv4();
const APP_B_ROLE_ID = uuidv4();
const APP_B_OBJECT_ID = uuidv4();
const APP_B_NAME_FIELD_ID = uuidv4();
const APP_B_TARGET_RELATION_FIELD_ID = uuidv4();

const APP_A_NAME_FIELD: FieldManifest = {
  universalIdentifier: APP_A_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
  objectUniversalIdentifier: APP_A_OBJECT_ID,
};

const APP_B_NAME_FIELD: FieldManifest = {
  universalIdentifier: APP_B_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
  objectUniversalIdentifier: APP_B_OBJECT_ID,
};

const APP_B_TARGET_RELATION_FIELD: FieldManifest = {
  universalIdentifier: APP_B_TARGET_RELATION_FIELD_ID,
  type: FieldMetadataType.RELATION,
  name: 'target',
  label: 'Target',
  objectUniversalIdentifier: APP_B_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    APP_A_WIDGETS_RELATION_FIELD_ID,
  relationTargetObjectMetadataUniversalIdentifier: APP_A_OBJECT_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetId',
    onDelete: RelationOnDeleteAction.SET_NULL,
  },
};

// Declared as a top-level manifest field (not nested under App A's object)
// because it targets an object owned by a different app - this is what lets
// App B's sync attach an inverse field onto App A's already-synced object.
const APP_A_WIDGETS_RELATION_FIELD: FieldManifest = {
  universalIdentifier: APP_A_WIDGETS_RELATION_FIELD_ID,
  type: FieldMetadataType.RELATION,
  name: 'widgets',
  label: 'Widgets',
  objectUniversalIdentifier: APP_A_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    APP_B_TARGET_RELATION_FIELD_ID,
  relationTargetObjectMetadataUniversalIdentifier: APP_B_OBJECT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
};

describe('Sync application cross-app RELATION field should resolve real GraphQL data', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_A_ID,
      name: 'Data Query App A',
      description: 'App owning the data-query target object',
      sourcePath: 'test-cross-app-relation-data-query-app-a',
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_B_ID,
      name: 'Data Query App B',
      description: 'App whose widget object relates to App A object',
      sourcePath: 'test-cross-app-relation-data-query-app-b',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_A_ID,
        roleId: APP_A_ROLE_ID,
        overrides: {
          // Role labels are unique workspace-wide (PG constraint), so each
          // app must ship a distinct label, and distinct from the renamed
          // repro spec's roles since both run together in the Task 3
          // combined invocation.
          roles: [
            {
              universalIdentifier: APP_A_ROLE_ID,
              label: 'App A Data Query Role',
              description: 'Role owned by Data Query App A',
            },
          ],
          objects: [
            buildDefaultObjectManifest({
              applicationUniversalIdentifier: APP_A_ID,
              universalIdentifier: APP_A_OBJECT_ID,
              nameSingular: 'dataQueryTarget',
              namePlural: 'dataQueryTargets',
              labelSingular: 'Data Query Target',
              labelPlural: 'Data Query Targets',
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

  it('resolves real GraphQL data across a cross-app RELATION field, both directions', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_B_ID,
        roleId: APP_B_ROLE_ID,
        overrides: {
          roles: [
            {
              universalIdentifier: APP_B_ROLE_ID,
              label: 'App B Data Query Role',
              description: 'Role owned by Data Query App B',
            },
          ],
          fields: [APP_A_WIDGETS_RELATION_FIELD],
          objects: [
            buildDefaultObjectManifest({
              applicationUniversalIdentifier: APP_B_ID,
              universalIdentifier: APP_B_OBJECT_ID,
              nameSingular: 'dataQueryWidget',
              namePlural: 'dataQueryWidgets',
              labelSingular: 'Data Query Widget',
              labelPlural: 'Data Query Widgets',
              additionalFields: [APP_B_NAME_FIELD, APP_B_TARGET_RELATION_FIELD],
            }),
          ],
        },
      }),
      expectToFail: false,
    });

    expect(isDefined(errors)).toBe(false);

    const appARecordId = uuidv4();

    const createAppARecordResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'dataQueryTarget',
        gqlFields: `
          id
          name
        `,
        data: {
          id: appARecordId,
          name: 'App A Data Query Record',
        },
      }),
    );

    expect(createAppARecordResponse.body.data?.createDataQueryTarget?.id).toBe(
      appARecordId,
    );

    const widgetRecordId = uuidv4();

    const createWidgetRecordResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'dataQueryWidget',
        gqlFields: `
          id
          name
          targetId
        `,
        data: {
          id: widgetRecordId,
          name: 'Widget Data Query Record',
          targetId: appARecordId,
        },
      }),
    );

    expect(
      createWidgetRecordResponse.body.data?.createDataQueryWidget?.targetId,
    ).toBe(appARecordId);

    // Forward direction: widget -> target, queried as a flat nested object.
    const forwardQueryResponse = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'dataQueryWidget',
        gqlFields: `
          id
          name
          target {
            id
            name
          }
        `,
        filter: { id: { eq: widgetRecordId } },
      }),
    );

    const widgetRecord = forwardQueryResponse.body.data?.dataQueryWidget;

    expect(widgetRecord?.target?.id).toBe(appARecordId);
    expect(widgetRecord?.target?.name).toBe('App A Data Query Record');

    // Inverse direction: target -> widgets, queried as a GraphQL connection.
    const inverseQueryResponse = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'dataQueryTarget',
        gqlFields: `
          id
          name
          widgets {
            edges {
              node {
                id
                name
              }
            }
          }
        `,
        filter: { id: { eq: appARecordId } },
      }),
    );

    const targetRecord = inverseQueryResponse.body.data?.dataQueryTarget;

    expect(targetRecord?.widgets?.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          node: expect.objectContaining({
            id: widgetRecordId,
            name: 'Widget Data Query Record',
          }),
        }),
      ]),
    );
  }, 60000);
});
