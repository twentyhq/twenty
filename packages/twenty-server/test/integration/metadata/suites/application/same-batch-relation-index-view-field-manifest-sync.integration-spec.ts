import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type ObjectManifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
  ViewKey,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TICKET_OBJECT_ID = uuidv4();
const PROJECT_OBJECT_ID = uuidv4();
const TICKET_NAME_FIELD_ID = uuidv4();
const PROJECT_NAME_FIELD_ID = uuidv4();
const TICKET_PROJECT_RELATION_FIELD_ID = uuidv4();
const PROJECT_TICKETS_RELATION_FIELD_ID = uuidv4();

const TICKET_NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: TICKET_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

const PROJECT_NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: PROJECT_NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

const TICKET_PROJECT_RELATION_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: TICKET_PROJECT_RELATION_FIELD_ID,
  type: FieldMetadataType.RELATION,
  name: 'project',
  label: 'Project',
  relationTargetFieldMetadataUniversalIdentifier:
    PROJECT_TICKETS_RELATION_FIELD_ID,
  relationTargetObjectMetadataUniversalIdentifier: PROJECT_OBJECT_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'projectId',
    onDelete: RelationOnDeleteAction.SET_NULL,
  },
};

const PROJECT_TICKETS_RELATION_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: PROJECT_TICKETS_RELATION_FIELD_ID,
  type: FieldMetadataType.RELATION,
  name: 'tickets',
  label: 'Tickets',
  relationTargetFieldMetadataUniversalIdentifier:
    TICKET_PROJECT_RELATION_FIELD_ID,
  relationTargetObjectMetadataUniversalIdentifier: TICKET_OBJECT_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
};

const buildManifest = ({
  includeRelationFields,
}: {
  includeRelationFields: boolean;
}) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [
        buildDefaultObjectManifest({
          applicationUniversalIdentifier: TEST_APP_ID,
          universalIdentifier: TICKET_OBJECT_ID,
          nameSingular: 'ticket',
          namePlural: 'tickets',
          labelSingular: 'Ticket',
          labelPlural: 'Tickets',
          description: 'A support ticket',
          icon: 'IconTicket',
          labelIdentifierFieldMetadataUniversalIdentifier: TICKET_NAME_FIELD_ID,
          additionalFields: [
            TICKET_NAME_FIELD,
            ...(includeRelationFields ? [TICKET_PROJECT_RELATION_FIELD] : []),
          ],
        }),
        buildDefaultObjectManifest({
          applicationUniversalIdentifier: TEST_APP_ID,
          universalIdentifier: PROJECT_OBJECT_ID,
          nameSingular: 'project',
          namePlural: 'projects',
          labelSingular: 'Project',
          labelPlural: 'Projects',
          description: 'A project',
          icon: 'IconBriefcase',
          labelIdentifierFieldMetadataUniversalIdentifier:
            PROJECT_NAME_FIELD_ID,
          additionalFields: [
            PROJECT_NAME_FIELD,
            ...(includeRelationFields ? [PROJECT_TICKETS_RELATION_FIELD] : []),
          ],
        }),
      ],
    },
  });

const findObjectWithFields = async (objectUniversalIdentifier: string) => {
  const { objects } = await findManyObjectMetadata({
    input: {
      filter: {},
      paging: { first: 100 },
    },
    gqlFields: `
      id
      universalIdentifier
      fieldsList {
        id
        name
        universalIdentifier
      }
    `,
    expectToFail: false,
  });

  const object = objects.find(
    (objectMetadata) =>
      objectMetadata.universalIdentifier === objectUniversalIdentifier,
  );

  if (!isDefined(object)) {
    throw new Error(
      `expected object ${objectUniversalIdentifier} to exist after sync`,
    );
  }

  return object;
};

const findIndexViewFields = async (objectMetadataId: string) => {
  const { data: viewsData } = await findViews({
    objectMetadataId,
    gqlFields: 'id key',
    expectToFail: false,
  });

  const indexView = viewsData?.getViews.find(
    (view) => view.key === ViewKey.INDEX,
  );

  if (!isDefined(indexView)) {
    throw new Error('expected an INDEX view for the object');
  }

  const { data: viewFieldsData } = await findViewFields({
    viewId: indexView.id,
    gqlFields: VIEW_FIELD_GQL_FIELDS,
    expectToFail: false,
  });

  return viewFieldsData?.getViewFields ?? [];
};

const expectRelationIndexViewFields = async () => {
  const ticketObject = await findObjectWithFields(TICKET_OBJECT_ID);
  const projectObject = await findObjectWithFields(PROJECT_OBJECT_ID);

  const ticketProjectField = ticketObject.fieldsList?.find(
    (field) => field.universalIdentifier === TICKET_PROJECT_RELATION_FIELD_ID,
  );
  const projectTicketsField = projectObject.fieldsList?.find(
    (field) => field.universalIdentifier === PROJECT_TICKETS_RELATION_FIELD_ID,
  );

  expect(ticketProjectField).toBeDefined();
  expect(projectTicketsField).toBeDefined();

  const ticketIndexViewFields = await findIndexViewFields(ticketObject.id);
  const projectIndexViewFields = await findIndexViewFields(projectObject.id);

  const ticketProjectViewField = ticketIndexViewFields.find(
    (viewField) => viewField.fieldMetadataId === ticketProjectField?.id,
  );
  const projectTicketsViewField = projectIndexViewFields.find(
    (viewField) => viewField.fieldMetadataId === projectTicketsField?.id,
  );

  expect(ticketProjectViewField).toBeDefined();
  expect(projectTicketsViewField).toBeDefined();

  // Same visibility as a relation added to a pre-existing object.
  expect(ticketProjectViewField?.isVisible).toBe(true);
  expect(projectTicketsViewField?.isVisible).toBe(true);
};

describe('Manifest sync - INDEX view fields for relation fields created in the same batch as their objects', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description:
        'App for testing INDEX view fields of same-batch relation fields',
      sourcePath: 'test-same-batch-relation-index-view-field',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  // Reproduces twentyhq/core-team-issues#2749: relations created in the same
  // sync as their objects get no INDEX view field at all, not even a hidden
  // one, while the same relations added in a later sync do (next test).
  it('should provision INDEX view fields for relation fields created in the same sync as their objects', async () => {
    await syncApplication({
      manifest: buildManifest({ includeRelationFields: true }),
      expectToFail: false,
    });

    await expectRelationIndexViewFields();
  }, 60000);

  it('should provision INDEX view fields for relation fields added to pre-existing objects in a second sync', async () => {
    await syncApplication({
      manifest: buildManifest({ includeRelationFields: false }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest({ includeRelationFields: true }),
      expectToFail: false,
    });

    await expectRelationIndexViewFields();
  }, 60000);
});
