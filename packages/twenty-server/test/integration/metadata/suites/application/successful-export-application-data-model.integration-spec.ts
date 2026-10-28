import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { destroyOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/destroy-one-view-filter.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type AgentManifest,
  type FieldManifest,
  getFieldUniversalIdentifier,
  getIndexFieldUniversalIdentifier,
  getRoleTargetUniversalIdentifier,
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemPageLayoutWidgetUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
  getSystemRecordPageLayoutUniversalIdentifier,
  getSystemRelationFieldUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getWorkflowCommandMenuItemUniversalIdentifier,
  getWorkflowVersionUniversalIdentifier,
  type NavigationMenuItemManifest,
  type ObjectManifest,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type SkillManifest,
  type StandalonePageLayoutWidgetManifest,
  type StandaloneViewFieldManifest,
  SYSTEM_VIEW_KEYS,
  type TranslationsManifest,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  type ViewManifest,
  type WorkflowManifest,
} from 'twenty-shared/application';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  AggregateOperations,
  FieldMetadataType,
  NavigationMenuItemType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  RelationOnDeleteAction,
  RelationType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  StepLogicalOperator,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  WidgetType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { version as getUuidVersion, v4 } from 'uuid';

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
const TICKET_PAGE_LAYOUT_ID = '7e3d1c2b-0019-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_PAGE_OVERVIEW_TAB_ID = '7e3d1c2b-0020-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_PAGE_FIELDS_WIDGET_ID = '7e3d1c2b-0021-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_BOARD_LAYOUT_ID = '7e3d1c2b-0022-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_BOARD_TAB_ID = '7e3d1c2b-0023-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_BOARD_DOCS_WIDGET_ID = '7e3d1c2b-0024-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_RECORD_PAGE_EXTRA_TAB_ID = '7e3d1c2b-0025-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_RECORD_PAGE_EXTRA_NOTES_WIDGET_ID =
  '7e3d1c2b-0026-4a7b-8c9d-0e1f2a3b4c5d';
const TICKETS_NAVIGATION_FOLDER_ID = '7e3d1c2b-0029-4a7b-8c9d-0e1f2a3b4c5d';
const TICKETS_NAVIGATION_ITEM_ID = '7e3d1c2b-0030-4a7b-8c9d-0e1f2a3b4c5d';
const TICKETS_INDEX_VIEW_NAVIGATION_ITEM_ID =
  '7e3d1c2b-0031-4a7b-8c9d-0e1f2a3b4c5d';
const COMPANY_RECORD_PAGE_TAGLINE_TAB_ID =
  '7e3d1c2b-0027-4a7b-8c9d-0e1f2a3b4c5d';
const TICKET_RECORD_PAGE_HOME_DOCS_WIDGET_ID =
  '7e3d1c2b-0028-4a7b-8c9d-0e1f2a3b4c5d';
const TEST_ROLE_TICKET_OBJECT_PERMISSION_ID =
  '7e3d1c2b-0032-4a7b-8c9d-0e1f2a3b4c5d';
const TEST_ROLE_TICKET_TITLE_FIELD_PERMISSION_ID =
  '7e3d1c2b-0033-4a7b-8c9d-0e1f2a3b4c5d';
const EXPORT_TICKETS_PERMISSION_FLAG_ID =
  '7e3d1c2b-0034-4a7b-8c9d-0e1f2a3b4c5d';
const TEST_ROLE_TICKET_PREDICATE_GROUP_ID =
  '7e3d1c2b-0035-4a7b-8c9d-0e1f2a3b4c5d';
const TEST_ROLE_TICKET_CHILD_PREDICATE_GROUP_ID =
  '7e3d1c2b-0036-4a7b-8c9d-0e1f2a3b4c5d';
const TEST_ROLE_TICKET_TITLE_PREDICATE_ID =
  '7e3d1c2b-0037-4a7b-8c9d-0e1f2a3b4c5d';

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
    [
      TEST_ROLE_TICKET_OBJECT_PERMISSION_ID,
      'TEST_ROLE_TICKET_OBJECT_PERMISSION',
    ],
    [
      TEST_ROLE_TICKET_TITLE_FIELD_PERMISSION_ID,
      'TEST_ROLE_TICKET_TITLE_FIELD_PERMISSION',
    ],
    [EXPORT_TICKETS_PERMISSION_FLAG_ID, 'EXPORT_TICKETS_PERMISSION_FLAG'],
    [TEST_ROLE_TICKET_PREDICATE_GROUP_ID, 'TEST_ROLE_TICKET_PREDICATE_GROUP'],
    [
      TEST_ROLE_TICKET_CHILD_PREDICATE_GROUP_ID,
      'TEST_ROLE_TICKET_CHILD_PREDICATE_GROUP',
    ],
    [TEST_ROLE_TICKET_TITLE_PREDICATE_ID, 'TEST_ROLE_TICKET_TITLE_PREDICATE'],
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
    [TICKET_PAGE_LAYOUT_ID, 'TICKET_PAGE_LAYOUT'],
    [TICKET_PAGE_OVERVIEW_TAB_ID, 'TICKET_PAGE_OVERVIEW_TAB'],
    [TICKET_PAGE_FIELDS_WIDGET_ID, 'TICKET_PAGE_FIELDS_WIDGET'],
    [TICKET_BOARD_LAYOUT_ID, 'TICKET_BOARD_LAYOUT'],
    [TICKET_BOARD_TAB_ID, 'TICKET_BOARD_TAB'],
    [TICKET_BOARD_DOCS_WIDGET_ID, 'TICKET_BOARD_DOCS_WIDGET'],
    [TICKET_RECORD_PAGE_EXTRA_TAB_ID, 'TICKET_RECORD_PAGE_EXTRA_TAB'],
    [
      TICKET_RECORD_PAGE_EXTRA_NOTES_WIDGET_ID,
      'TICKET_RECORD_PAGE_EXTRA_NOTES_WIDGET',
    ],
    [
      COMPANY_RECORD_PAGE_TAGLINE_TAB_ID,
      'STANDARD_COMPANY_RECORD_PAGE_TAGLINE_TAB',
    ],
    [TICKETS_NAVIGATION_FOLDER_ID, 'TICKETS_NAVIGATION_FOLDER'],
    [TICKETS_NAVIGATION_ITEM_ID, 'TICKETS_NAVIGATION_ITEM'],
    [
      TICKETS_INDEX_VIEW_NAVIGATION_ITEM_ID,
      'TICKETS_INDEX_VIEW_NAVIGATION_ITEM',
    ],
    [
      TICKET_RECORD_PAGE_HOME_DOCS_WIDGET_ID,
      'TICKET_RECORD_PAGE_HOME_DOCS_WIDGET',
    ],
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

const TICKET_INDEX_VIEW_ID = getSystemViewUniversalIdentifier({
  objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
  objectUniversalIdentifier: TICKET_OBJECT_ID,
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

const ticketPageLayout: PageLayoutManifest = {
  universalIdentifier: TICKET_PAGE_LAYOUT_ID,
  name: 'Ticket page',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: TICKET_OBJECT_ID,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
    TICKET_PAGE_OVERVIEW_TAB_ID,
  tabs: [
    {
      universalIdentifier: TICKET_PAGE_OVERVIEW_TAB_ID,
      title: 'Overview',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: TICKET_PAGE_FIELDS_WIDGET_ID,
          title: 'Fields',
          type: WidgetType.FIELDS,
          objectUniversalIdentifier: TICKET_OBJECT_ID,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: OPEN_TICKETS_VIEW_ID,
            newFieldDefaultVisibility: true,
          },
        },
      ],
    },
  ],
};

const ticketBoardLayout: PageLayoutManifest = {
  universalIdentifier: TICKET_BOARD_LAYOUT_ID,
  name: 'Ticket board',
  type: PageLayoutType.STANDALONE_PAGE,
  tabs: [
    {
      universalIdentifier: TICKET_BOARD_TAB_ID,
      title: 'Board',
      position: 0,
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: TICKET_BOARD_DOCS_WIDGET_ID,
          title: 'Docs',
          type: WidgetType.IFRAME,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID,
            row: 0,
            column: 0,
            rowSpan: 4,
            columnSpan: 6,
          },
          configuration: {
            configurationType: 'IFRAME',
            url: 'https://example.com/tickets',
          },
        },
      ],
    },
  ],
};

const TICKET_RECORD_PAGE_LAYOUT_ID =
  getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
    objectUniversalIdentifier: TICKET_OBJECT_ID,
  });

const ticketRecordPageExtraTab: PageLayoutTabManifest = {
  universalIdentifier: TICKET_RECORD_PAGE_EXTRA_TAB_ID,
  pageLayoutUniversalIdentifier: TICKET_RECORD_PAGE_LAYOUT_ID,
  title: 'Extra',
  position: 60,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: TICKET_RECORD_PAGE_EXTRA_NOTES_WIDGET_ID,
      title: 'Notes',
      type: WidgetType.NOTES,
      objectUniversalIdentifier: TICKET_OBJECT_ID,
      position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
      configuration: { configurationType: 'NOTES' },
    },
  ],
};

const companyRecordPageTaglineTab: PageLayoutTabManifest = {
  universalIdentifier: COMPANY_RECORD_PAGE_TAGLINE_TAB_ID,
  pageLayoutUniversalIdentifier: getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
  }),
  title: 'Tagline',
  position: 60,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
};

const ticketRecordPageHomeDocsWidget: StandalonePageLayoutWidgetManifest = {
  universalIdentifier: TICKET_RECORD_PAGE_HOME_DOCS_WIDGET_ID,
  pageLayoutTabUniversalIdentifier: getSystemPageLayoutTabUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
    pageLayoutUniversalIdentifier: TICKET_RECORD_PAGE_LAYOUT_ID,
    title: 'Home',
  }),
  title: 'Docs',
  type: WidgetType.IFRAME,
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1 },
  configuration: {
    configurationType: 'IFRAME',
    url: 'https://example.com/tickets/docs',
  },
};

const ticketsNavigationFolder: NavigationMenuItemManifest = {
  universalIdentifier: TICKETS_NAVIGATION_FOLDER_ID,
  type: NavigationMenuItemType.FOLDER,
  name: 'Support',
  position: 40,
};

const ticketsNavigationItem: NavigationMenuItemManifest = {
  universalIdentifier: TICKETS_NAVIGATION_ITEM_ID,
  type: NavigationMenuItemType.OBJECT,
  position: 41,
  icon: 'IconTicket',
  folderUniversalIdentifier: TICKETS_NAVIGATION_FOLDER_ID,
  targetObjectUniversalIdentifier: TICKET_OBJECT_ID,
};

const ticketsIndexViewNavigationItem: NavigationMenuItemManifest = {
  universalIdentifier: TICKETS_INDEX_VIEW_NAVIGATION_ITEM_ID,
  type: NavigationMenuItemType.VIEW,
  position: 42,
  name: 'All tickets',
  icon: 'IconList',
  folderUniversalIdentifier: TICKETS_NAVIGATION_FOLDER_ID,
  viewUniversalIdentifier: TICKET_INDEX_VIEW_ID,
};

const manifest = buildBaseManifest({
  appId: TEST_APP_ID,
  roleId: TEST_ROLE_ID,
  overrides: {
    translations: FIXTURE_TRANSLATIONS,
    permissionFlags: [
      {
        universalIdentifier: EXPORT_TICKETS_PERMISSION_FLAG_ID,
        key: 'EXPORT_TICKETS',
        label: 'Export tickets',
        permissionType: 'settings',
      },
    ],
    roles: [
      {
        universalIdentifier: TEST_ROLE_ID,
        label: 'Test Role',
        description: 'A test role',
        canReadAllObjectRecords: true,
        canBeAssignedToApiKeys: false,
        objectPermissions: [
          {
            universalIdentifier: TEST_ROLE_TICKET_OBJECT_PERMISSION_ID,
            objectUniversalIdentifier: TICKET_OBJECT_ID,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
          },
        ],
        fieldPermissions: [
          {
            universalIdentifier: TEST_ROLE_TICKET_TITLE_FIELD_PERMISSION_ID,
            objectUniversalIdentifier: TICKET_OBJECT_ID,
            fieldUniversalIdentifier: TICKET_TITLE_FIELD_ID,
            canUpdateFieldValue: false,
          },
        ],
        rowLevelPermissionPredicateGroups: [
          {
            universalIdentifier: TEST_ROLE_TICKET_PREDICATE_GROUP_ID,
            objectUniversalIdentifier: TICKET_OBJECT_ID,
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
            position: 0,
          },
          {
            universalIdentifier: TEST_ROLE_TICKET_CHILD_PREDICATE_GROUP_ID,
            objectUniversalIdentifier: TICKET_OBJECT_ID,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentPredicateGroupUniversalIdentifier:
              TEST_ROLE_TICKET_PREDICATE_GROUP_ID,
            position: 1,
          },
        ],
        rowLevelPermissionPredicates: [
          {
            universalIdentifier: TEST_ROLE_TICKET_TITLE_PREDICATE_ID,
            objectUniversalIdentifier: TICKET_OBJECT_ID,
            fieldUniversalIdentifier: TICKET_TITLE_FIELD_ID,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'bug',
            predicateGroupUniversalIdentifier:
              TEST_ROLE_TICKET_CHILD_PREDICATE_GROUP_ID,
            position: 0,
          },
        ],
        permissionFlagUniversalIdentifiers: [
          EXPORT_TICKETS_PERMISSION_FLAG_ID,
          SystemPermissionFlag.WORKSPACE,
        ],
      },
    ],
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
    pageLayouts: [ticketPageLayout, ticketBoardLayout],
    pageLayoutTabs: [ticketRecordPageExtraTab, companyRecordPageTaglineTab],
    pageLayoutWidgets: [ticketRecordPageHomeDocsWidget],
    navigationMenuItems: [
      ticketsNavigationFolder,
      ticketsNavigationItem,
      ticketsIndexViewNavigationItem,
    ],
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
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TEST_ROLE_TICKET_OBJECT_PERMISSION_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TEST_ROLE_TICKET_TITLE_FIELD_PERMISSION_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(EXPORT_TICKETS_PERMISSION_FLAG_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TEST_ROLE_TICKET_PREDICATE_GROUP_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TEST_ROLE_TICKET_CHILD_PREDICATE_GROUP_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TEST_ROLE_TICKET_TITLE_PREDICATE_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TICKET_INDEX_VIEW_ID)).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(PROJECT_INDEX_VIEW_ID)).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(PROJECT_INDEX_VIEW_FIELD_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TICKET_RECORD_PAGE_LAYOUT_ID)).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(TICKET_RECORD_PAGE_EXTRA_TAB_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TICKET_RECORD_PAGE_HOME_DOCS_WIDGET_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TICKETS_NAVIGATION_FOLDER_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TICKETS_NAVIGATION_ITEM_ID)).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(TICKETS_INDEX_VIEW_NAVIGATION_ITEM_ID)).toBe(
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

    expect(errors?.[0]?.extensions?.subCode).toBe('APPLICATION_NOT_FOUND');
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

  it('should round-trip a role with object, field and flag permissions created through the metadata API in the workspace Custom application without any action', async () => {
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

    const { data: createdRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Export Custom Application Recruiter',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
      },
    });
    const createdRoleId = createdRoleData.createOneRole.id;

    try {
      await upsertObjectPermissions({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          objectPermissions: [
            {
              objectMetadataId: personObject.id,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
            },
          ],
        },
      });
      await upsertFieldPermissions({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          fieldPermissions: [
            {
              objectMetadataId: personObject.id,
              fieldMetadataId: personJobTitleField.id,
              canUpdateFieldValue: false,
            },
          ],
        },
      });
      await upsertPermissionFlags({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          permissionFlagKeys: [PermissionFlagType.EXPORT_CSV],
        },
      });

      const predicateGroupId = v4();
      const keptPredicateId = v4();
      const removedPredicateId = v4();
      const predicateGroupInput = {
        id: predicateGroupId,
        objectMetadataId: personObject.id,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      };
      const keptPredicateInput = {
        id: keptPredicateId,
        fieldMetadataId: personJobTitleField.id,
        operand: RowLevelPermissionPredicateOperand.CONTAINS,
        value: 'Engineer',
        rowLevelPermissionPredicateGroupId: predicateGroupId,
        positionInRowLevelPermissionPredicateGroup: 0,
      };

      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          objectMetadataId: personObject.id,
          predicateGroups: [predicateGroupInput],
          predicates: [
            keptPredicateInput,
            {
              id: removedPredicateId,
              fieldMetadataId: personJobTitleField.id,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Manager',
              rowLevelPermissionPredicateGroupId: predicateGroupId,
              positionInRowLevelPermissionPredicateGroup: 1,
            },
          ],
        },
      });
      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          objectMetadataId: personObject.id,
          predicateGroups: [predicateGroupInput],
          predicates: [keptPredicateInput],
        },
      });

      const { data } = await exportApplication({
        universalIdentifier: customApplication.universalIdentifier,
        expectToFail: false,
      });

      expect(data.exportApplication.manifest.roles).toContainEqual(
        expect.objectContaining({
          label: 'Export Custom Application Recruiter',
          objectPermissions: [
            expect.objectContaining({
              objectUniversalIdentifier:
                STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
            }),
          ],
          fieldPermissions: [
            expect.objectContaining({
              objectUniversalIdentifier:
                STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
              canUpdateFieldValue: false,
            }),
          ],
          rowLevelPermissionPredicateGroups: [
            expect.objectContaining({
              universalIdentifier: predicateGroupId,
              objectUniversalIdentifier:
                STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            }),
          ],
          rowLevelPermissionPredicates: [
            expect.objectContaining({
              universalIdentifier: keptPredicateId,
              objectUniversalIdentifier:
                STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Engineer',
              predicateGroupUniversalIdentifier: predicateGroupId,
              position: 0,
            }),
          ],
          permissionFlagUniversalIdentifiers: [SystemPermissionFlag.EXPORT_CSV],
        }),
      );
      expect(
        data.exportApplication.coverage.find(
          ({ universalIdentifier }) =>
            universalIdentifier === removedPredicateId,
        ),
      ).toBeUndefined();

      const dryRun = await syncApplication({
        manifest: data.exportApplication.manifest,
        dryRun: true,
        inferDeletionFromMissingEntities: false,
        expectToFail: false,
      });

      expect(dryRun.errors).toBeUndefined();
      expect(dryRun.data.syncApplication.actions).toEqual([]);

      const deletionInferringDryRun = await syncApplication({
        manifest: data.exportApplication.manifest,
        dryRun: true,
        expectToFail: false,
      });

      expect(deletionInferringDryRun.errors).toBeUndefined();
      expect(
        deletionInferringDryRun.data.syncApplication.actions.filter(
          ({ metadataName }) =>
            metadataName === 'rowLevelPermissionPredicate' ||
            metadataName === 'rowLevelPermissionPredicateGroup',
        ),
      ).toEqual([]);
    } finally {
      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          objectMetadataId: personObject.id,
          predicateGroups: [],
          predicates: [],
        },
      });
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
    }
  }, 60000);
});

const WORKFLOW_TEST_APP_ID = '7e3d1c2b-0100-4a7b-8c9d-0e1f2a3b4c5d';
const WORKFLOW_TEST_ROLE_ID = '7e3d1c2b-0101-4a7b-8c9d-0e1f2a3b4c5d';
const INCIDENT_OBJECT_ID = '7e3d1c2b-0102-4a7b-8c9d-0e1f2a3b4c5d';
const INCIDENT_SEVERITY_FIELD_ID = '7e3d1c2b-0103-4a7b-8c9d-0e1f2a3b4c5d';
const ESCALATION_WORKFLOW_ID = '7e3d1c2b-0110-4a7b-8c9d-0e1f2a3b4c5d';
const NOTIFY_WORKFLOW_ID = '7e3d1c2b-0111-4a7b-8c9d-0e1f2a3b4c5d';
const NIGHTLY_WORKFLOW_ID = '7e3d1c2b-0112-4a7b-8c9d-0e1f2a3b4c5d';
const INTAKE_WORKFLOW_ID = '7e3d1c2b-0113-4a7b-8c9d-0e1f2a3b4c5d';
const workflowNodeIdentifier = (suffix: number) =>
  `7e3d1c2b-${(200 + suffix).toString().padStart(4, '0')}-4a7b-8c9d-0e1f2a3b4c5d`;

const SEVERITY_STEP_FILTERS = {
  stepFilterGroups: [{ id: 'group', logicalOperator: StepLogicalOperator.AND }],
  stepFilters: [
    {
      id: 'severity',
      type: 'TEXT',
      stepOutputKey: '{{trigger.properties.after.severity}}',
      operand: ViewFilterOperand.IS,
      value: 'high',
      stepFilterGroupId: 'group',
      fieldMetadataUniversalIdentifier: INCIDENT_SEVERITY_FIELD_ID,
    },
  ],
};

const EXPORTED_WORKFLOWS: WorkflowManifest[] = [
  {
    universalIdentifier: ESCALATION_WORKFLOW_ID,
    name: 'Escalate severe incidents',
    version: {
      trigger: {
        universalIdentifier: workflowNodeIdentifier(0),
        type: 'DATABASE_EVENT',
        nextStepIds: [workflowNodeIdentifier(1)],
        settings: {
          objectUniversalIdentifier: INCIDENT_OBJECT_ID,
          action: 'updated',
          fieldUniversalIdentifiers: [INCIDENT_SEVERITY_FIELD_ID],
          filter: SEVERITY_STEP_FILTERS,
        },
      },
      steps: [
        {
          universalIdentifier: workflowNodeIdentifier(1),
          name: 'Find severe incidents',
          type: 'FIND_RECORDS',
          nextStepIds: [workflowNodeIdentifier(2)],
          input: {
            objectUniversalIdentifier: INCIDENT_OBJECT_ID,
            limit: 5,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier: INCIDENT_SEVERITY_FIELD_ID,
                  operand: ViewFilterOperand.IS,
                  value: 'high',
                },
              ],
            },
            orderBy: {
              recordSorts: [
                {
                  fieldMetadataUniversalIdentifier: INCIDENT_SEVERITY_FIELD_ID,
                  direction: 'DESC',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: workflowNodeIdentifier(2),
          name: 'Is severe',
          type: 'IF_ELSE',
          nextStepIds: [],
          input: {
            ...SEVERITY_STEP_FILTERS,
            branches: [
              {
                id: 'severe',
                nextStepIds: [workflowNodeIdentifier(3)],
                filterGroupId: 'group',
              },
              { id: 'otherwise', nextStepIds: [workflowNodeIdentifier(4)] },
            ],
          },
        },
        {
          universalIdentifier: workflowNodeIdentifier(3),
          name: 'Open a company follow-up',
          type: 'CREATE_RECORD',
          nextStepIds: [],
          input: {
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
            objectRecord: { name: 'Escalation' },
          },
        },
        {
          universalIdentifier: workflowNodeIdentifier(4),
          name: 'Nothing to do',
          type: 'EMPTY',
          nextStepIds: [],
          input: {},
        },
      ],
    },
  },
  {
    universalIdentifier: NOTIFY_WORKFLOW_ID,
    name: 'Notify on-call',
    version: {
      trigger: {
        universalIdentifier: workflowNodeIdentifier(10),
        type: 'MANUAL',
        nextStepIds: [workflowNodeIdentifier(11)],
        settings: {
          availability: {
            type: 'SINGLE_RECORD',
            objectUniversalIdentifier: INCIDENT_OBJECT_ID,
          },
          icon: 'IconBell',
          isPinned: true,
        },
      },
      steps: [
        {
          universalIdentifier: workflowNodeIdentifier(11),
          name: 'Call the pager',
          type: 'HTTP_REQUEST',
          nextStepIds: [],
          position: { x: 120, y: 240 },
          errorHandlingOptions: {
            retryOnFailure: { value: 2 },
            continueOnFailure: { value: true },
          },
          input: {
            method: 'POST',
            url: 'https://example.com/pager',
            body: { incident: '{{trigger.record.id}}' },
          },
        },
      ],
    },
  },
  {
    universalIdentifier: NIGHTLY_WORKFLOW_ID,
    name: 'Nightly digest',
    version: {
      trigger: {
        universalIdentifier: workflowNodeIdentifier(20),
        type: 'CRON',
        nextStepIds: [workflowNodeIdentifier(21)],
        settings: { type: 'DAYS', schedule: { day: 1, hour: 3, minute: 15 } },
      },
      steps: [
        {
          universalIdentifier: workflowNodeIdentifier(21),
          name: 'Wait',
          type: 'DELAY',
          nextStepIds: [],
          input: { delayType: 'DURATION', duration: { minutes: 5 } },
        },
      ],
    },
  },
  {
    universalIdentifier: INTAKE_WORKFLOW_ID,
    name: 'Incident intake',
    version: {
      trigger: {
        universalIdentifier: workflowNodeIdentifier(30),
        type: 'WEBHOOK',
        nextStepIds: [workflowNodeIdentifier(31)],
        settings: {
          httpMethod: 'POST',
          expectedBody: { severity: 'high' },
        },
      },
      steps: [
        {
          universalIdentifier: workflowNodeIdentifier(31),
          name: 'Review',
          type: 'FORM',
          nextStepIds: [],
          input: [
            {
              id: 'summary',
              name: 'summary',
              label: 'Summary',
              type: FieldMetadataType.TEXT,
            },
            {
              id: 'incident',
              name: 'incident',
              label: 'Incident',
              type: 'RECORD',
              settings: { objectUniversalIdentifier: INCIDENT_OBJECT_ID },
            },
          ],
        },
      ],
    },
  },
];

const workflowsManifest = buildBaseManifest({
  appId: WORKFLOW_TEST_APP_ID,
  roleId: WORKFLOW_TEST_ROLE_ID,
  overrides: {
    objects: [
      buildDefaultObjectManifest({
        universalIdentifier: INCIDENT_OBJECT_ID,
        nameSingular: 'exportIncident',
        namePlural: 'exportIncidents',
        labelSingular: 'Incident',
        labelPlural: 'Incidents',
        applicationUniversalIdentifier: WORKFLOW_TEST_APP_ID,
        additionalFields: [
          {
            universalIdentifier: INCIDENT_SEVERITY_FIELD_ID,
            name: 'severity',
            label: 'Severity',
            type: FieldMetadataType.TEXT,
          },
        ],
      }),
    ],
    workflows: EXPORTED_WORKFLOWS,
  },
});

describe('Application export - workflows', () => {
  beforeAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: WORKFLOW_TEST_APP_ID,
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: WORKFLOW_TEST_APP_ID,
      name: 'Export Workflows Test Application',
      description: 'App for testing the workflow export',
      sourcePath: 'export-workflows',
    });

    await syncApplication({
      manifest: workflowsManifest,
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: WORKFLOW_TEST_APP_ID,
    });
  });

  it('exports the synced workflows as they were declared', async () => {
    const { data, errors } = await exportApplication({
      universalIdentifier: WORKFLOW_TEST_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const { manifest: exportedManifest, coverage } = data.exportApplication;
    const statusOf = (universalIdentifier: string) =>
      coverage.find(
        (entry) => entry.universalIdentifier === universalIdentifier,
      )?.status;

    expect(exportedManifest.workflows).toEqual(
      [...EXPORTED_WORKFLOWS].sort((left, right) =>
        left.universalIdentifier.localeCompare(right.universalIdentifier),
      ),
    );

    for (const { universalIdentifier } of EXPORTED_WORKFLOWS) {
      expect(statusOf(universalIdentifier)).toBe(
        ApplicationExportCoverageStatus.EXPORTED,
      );
      expect(
        statusOf(
          getWorkflowVersionUniversalIdentifier({
            applicationUniversalIdentifier: WORKFLOW_TEST_APP_ID,
            workflowUniversalIdentifier: universalIdentifier,
          }),
        ),
      ).toBe(ApplicationExportCoverageStatus.ENGINE_DERIVED);
    }

    expect(
      statusOf(
        getWorkflowCommandMenuItemUniversalIdentifier({
          applicationUniversalIdentifier: WORKFLOW_TEST_APP_ID,
          workflowUniversalIdentifier: NOTIFY_WORKFLOW_ID,
        }),
      ),
    ).toBe(ApplicationExportCoverageStatus.ENGINE_DERIVED);
  }, 60000);

  it('round-trips the exported workflows through an additive dry-run sync without any action', async () => {
    const { data } = await exportApplication({
      universalIdentifier: WORKFLOW_TEST_APP_ID,
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
});

const AI_TEST_APP_ID = '7e3d1c2b-0300-4a7b-8c9d-0e1f2a3b4c5d';
const AI_TEST_ROLE_ID = '7e3d1c2b-0301-4a7b-8c9d-0e1f2a3b4c5d';
const TRIAGE_AGENT_ID = '7e3d1c2b-0302-4a7b-8c9d-0e1f2a3b4c5d';
const DIGEST_AGENT_ID = '7e3d1c2b-0303-4a7b-8c9d-0e1f2a3b4c5d';
const DIGEST_CRON_TRIGGER_ID = '7e3d1c2b-0304-4a7b-8c9d-0e1f2a3b4c5d';
const DIGEST_EVENT_TRIGGER_ID = '7e3d1c2b-0305-4a7b-8c9d-0e1f2a3b4c5d';
const TRIAGE_SKILL_ID = '7e3d1c2b-0306-4a7b-8c9d-0e1f2a3b4c5d';

const EXPORTED_AGENTS: AgentManifest[] = [
  {
    universalIdentifier: TRIAGE_AGENT_ID,
    name: 'export-triage-agent',
    label: 'Triage Agent',
    prompt: 'Triage the incoming request.',
    responseFormat: { type: 'text' },
    roleUniversalIdentifier: AI_TEST_ROLE_ID,
  },
  {
    universalIdentifier: DIGEST_AGENT_ID,
    name: 'export-digest-agent',
    label: 'Digest Agent',
    icon: 'IconRobot',
    description: 'Summarizes the week',
    prompt: 'Summarize what changed this week.',
    responseFormat: {
      type: 'json',
      schema: {
        type: 'object',
        properties: { summary: { type: 'string', description: 'Summary' } },
        required: ['summary'],
        additionalProperties: false,
      },
    },
    triggers: [
      {
        universalIdentifier: DIGEST_CRON_TRIGGER_ID,
        type: 'CRON',
        settings: { pattern: '0 9 * * 1' },
        isActive: false,
        instructions: 'Send the weekly digest',
      },
      {
        universalIdentifier: DIGEST_EVENT_TRIGGER_ID,
        type: 'DATABASE_EVENT',
        settings: { eventName: 'company.updated', updatedFields: ['name'] },
      },
    ],
  },
];

const EXPORTED_SKILLS: SkillManifest[] = [
  {
    universalIdentifier: TRIAGE_SKILL_ID,
    name: 'export-triage-skill',
    label: 'Triage',
    icon: 'IconBrain',
    description: 'How to triage requests',
    content: 'Classify the request, then route it.',
  },
];

const aiManifest = buildBaseManifest({
  appId: AI_TEST_APP_ID,
  roleId: AI_TEST_ROLE_ID,
  overrides: {
    roles: [
      {
        universalIdentifier: AI_TEST_ROLE_ID,
        label: 'Test Role',
        description: 'A test role',
        canBeAssignedToAgents: true,
      },
    ],
    agents: EXPORTED_AGENTS,
    skills: EXPORTED_SKILLS,
  },
});

describe('Application export - agents and skills', () => {
  beforeAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: AI_TEST_APP_ID,
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: AI_TEST_APP_ID,
      name: 'Export Agents Test Application',
      description: 'App for testing the agent and skill export',
      sourcePath: 'export-agents',
    });

    await syncApplication({ manifest: aiManifest, expectToFail: false });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: AI_TEST_APP_ID,
    });
  });

  it('exports the synced agents and skills as they were declared', async () => {
    const { data, errors } = await exportApplication({
      universalIdentifier: AI_TEST_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const { manifest: exportedManifest, coverage } = data.exportApplication;
    const statusOf = (universalIdentifier: string) =>
      coverage.find(
        (entry) => entry.universalIdentifier === universalIdentifier,
      )?.status;

    expect(exportedManifest.agents).toEqual(EXPORTED_AGENTS);
    expect(exportedManifest.skills).toEqual(EXPORTED_SKILLS);

    for (const universalIdentifier of [
      TRIAGE_AGENT_ID,
      DIGEST_AGENT_ID,
      TRIAGE_SKILL_ID,
      getRoleTargetUniversalIdentifier({
        applicationUniversalIdentifier: AI_TEST_APP_ID,
        agentUniversalIdentifier: TRIAGE_AGENT_ID,
      }),
    ]) {
      expect(statusOf(universalIdentifier)).toBe(
        ApplicationExportCoverageStatus.EXPORTED,
      );
    }
  }, 60000);

  it('round-trips the exported agents and skills through an additive dry-run sync without any action', async () => {
    const { data } = await exportApplication({
      universalIdentifier: AI_TEST_APP_ID,
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
});
