import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type FieldManifest,
  type ObjectManifest,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TICKET_TITLE_FIELD_ID = uuidv4();
const TICKET_PROJECT_FIELD_ID = uuidv4();
const PROJECT_TICKETS_FIELD_ID = uuidv4();
const COMPANY_TAGLINE_FIELD_ID = uuidv4();
const INDEX_ID = uuidv4();

const projectObject = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'exportProject',
  namePlural: 'exportProjects',
  labelSingular: 'Export Project',
  labelPlural: 'Export Projects',
  description: 'A project',
});

const ticketObject: ObjectManifest = {
  ...buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    nameSingular: 'exportTicket',
    namePlural: 'exportTickets',
    labelSingular: 'Export Ticket',
    labelPlural: 'Export Tickets',
    description: 'A ticket',
  }),
  color: 'blue',
  isLabelSyncedWithName: true,
};

ticketObject.fields = [
  ...ticketObject.fields,
  {
    universalIdentifier: TICKET_TITLE_FIELD_ID,
    type: FieldMetadataType.TEXT,
    name: 'title',
    label: 'Title',
    isLabelSyncedWithName: true,
  },
  {
    universalIdentifier: TICKET_PROJECT_FIELD_ID,
    type: FieldMetadataType.RELATION,
    name: 'project',
    label: 'Project',
    relationTargetFieldMetadataUniversalIdentifier: PROJECT_TICKETS_FIELD_ID,
    relationTargetObjectMetadataUniversalIdentifier:
      projectObject.universalIdentifier,
    universalSettings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'projectId',
      onDelete: RelationOnDeleteAction.SET_NULL,
    },
  },
];

projectObject.fields = [
  ...projectObject.fields,
  {
    universalIdentifier: PROJECT_TICKETS_FIELD_ID,
    type: FieldMetadataType.RELATION,
    name: 'tickets',
    label: 'Tickets',
    relationTargetFieldMetadataUniversalIdentifier: TICKET_PROJECT_FIELD_ID,
    relationTargetObjectMetadataUniversalIdentifier:
      ticketObject.universalIdentifier,
    universalSettings: { relationType: RelationType.ONE_TO_MANY },
  },
];

const companyTaglineField: FieldManifest = {
  universalIdentifier: COMPANY_TAGLINE_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'exportTagline',
  label: 'Export Tagline',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
};

const manifest = buildBaseManifest({
  appId: TEST_APP_ID,
  roleId: TEST_ROLE_ID,
  overrides: {
    objects: [ticketObject, projectObject],
    fields: [companyTaglineField],
    indexes: [
      {
        universalIdentifier: INDEX_ID,
        objectUniversalIdentifier: ticketObject.universalIdentifier,
        fields: [
          {
            universalIdentifier: uuidv4(),
            fieldUniversalIdentifier: TICKET_TITLE_FIELD_ID,
          },
        ],
      },
    ],
  },
});

describe('Application export - data model', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Export Data Model Test Application',
      description: 'App for testing the data model export',
      sourcePath: 'export-data-model',
    });

    await syncApplication({ manifest, expectToFail: false });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('exports the data model with its fidelity fields and classifies every row', async () => {
    const { data, errors } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const exported = data.exportApplication;

    expect(exported.application).toMatchObject({
      universalIdentifier: TEST_APP_ID,
      displayName: 'Test Application',
      sourceType: 'LOCAL',
    });
    expect(exported.manifest.application.defaultRoleUniversalIdentifier).toBe(
      TEST_ROLE_ID,
    );

    expect(
      exported.manifest.objects.map(({ nameSingular }) => nameSingular),
    ).toEqual(['exportProject', 'exportTicket']);

    const exportedTicket = exported.manifest.objects[1];

    expect(exportedTicket).toMatchObject({
      color: 'blue',
      isLabelSyncedWithName: true,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
      labelIdentifierFieldMetadataUniversalIdentifier:
        ticketObject.labelIdentifierFieldMetadataUniversalIdentifier,
    });
    expect(exportedTicket.fields.map(({ name }) => name)).toEqual([
      'project',
      'title',
    ]);
    expect(
      exportedTicket.fields.find(({ name }) => name === 'project'),
    ).toMatchObject({
      type: FieldMetadataType.RELATION,
      relationTargetFieldMetadataUniversalIdentifier: PROJECT_TICKETS_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'projectId',
        onDelete: RelationOnDeleteAction.SET_NULL,
      },
    });

    expect(exported.manifest.fields).toMatchObject([
      {
        universalIdentifier: COMPANY_TAGLINE_FIELD_ID,
        name: 'exportTagline',
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
      },
    ]);
    expect(exported.manifest.indexes).toMatchObject([
      {
        universalIdentifier: INDEX_ID,
        fields: [{ fieldUniversalIdentifier: TICKET_TITLE_FIELD_ID }],
      },
    ]);

    const statusOf = (universalIdentifier: string) =>
      exported.coverage.find(
        (entry) => entry.universalIdentifier === universalIdentifier,
      )?.status;

    expect(statusOf(ticketObject.universalIdentifier)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TICKET_TITLE_FIELD_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(INDEX_ID)).toBe(ApplicationExportCoverageStatus.EXPORTED);
    expect(statusOf(TEST_ROLE_ID)).toBe(
      ApplicationExportCoverageStatus.UNSUPPORTED,
    );
    expect(
      exported.coverage.filter(
        ({ metadataName, status }) =>
          metadataName === 'fieldMetadata' &&
          status === ApplicationExportCoverageStatus.ENGINE_DERIVED,
      ).length,
    ).toBeGreaterThan(0);
  }, 60000);

  it('round-trips the raw export through an additive dry-run sync without any action', async () => {
    const { data } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    const dryRun = await syncApplication({
      manifest: data.exportApplication.manifest,
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(dryRun.errors).toBeUndefined();
    expect(dryRun.data.syncApplication.actions).toEqual([]);
  }, 60000);

  it('refuses to export the standard application', async () => {
    const { errors } = await exportApplication({
      universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      expectToFail: true,
    });

    expect(errors?.[0]?.extensions?.subCode).toBe(
      'STANDARD_APPLICATION_NOT_EXPORTABLE',
    );
  });

  it('round-trips the workspace Custom application through an additive dry-run sync without any action', async () => {
    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const customApplication = applicationsData.findManyApplications.find(
      ({ name }) => name === WORKSPACE_CUSTOM_APPLICATION_NAME,
    );

    expect(isDefined(customApplication)).toBe(true);

    const { data } = await exportApplication({
      universalIdentifier: customApplication!.universalIdentifier,
      expectToFail: false,
    });

    expect(data.exportApplication.manifest.objects.length).toBeGreaterThan(0);

    const dryRun = await syncApplication({
      manifest: data.exportApplication.manifest,
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(dryRun.errors).toBeUndefined();
    expect(dryRun.data.syncApplication.actions).toEqual([]);
  }, 60000);
});
