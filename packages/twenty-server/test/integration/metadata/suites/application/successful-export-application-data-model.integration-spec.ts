import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { destroyOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/destroy-one-view-filter.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type FieldManifest,
  getFieldUniversalIdentifier,
  getIndexFieldUniversalIdentifier,
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemPageLayoutWidgetUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
  getSystemRecordPageLayoutUniversalIdentifier,
  getSystemRelationFieldUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  type ObjectManifest,
  type StandaloneViewFieldManifest,
  SYSTEM_VIEW_KEYS,
  type TranslationsManifest,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  type ViewManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  AggregateOperations,
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { version as getUuidVersion } from 'uuid';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { fromObjectManifestToUniversalFlatObjectMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-object-manifest-to-universal-flat-object-metadata.util';
import { buildSearchVectorFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-flat-field-metadata-for-custom-object.util';
import { buildSearchVectorGinIndexForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-gin-index-for-custom-object.util';

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
const OPEN_TICKETS_VIEW_ID = '7e3d1c2b-0010-4a7b-8c9d-0e1f2a3b4c5d';
const TITLE_VIEW_FIELD_ID = '7e3d1c2b-0011-4a7b-8c9d-0e1f2a3b4c5d';
const PROJECT_VIEW_FIELD_ID = '7e3d1c2b-0012-4a7b-8c9d-0e1f2a3b4c5d';
const VIEW_FIELD_GROUP_ID = '7e3d1c2b-0013-4a7b-8c9d-0e1f2a3b4c5d';
const VIEW_FILTER_GROUP_ID = '7e3d1c2b-0014-4a7b-8c9d-0e1f2a3b4c5d';
const VIEW_FILTER_ID = '7e3d1c2b-0015-4a7b-8c9d-0e1f2a3b4c5d';
const VIEW_SORT_ID = '7e3d1c2b-0016-4a7b-8c9d-0e1f2a3b4c5d';
const VIEW_GROUP_ID = '7e3d1c2b-0017-4a7b-8c9d-0e1f2a3b4c5d';
const PROJECT_INDEX_VIEW_FIELD_ID = '7e3d1c2b-0018-4a7b-8c9d-0e1f2a3b4c5d';

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

const SYSTEM_RELATION_TARGET_OBJECT_NAMES = [
  'timelineActivity',
  'attachment',
  'noteTarget',
  'taskTarget',
] as const;

const RECORD_PAGE_TABS = [
  { tabTitle: 'Home', widgetTitle: 'Fields' },
  { tabTitle: 'Timeline', widgetTitle: 'Timeline' },
  { tabTitle: 'Tasks', widgetTitle: 'Tasks' },
  { tabTitle: 'Notes', widgetTitle: 'Notes' },
  { tabTitle: 'Files', widgetTitle: 'Files' },
];

const RECORD_FORM_TAB_TITLE = 'Fields';

type SystemRowsOwner = {
  objectName: string;
  objectUniversalIdentifier: string;
  objectMetadataApplicationUniversalIdentifier: string;
  applicationFieldUniversalIdentifierByName: Record<string, string>;
};

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
    [OPEN_TICKETS_VIEW_ID, 'OPEN_TICKETS_VIEW'],
    [TITLE_VIEW_FIELD_ID, 'OPEN_TICKETS_TITLE_VIEW_FIELD'],
    [PROJECT_VIEW_FIELD_ID, 'OPEN_TICKETS_PROJECT_VIEW_FIELD'],
    [VIEW_FIELD_GROUP_ID, 'OPEN_TICKETS_TRIAGE_FIELD_GROUP'],
    [VIEW_FILTER_GROUP_ID, 'OPEN_TICKETS_NOT_FILTER_GROUP'],
    [VIEW_FILTER_ID, 'OPEN_TICKETS_TITLE_FILTER'],
    [VIEW_SORT_ID, 'OPEN_TICKETS_TITLE_SORT'],
    [VIEW_GROUP_ID, 'OPEN_TICKETS_OPEN_GROUP'],
    [PROJECT_INDEX_VIEW_FIELD_ID, 'PROJECT_INDEX_DELETED_AT_VIEW_FIELD'],
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

  const nameSystemRowsOfObject = ({
    objectName,
    objectUniversalIdentifier,
    objectMetadataApplicationUniversalIdentifier,
    applicationFieldUniversalIdentifierByName,
  }: SystemRowsOwner) => {
    const applicationFields = Object.entries(
      applicationFieldUniversalIdentifierByName,
    );

    for (const viewKey of Object.values(SYSTEM_VIEW_KEYS)) {
      const viewUniversalIdentifier = getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
        viewKey,
      });

      names.set(
        viewUniversalIdentifier,
        `${objectName}_${viewKey}_ENGINE_VIEW`,
      );

      for (const [
        fieldName,
        fieldMetadataUniversalIdentifier,
      ] of applicationFields) {
        names.set(
          getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier: TEST_APP_ID,
            viewUniversalIdentifier,
            fieldMetadataUniversalIdentifier,
          }),
          `${objectName}_${viewKey}_ENGINE_VIEW_FIELD_${fieldName}`,
        );
      }
    }

    const recordPageLayoutUniversalIdentifier =
      getSystemRecordPageLayoutUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      });

    names.set(
      recordPageLayoutUniversalIdentifier,
      `${objectName}_RECORD_PAGE_LAYOUT`,
    );

    for (const { tabTitle, widgetTitle } of RECORD_PAGE_TABS) {
      const pageLayoutTabUniversalIdentifier =
        getSystemPageLayoutTabUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier,
          pageLayoutUniversalIdentifier: recordPageLayoutUniversalIdentifier,
          title: tabTitle,
        });

      names.set(
        pageLayoutTabUniversalIdentifier,
        `${objectName}_RECORD_PAGE_TAB_${tabTitle}`,
      );
      names.set(
        getSystemPageLayoutWidgetUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier,
          pageLayoutTabUniversalIdentifier,
          title: widgetTitle,
        }),
        `${objectName}_RECORD_PAGE_WIDGET_${widgetTitle}`,
      );
    }

    const recordFormLayoutUniversalIdentifier =
      getSystemRecordFormPageLayoutUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      });
    const recordFormTabUniversalIdentifier =
      getSystemPageLayoutTabUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        pageLayoutUniversalIdentifier: recordFormLayoutUniversalIdentifier,
        title: RECORD_FORM_TAB_TITLE,
      });

    names.set(
      recordFormLayoutUniversalIdentifier,
      `${objectName}_RECORD_FORM_LAYOUT`,
    );
    names.set(
      recordFormTabUniversalIdentifier,
      `${objectName}_RECORD_FORM_TAB`,
    );

    for (const [
      fieldName,
      fieldMetadataUniversalIdentifier,
    ] of applicationFields) {
      names.set(
        getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier: TEST_APP_ID,
          pageLayoutTabUniversalIdentifier: recordFormTabUniversalIdentifier,
          fieldMetadataUniversalIdentifier,
        }),
        `${objectName}_RECORD_FORM_WIDGET_${fieldName}`,
      );
    }
  };

  for (const {
    objectName,
    objectUniversalIdentifier,
    objectManifest,
    authoredFieldUniversalIdentifierByName,
  } of [
    {
      objectName: 'TICKET',
      objectUniversalIdentifier: TICKET_OBJECT_ID,
      objectManifest: ticketObject,
      authoredFieldUniversalIdentifierByName: {
        title: TICKET_TITLE_FIELD_ID,
        project: TICKET_PROJECT_FIELD_ID,
      },
    },
    {
      objectName: 'PROJECT',
      objectUniversalIdentifier: PROJECT_OBJECT_ID,
      objectManifest: projectObject,
      authoredFieldUniversalIdentifierByName: {
        tickets: PROJECT_TICKETS_FIELD_ID,
      },
    },
  ]) {
    const engineFieldUniversalIdentifierByName = Object.fromEntries(
      ENGINE_DERIVED_FIELD_NAMES.map((fieldName) => [
        fieldName,
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: TEST_APP_ID,
          objectUniversalIdentifier,
          name: fieldName,
        }),
      ]),
    );

    for (const [fieldName, fieldUniversalIdentifier] of Object.entries(
      engineFieldUniversalIdentifierByName,
    )) {
      names.set(
        fieldUniversalIdentifier,
        `${objectName}_${fieldName}_ENGINE_FIELD`,
      );
    }

    const flatObjectMetadata = fromObjectManifestToUniversalFlatObjectMetadata({
      objectManifest,
      applicationUniversalIdentifier: TEST_APP_ID,
      now: new Date().toISOString(),
    });

    names.set(
      buildSearchVectorGinIndexForCustomObject({
        flatObjectMetadata,
        searchVectorFlatFieldMetadata:
          buildSearchVectorFlatFieldMetadataForCustomObject({
            flatObjectMetadata,
          }),
      }).universalIdentifier,
      `${objectName}_SEARCH_VECTOR_ENGINE_INDEX`,
    );

    const systemRelationFieldUniversalIdentifierByName: Record<string, string> =
      {};

    for (const targetObjectName of SYSTEM_RELATION_TARGET_OBJECT_NAMES) {
      const targetObjectUniversalIdentifier =
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS[targetObjectName];
      const forwardFieldUniversalIdentifier =
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier: TEST_APP_ID,
          objectUniversalIdentifier,
          relationTargetObjectUniversalIdentifier:
            targetObjectUniversalIdentifier,
        });
      const reverseFieldUniversalIdentifier =
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier: TEST_APP_ID,
          objectUniversalIdentifier: targetObjectUniversalIdentifier,
          relationTargetObjectUniversalIdentifier: objectUniversalIdentifier,
        });

      systemRelationFieldUniversalIdentifierByName[targetObjectName] =
        forwardFieldUniversalIdentifier;
      names.set(
        forwardFieldUniversalIdentifier,
        `${objectName}_${targetObjectName}_SYSTEM_RELATION_FIELD`,
      );
      names.set(
        reverseFieldUniversalIdentifier,
        `STANDARD_${targetObjectName}_target${objectName}_SYSTEM_RELATION_FIELD`,
      );
      nameSystemRowsOfObject({
        objectName: `STANDARD_${targetObjectName}`,
        objectUniversalIdentifier: targetObjectUniversalIdentifier,
        objectMetadataApplicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        applicationFieldUniversalIdentifierByName: {
          [`target${objectName}`]: reverseFieldUniversalIdentifier,
        },
      });
    }

    nameSystemRowsOfObject({
      objectName,
      objectUniversalIdentifier,
      objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
      applicationFieldUniversalIdentifierByName: {
        ...authoredFieldUniversalIdentifierByName,
        ...engineFieldUniversalIdentifierByName,
        ...systemRelationFieldUniversalIdentifierByName,
      },
    });
  }

  nameSystemRowsOfObject({
    objectName: 'STANDARD_COMPANY',
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
    objectMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    applicationFieldUniversalIdentifierByName: {
      tagline: COMPANY_TAGLINE_FIELD_ID,
    },
  });

  return names;
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

const openTicketsView: ViewManifest = {
  universalIdentifier: OPEN_TICKETS_VIEW_ID,
  name: 'Open tickets',
  objectUniversalIdentifier: ticketObject.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconTicket',
  position: 1,
  isCompact: true,
  anyFieldFilterValue: 'urgent',
  fields: [
    {
      universalIdentifier: TITLE_VIEW_FIELD_ID,
      fieldMetadataUniversalIdentifier: TICKET_TITLE_FIELD_ID,
      position: 0,
      size: 240,
      aggregateOperation: AggregateOperations.COUNT,
    },
    {
      universalIdentifier: PROJECT_VIEW_FIELD_ID,
      fieldMetadataUniversalIdentifier: TICKET_PROJECT_FIELD_ID,
      position: 1,
      isVisible: false,
    },
  ],
  fieldGroups: [
    {
      universalIdentifier: VIEW_FIELD_GROUP_ID,
      name: 'Triage',
      position: 0,
    },
  ],
  filterGroups: [
    {
      universalIdentifier: VIEW_FILTER_GROUP_ID,
      logicalOperator: ViewFilterGroupLogicalOperator.NOT,
    },
  ],
  filters: [
    {
      universalIdentifier: VIEW_FILTER_ID,
      fieldMetadataUniversalIdentifier: TICKET_TITLE_FIELD_ID,
      operand: ViewFilterOperand.CONTAINS,
      value: 'bug',
      viewFilterGroupUniversalIdentifier: VIEW_FILTER_GROUP_ID,
      positionInViewFilterGroup: 0,
    },
  ],
  sorts: [
    {
      universalIdentifier: VIEW_SORT_ID,
      fieldMetadataUniversalIdentifier: TICKET_TITLE_FIELD_ID,
      direction: ViewSortDirection.DESC,
    },
  ],
  groups: [
    {
      universalIdentifier: VIEW_GROUP_ID,
      fieldValue: 'open',
      position: 0,
    },
  ],
};

const PROJECT_INDEX_VIEW_ID = getSystemViewUniversalIdentifier({
  objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
  objectUniversalIdentifier: PROJECT_OBJECT_ID,
  viewKey: SYSTEM_VIEW_KEYS.INDEX,
});

const projectIndexViewField: StandaloneViewFieldManifest = {
  universalIdentifier: PROJECT_INDEX_VIEW_FIELD_ID,
  viewUniversalIdentifier: PROJECT_INDEX_VIEW_ID,
  fieldMetadataUniversalIdentifier: getFieldUniversalIdentifier({
    applicationUniversalIdentifier: TEST_APP_ID,
    objectUniversalIdentifier: PROJECT_OBJECT_ID,
    name: 'deletedAt',
  }),
  position: 10,
  isVisible: true,
  size: 180,
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
    views: [openTicketsView],
    viewFields: [projectIndexViewField],
  },
});

const IDENTIFIER_NAMES = buildIdentifierNames();

const nameIdentifiers = <TValue>(value: TValue): TValue => {
  const named: TValue = JSON.parse(JSON.stringify(value), (_key, nodeValue) =>
    typeof nodeValue === 'string' && IDENTIFIER_NAMES.has(nodeValue)
      ? `<${IDENTIFIER_NAMES.get(nodeValue)}>`
      : nodeValue,
  );

  return named;
};

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

    const isNamedRow = ({
      universalIdentifier,
    }: {
      universalIdentifier: string;
    }) => IDENTIFIER_NAMES.has(universalIdentifier);
    const hasRandomUniversalIdentifier = ({
      universalIdentifier,
    }: {
      universalIdentifier: string;
    }) => getUuidVersion(universalIdentifier) === 4;
    const compareCoverageRows = (
      left: { metadataName: string; universalIdentifier: string },
      right: { metadataName: string; universalIdentifier: string },
    ) =>
      left.metadataName.localeCompare(right.metadataName) ||
      left.universalIdentifier.localeCompare(right.universalIdentifier);

    const unnamedCoverage = exported.coverage.filter((row) => !isNamedRow(row));
    const randomlyIdentifiedCoverageCounts = Object.fromEntries(
      Object.entries(
        unnamedCoverage
          .filter(hasRandomUniversalIdentifier)
          .reduce<Record<string, number>>((counts, entry) => {
            const key = `${entry.metadataName} ${entry.status}${isDefined(entry.reason) ? ` (${entry.reason})` : ''}`;

            counts[key] = (counts[key] ?? 0) + 1;

            return counts;
          }, {}),
      ).sort(([left], [right]) => left.localeCompare(right)),
    );

    expect({
      named: nameIdentifiers(exported.coverage.filter(isNamedRow)).sort(
        compareCoverageRows,
      ),
      deterministicUnnamed: unnamedCoverage
        .filter((row) => !hasRandomUniversalIdentifier(row))
        .sort(compareCoverageRows),
      randomlyIdentifiedByKindAndStatus: randomlyIdentifiedCoverageCounts,
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
    expect(statusOf(PROJECT_INDEX_VIEW_ID)).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(PROJECT_INDEX_VIEW_FIELD_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
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

  it('should round-trip a view with a filter created through the metadata API in the workspace Custom application without any action', async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });
    const personObject = objects.find(
      ({ nameSingular }) => nameSingular === 'person',
    );

    jestExpectToBeDefined(personObject);

    const personJobTitleField = personObject.fieldsList?.find(
      ({ name }) => name === 'jobTitle',
    );

    jestExpectToBeDefined(personJobTitleField);

    const { data: applicationsData } = await findManyApplications({
      expectToFail: false,
    });
    const customApplication = applicationsData.findManyApplications.find(
      ({ name }) => name === WORKSPACE_CUSTOM_APPLICATION_NAME,
    );

    jestExpectToBeDefined(customApplication);

    const { data: createdViewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Export Custom Application People',
        objectMetadataId: personObject.id,
        type: ViewType.TABLE,
        icon: 'IconUser',
      },
    });
    const createdViewId = createdViewData.createView.id;

    try {
      const { data: createdViewFilterData } = await createOneViewFilter({
        expectToFail: false,
        input: {
          viewId: createdViewId,
          fieldMetadataId: personJobTitleField.id,
          operand: ViewFilterOperand.CONTAINS,
          value: 'Engineer',
        },
      });
      const createdViewFilterId = createdViewFilterData.createViewFilter.id;

      try {
        const { data } = await exportApplication({
          universalIdentifier: customApplication.universalIdentifier,
          expectToFail: false,
        });

        expect(data.exportApplication.manifest.views).toContainEqual(
          expect.objectContaining({
            name: 'Export Custom Application People',
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
            filters: [
              expect.objectContaining({
                operand: ViewFilterOperand.CONTAINS,
                value: 'Engineer',
              }),
            ],
          }),
        );

        const dryRun = await syncApplication({
          manifest: data.exportApplication.manifest,
          dryRun: true,
          inferDeletionFromMissingEntities: false,
          expectToFail: false,
        });

        expect(dryRun.errors).toBeUndefined();
        expect(dryRun.data.syncApplication.actions).toEqual([]);
      } finally {
        await destroyOneViewFilter({
          expectToFail: false,
          input: { id: createdViewFilterId },
        });
      }
    } finally {
      await destroyOneView({ expectToFail: false, viewId: createdViewId });
    }
  }, 60000);
});
