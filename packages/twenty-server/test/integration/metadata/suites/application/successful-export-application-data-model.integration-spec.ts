import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type FieldManifest,
  getFieldUniversalIdentifier,
  getIndexFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  type ObjectManifest,
  SYSTEM_VIEW_KEYS,
  type TranslationsManifest,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

const TEST_APP_ID = '7e3d1c2b-0000-4a7b-8c9d-0e1f2a3b4c5d';
const TEST_ROLE_ID = '7e3d1c2b-0001-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_OBJECT_ID = '7e3d1c2b-0002-4a7b-8c9d-0e1f2a3b4c5d';
const PROJECT_OBJECT_ID = '7e3d1c2b-0003-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_TITLE_FIELD_ID = '7e3d1c2b-0004-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_PROJECT_FIELD_ID = '7e3d1c2b-0005-4a7b-8c9d-0e1f2a3b4c5d';
const PROJECT_TICKETS_FIELD_ID = '7e3d1c2b-0006-4a7b-8c9d-0e1f2a3b4c5d';
const COMPANY_TAGLINE_FIELD_ID = '7e3d1c2b-0007-4a7b-8c9d-0e1f2a3b4c5d';
const INDEX_ID = '7e3d1c2b-0008-4a7b-8c9d-0e1f2a3b4c5d';
const INDEX_FIELD_ID = '7e3d1c2b-0009-4a7b-8c9d-0e1f2a3b4c5d';

const ENGINE_DERIVED_FIELD_NAMES = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
];

const buildIdentifierNames = (): Map<string, string> => {
  const names = new Map<string, string>([
    [TEST_APP_ID, 'TEST_APP'],
    [TEST_ROLE_ID, 'TEST_ROLE'],
    [TICKET_OBJECT_ID, 'TICKET_OBJECT'],
    [PROJECT_OBJECT_ID, 'PROJECT_OBJECT'],
    [TICKET_TITLE_FIELD_ID, 'TICKET_TITLE_FIELD'],
    [TICKET_PROJECT_FIELD_ID, 'TICKET_PROJECT_FIELD'],
    [PROJECT_TICKETS_FIELD_ID, 'PROJECT_TICKETS_FIELD'],
    [COMPANY_TAGLINE_FIELD_ID, 'COMPANY_TAGLINE_FIELD'],
    [INDEX_ID, 'TICKET_TITLE_INDEX'],
    [INDEX_FIELD_ID, 'TICKET_TITLE_INDEX_FIELD'],
    [
      getIndexFieldUniversalIdentifier({
        applicationUniversalIdentifier: TEST_APP_ID,
        indexUniversalIdentifier: INDEX_ID,
        fieldUniversalIdentifier: TICKET_TITLE_FIELD_ID,
      }),
      'TICKET_TITLE_INDEX_FIELD_ENGINE_DERIVED',
    ],
    [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company, 'STANDARD_COMPANY_OBJECT'],
  ]);

  for (const [objectName, objectUniversalIdentifier] of [
    ['TICKET', TICKET_OBJECT_ID],
    ['PROJECT', PROJECT_OBJECT_ID],
  ] as const) {
    for (const fieldName of ENGINE_DERIVED_FIELD_NAMES) {
      names.set(
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: TEST_APP_ID,
          objectUniversalIdentifier,
          name: fieldName,
        }),
        `${objectName}_${fieldName}_ENGINE_FIELD`,
      );
    }

    for (const viewKey of Object.values(SYSTEM_VIEW_KEYS)) {
      names.set(
        getSystemViewUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
          objectUniversalIdentifier,
          viewKey,
        }),
        `${objectName}_${viewKey}_ENGINE_VIEW`,
      );
    }
  }

  return names;
};

const IDENTIFIER_NAMES = buildIdentifierNames();

const nameIdentifiers = <TValue>(value: TValue): TValue => {
  let serialized = JSON.stringify(value);

  for (const [universalIdentifier, name] of IDENTIFIER_NAMES) {
    serialized = serialized.split(universalIdentifier).join(`<${name}>`);
  }

  return JSON.parse(serialized) as TValue;
};

const projectObject = buildDefaultObjectManifest({
  universalIdentifier: PROJECT_OBJECT_ID,
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'exportProject',
  namePlural: 'exportProjects',
  labelSingular: 'Export Project',
  labelPlural: 'Export Projects',
  description: 'A project',
});

const ticketObject: ObjectManifest = {
  ...buildDefaultObjectManifest({
    universalIdentifier: TICKET_OBJECT_ID,
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

const FIXTURE_TRANSLATIONS: TranslationsManifest = {
  'fr-FR': {
    'export.ticket.title': 'Titre du ticket',
    'export.ticket.project': 'Projet',
  },
};

const manifest = buildBaseManifest({
  appId: TEST_APP_ID,
  roleId: TEST_ROLE_ID,
  overrides: {
    translations: FIXTURE_TRANSLATIONS,
    objects: [ticketObject, projectObject],
    fields: [companyTaglineField],
    indexes: [
      {
        universalIdentifier: INDEX_ID,
        objectUniversalIdentifier: ticketObject.universalIdentifier,
        fields: [
          {
            universalIdentifier: INDEX_FIELD_ID,
            fieldUniversalIdentifier: TICKET_TITLE_FIELD_ID,
          },
        ],
      },
    ],
  },
});

describe('Application export - data model', () => {
  beforeAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
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

  it('exports the whole application as a stable manifest and classifies every row', async () => {
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
    expect(exported.files).toEqual([]);
    expect(nameIdentifiers(exported.manifest)).toMatchSnapshot('manifest');

    const namedCoverage = nameIdentifiers(
      exported.coverage.filter(({ universalIdentifier }) =>
        IDENTIFIER_NAMES.has(universalIdentifier),
      ),
    ).sort(
      (left, right) =>
        left.metadataName.localeCompare(right.metadataName) ||
        left.universalIdentifier.localeCompare(right.universalIdentifier),
    );
    const unnamedCoverageCounts = Object.fromEntries(
      Object.entries(
        exported.coverage
          .filter(
            ({ universalIdentifier }) =>
              !IDENTIFIER_NAMES.has(universalIdentifier),
          )
          .reduce<Record<string, number>>((counts, entry) => {
            const key = `${entry.metadataName} ${entry.status}${isDefined(entry.reason) ? ` (${entry.reason})` : ''}`;

            counts[key] = (counts[key] ?? 0) + 1;

            return counts;
          }, {}),
      ).sort(([left], [right]) => left.localeCompare(right)),
    );

    expect({
      named: namedCoverage,
      unnamedByKindAndStatus: unnamedCoverageCounts,
    }).toMatchSnapshot('coverage');
  }, 60000);

  it('keeps the engine-derived label identifier pointer and classifies the rows it cannot export', async () => {
    const { data } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
    const exported = data.exportApplication;
    const exportedTicket = exported.manifest.objects.find(
      ({ universalIdentifier }) => universalIdentifier === TICKET_OBJECT_ID,
    );
    const statusOf = (universalIdentifier: string) =>
      exported.coverage.find(
        (entry) => entry.universalIdentifier === universalIdentifier,
      )?.status;

    expect(
      exportedTicket?.labelIdentifierFieldMetadataUniversalIdentifier,
    ).toBe(
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier: TEST_APP_ID,
        objectUniversalIdentifier: TICKET_OBJECT_ID,
        name: 'id',
      }),
    );
    expect(exported.manifest.translations).toEqual(FIXTURE_TRANSLATIONS);
    expect(statusOf(TICKET_OBJECT_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(COMPANY_TAGLINE_FIELD_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TEST_ROLE_ID)).toBe(
      ApplicationExportCoverageStatus.UNSUPPORTED,
    );
    expect(
      statusOf(
        getSystemViewUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
          objectUniversalIdentifier: TICKET_OBJECT_ID,
          viewKey: SYSTEM_VIEW_KEYS.INDEX,
        }),
      ),
    ).toBe(ApplicationExportCoverageStatus.ENGINE_DERIVED);
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
