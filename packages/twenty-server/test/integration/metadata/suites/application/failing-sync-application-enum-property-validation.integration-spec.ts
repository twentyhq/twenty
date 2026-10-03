import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type CommandMenuItemManifest,
  type FieldManifest,
  type FrontComponentManifest,
  type IndexManifest,
  type Manifest,
  type ObjectManifest,
  type PageLayoutManifest,
  type RoleManifest,
  type StandalonePageLayoutWidgetManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  ViewFilterGroupLogicalOperator,
  ViewType,
} from 'twenty-shared/types';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

const TEST_APP_ID = 'e7a1c2d3-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'e7a1c2d3-0002-4000-a000-000000000002';
const TEST_OBJECT_ID = 'e7a1c2d3-0003-4000-a000-000000000003';
const TEST_VIEW_ID = 'e7a1c2d3-0004-4000-a000-000000000004';
const TEST_VIEW_FIELD_ID = 'e7a1c2d3-0005-4000-a000-000000000005';
const TEST_VIEW_FILTER_GROUP_ID = 'e7a1c2d3-0006-4000-a000-000000000006';
const TEST_OBJECT_PERMISSION_ID = 'e7a1c2d3-0007-4000-a000-000000000007';
const TEST_PREDICATE_GROUP_ID = 'e7a1c2d3-0008-4000-a000-000000000008';
const TEST_PREDICATE_ID = 'e7a1c2d3-0009-4000-a000-000000000009';
const TEST_PAGE_LAYOUT_ID = 'e7a1c2d3-000a-4000-a000-00000000000a';
const TEST_INDEX_ID = 'e7a1c2d3-000b-4000-a000-00000000000b';
const TEST_INDEX_FIELD_ID = 'e7a1c2d3-000c-4000-a000-00000000000c';
const TEST_WIDGET_ID = 'e7a1c2d3-000d-4000-a000-00000000000d';
const TEST_FRONT_COMPONENT_ID = 'e7a1c2d3-000e-4000-a000-00000000000e';
const TEST_COMMAND_MENU_ITEM_ID = 'e7a1c2d3-000f-4000-a000-00000000000f';

const NAME_FIELD_ID = 'e7a1c2d3-0100-4000-a000-000000000001';
const CODE_FIELD_ID = 'e7a1c2d3-0100-4000-a000-000000000002';
const INVALID_FIELD_ID = 'e7a1c2d3-0100-4000-a000-000000000003';

const STANDARD_PERSON_HOME_TAB_UNIVERSAL_ID =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
    .universalIdentifier;

// Manifests are untrusted JSON, so the patches deliberately bypass the enum types
type ManifestPatch<TManifest> = Partial<Record<keyof TManifest, unknown>>;

const buildField = (patch: ManifestPatch<FieldManifest> = {}) =>
  ({
    universalIdentifier: INVALID_FIELD_ID,
    name: 'invalidEnumField',
    label: 'Invalid Enum Field',
    type: FieldMetadataType.TEXT,
    ...patch,
  }) as FieldManifest;

const buildObject = ({
  patch = {},
  codeFieldPatch = {},
  additionalFields = [],
}: {
  patch?: ManifestPatch<ObjectManifest>;
  codeFieldPatch?: ManifestPatch<FieldManifest>;
  additionalFields?: FieldManifest[];
} = {}) =>
  ({
    universalIdentifier: TEST_OBJECT_ID,
    nameSingular: 'enumSubject',
    namePlural: 'enumSubjects',
    labelSingular: 'Enum Subject',
    labelPlural: 'Enum Subjects',
    labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
    fields: [
      {
        universalIdentifier: NAME_FIELD_ID,
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
      },
      {
        universalIdentifier: CODE_FIELD_ID,
        name: 'code',
        label: 'Code',
        type: FieldMetadataType.TEXT,
        ...codeFieldPatch,
      },
      ...additionalFields,
    ],
    ...patch,
  }) as ObjectManifest;

const buildView = ({
  patch = {},
  viewFieldPatch = {},
  filterGroupPatch = {},
}: {
  patch?: ManifestPatch<ViewManifest>;
  viewFieldPatch?: Record<string, unknown>;
  filterGroupPatch?: Record<string, unknown>;
} = {}) =>
  ({
    universalIdentifier: TEST_VIEW_ID,
    name: 'Enum Subjects',
    objectUniversalIdentifier: TEST_OBJECT_ID,
    type: ViewType.TABLE,
    fields: [
      {
        universalIdentifier: TEST_VIEW_FIELD_ID,
        fieldMetadataUniversalIdentifier: NAME_FIELD_ID,
        position: 0,
        ...viewFieldPatch,
      },
    ],
    filterGroups: [
      {
        universalIdentifier: TEST_VIEW_FILTER_GROUP_ID,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        ...filterGroupPatch,
      },
    ],
    ...patch,
  }) as ViewManifest;

const buildRole = ({
  predicateGroupPatch = {},
  predicatePatch = {},
}: {
  predicateGroupPatch?: Record<string, unknown>;
  predicatePatch?: Record<string, unknown>;
} = {}) =>
  ({
    universalIdentifier: TEST_ROLE_ID,
    label: 'Enum Test Role',
    description: 'Role exercising row level predicates',
    objectPermissions: [
      {
        universalIdentifier: TEST_OBJECT_PERMISSION_ID,
        objectUniversalIdentifier: TEST_OBJECT_ID,
        canReadObjectRecords: true,
      },
    ],
    rowLevelPermissionPredicateGroups: [
      {
        universalIdentifier: TEST_PREDICATE_GROUP_ID,
        objectUniversalIdentifier: TEST_OBJECT_ID,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        ...predicateGroupPatch,
      },
    ],
    rowLevelPermissionPredicates: [
      {
        universalIdentifier: TEST_PREDICATE_ID,
        objectUniversalIdentifier: TEST_OBJECT_ID,
        fieldUniversalIdentifier: CODE_FIELD_ID,
        operand: RowLevelPermissionPredicateOperand.IS,
        value: 'ALLOWED',
        predicateGroupUniversalIdentifier: TEST_PREDICATE_GROUP_ID,
        ...predicatePatch,
      },
    ],
  }) as RoleManifest;

const buildPageLayout = (patch: ManifestPatch<PageLayoutManifest> = {}) =>
  ({
    universalIdentifier: TEST_PAGE_LAYOUT_ID,
    name: 'Enum Subject Record Page',
    type: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifier: TEST_OBJECT_ID,
    ...patch,
  }) as PageLayoutManifest;

const buildIndex = (patch: ManifestPatch<IndexManifest> = {}) =>
  ({
    universalIdentifier: TEST_INDEX_ID,
    objectUniversalIdentifier: TEST_OBJECT_ID,
    fields: [
      {
        universalIdentifier: TEST_INDEX_FIELD_ID,
        fieldUniversalIdentifier: CODE_FIELD_ID,
      },
    ],
    ...patch,
  }) as IndexManifest;

const buildStandaloneWidget = (
  patch: ManifestPatch<StandalonePageLayoutWidgetManifest> = {},
) =>
  ({
    universalIdentifier: TEST_WIDGET_ID,
    pageLayoutTabUniversalIdentifier: STANDARD_PERSON_HOME_TAB_UNIVERSAL_ID,
    title: 'Activity',
    type: 'TIMELINE',
    position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
    configuration: { configurationType: 'TIMELINE' },
    ...patch,
  }) as StandalonePageLayoutWidgetManifest;

const FRONT_COMPONENT: FrontComponentManifest = {
  universalIdentifier: TEST_FRONT_COMPONENT_ID,
  name: 'EnumCommand',
  description: 'Front component behind the command menu item',
  sourceComponentPath: 'src/front-components/enum-command.tsx',
  builtComponentPath: 'src/front-components/enum-command.mjs',
  builtComponentChecksum: 'enum-command-checksum',
  componentName: 'EnumCommand',
  isHeadless: false,
};

const buildCommandMenuItem = (
  patch: ManifestPatch<CommandMenuItemManifest> = {},
) =>
  ({
    universalIdentifier: TEST_COMMAND_MENU_ITEM_ID,
    label: 'Enum Command',
    frontComponentUniversalIdentifier: TEST_FRONT_COMPONENT_ID,
    ...patch,
  }) as CommandMenuItemManifest;

const buildManifest = (overrides: Partial<Manifest>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

type TestContext = {
  overrides: Partial<Manifest>;
};

// Every creation case is rejected while the migration is still being built,
// so nothing is persisted between cases and the front component needs no
// built file in storage.
const failingEnumPropertyCreationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when every object enum property is invalid',
      context: {
        overrides: {
          objects: [
            buildObject({
              patch: {
                writability: 'open',
                readability: 'PUBLIC',
                sharingReach: 'WORKSPACES',
                openRecordIn: 'side_panel',
              },
            }),
          ],
        },
      },
    },
    {
      title: 'when a field writability is unknown',
      context: {
        overrides: {
          objects: [
            buildObject({
              additionalFields: [buildField({ writability: 'READ_ONLY' })],
            }),
          ],
        },
      },
    },
    {
      title: 'when a field type is a typo',
      context: {
        overrides: {
          objects: [
            buildObject({ additionalFields: [buildField({ type: 'TEXTT' })] }),
          ],
        },
      },
    },
    {
      title:
        'when a field type is inherited from Object.prototype (constructor)',
      context: {
        overrides: {
          objects: [
            buildObject({
              additionalFields: [buildField({ type: 'constructor' })],
            }),
          ],
        },
      },
    },
    {
      title: 'when a field type is inherited from Object.prototype (toString)',
      context: {
        overrides: {
          objects: [
            buildObject({
              additionalFields: [buildField({ type: 'toString' })],
            }),
          ],
        },
      },
    },
    {
      title: 'when a view type is unknown',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ patch: { type: 'GRID' } })],
        },
      },
    },
    {
      title: 'when a view visibility is unknown',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ patch: { visibility: 'PUBLIC' } })],
        },
      },
    },
    {
      title: 'when a view openRecordIn comes from the object enum',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ patch: { openRecordIn: 'USER_CHOICE' } })],
        },
      },
    },
    {
      title: 'when a view calendarLayout is unknown',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ patch: { calendarLayout: 'YEAR' } })],
        },
      },
    },
    {
      title: 'when a view kanbanAggregateOperation is unknown',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ patch: { kanbanAggregateOperation: 'TOTAL' } })],
        },
      },
    },
    {
      title: 'when a view field aggregateOperation is lowercase',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ viewFieldPatch: { aggregateOperation: 'sum' } })],
        },
      },
    },
    {
      title: 'when a view filter group logicalOperator is unknown',
      context: {
        overrides: {
          objects: [buildObject()],
          views: [buildView({ filterGroupPatch: { logicalOperator: 'XOR' } })],
        },
      },
    },
    {
      title:
        'when a row level permission predicate group logicalOperator comes from the view filter group enum',
      context: {
        overrides: {
          objects: [buildObject()],
          roles: [
            buildRole({ predicateGroupPatch: { logicalOperator: 'NOT' } }),
          ],
        },
      },
    },
    {
      title: 'when a row level permission predicate operand is unknown',
      context: {
        overrides: {
          objects: [buildObject()],
          roles: [buildRole({ predicatePatch: { operand: 'EQUALS' } })],
        },
      },
    },
    {
      title: 'when a page layout type is a typo',
      context: {
        overrides: {
          objects: [buildObject()],
          pageLayouts: [buildPageLayout({ type: 'RECORD_PAGES' })],
        },
      },
    },
    {
      title:
        'when a page layout widget type is inherited from Object.prototype',
      context: {
        overrides: {
          pageLayoutWidgets: [buildStandaloneWidget({ type: 'constructor' })],
        },
      },
    },
    {
      title: 'when a command menu item availabilityType is lowercase',
      context: {
        overrides: {
          frontComponents: [FRONT_COMPONENT],
          commandMenuItems: [
            buildCommandMenuItem({ availabilityType: 'global' }),
          ],
        },
      },
    },
    {
      title: 'when an index type is not supported',
      context: {
        overrides: {
          objects: [buildObject()],
          indexes: [buildIndex({ indexType: 'HASH' })],
        },
      },
    },
  ];

describe('Sync application should fail on invalid enum values at creation', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid Enum Creation App',
      description: 'App for testing enum validation on manifest creation',
      sourcePath: 'test-invalid-enum-creation',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingEnumPropertyCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildManifest(context.overrides),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );
});

const buildValidUpdateOverrides = (): Partial<Manifest> => ({
  objects: [buildObject()],
  views: [buildView()],
  roles: [buildRole()],
  pageLayouts: [buildPageLayout()],
  indexes: [buildIndex()],
});

const failingEnumPropertyUpdateTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when an object openRecordIn is updated to a lowercase value',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        objects: [buildObject({ patch: { openRecordIn: 'record_page' } })],
      },
    },
  },
  {
    title: 'when an object sharingReach is updated to an unknown value',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        objects: [buildObject({ patch: { sharingReach: 'EVERYONE' } })],
      },
    },
  },
  {
    title: 'when a field writability is updated to an unknown value',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        objects: [buildObject({ codeFieldPatch: { writability: 'LOCKED' } })],
      },
    },
  },
  {
    title: 'when a view type is updated to an unknown value',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        views: [buildView({ patch: { type: 'BOARD' } })],
      },
    },
  },
  {
    title: 'when a view field aggregateOperation is updated to a typo',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        views: [
          buildView({ viewFieldPatch: { aggregateOperation: 'AVERAGE' } }),
        ],
      },
    },
  },
  {
    title: 'when a view filter group logicalOperator is updated to lowercase',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        views: [buildView({ filterGroupPatch: { logicalOperator: 'or' } })],
      },
    },
  },
  {
    title:
      'when a row level permission predicate group logicalOperator is updated to an unknown value',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        roles: [buildRole({ predicateGroupPatch: { logicalOperator: 'XOR' } })],
      },
    },
  },
  {
    title:
      'when a row level permission predicate operand is updated to lowercase',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        roles: [buildRole({ predicatePatch: { operand: 'is' } })],
      },
    },
  },
  {
    title: 'when a page layout type is updated to an unknown value',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        pageLayouts: [buildPageLayout({ type: 'HOME_PAGE' })],
      },
    },
  },
  {
    title: 'when an index type is updated to an unsupported value',
    context: {
      overrides: {
        ...buildValidUpdateOverrides(),
        indexes: [buildIndex({ indexType: 'gin' })],
      },
    },
  },
];

describe('Sync application should fail on invalid enum values at update', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid Enum Update App',
      description: 'App for testing enum validation on manifest update',
      sourcePath: 'test-invalid-enum-update',
    });

    const { errors } = await syncApplication({
      manifest: buildManifest(buildValidUpdateOverrides()),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingEnumPropertyUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildManifest(context.overrides),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );

  it('should still sync the valid manifest after the rejected updates', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest(buildValidUpdateOverrides()),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  }, 60000);
});
