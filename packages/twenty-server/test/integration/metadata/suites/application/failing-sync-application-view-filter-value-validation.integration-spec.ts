import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type ObjectManifest,
  type ViewFilterManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  FieldMetadataType,
  ViewFilterOperand,
  ViewType,
} from 'twenty-shared/types';

const TEST_APP_ID = 'd1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'd1b2c3d4-0002-4000-a000-000000000002';
const TEST_OBJECT_ID = 'd1b2c3d4-0003-4000-a000-000000000003';
const TEST_VIEW_ID = 'd1b2c3d4-0004-4000-a000-000000000004';
const TEST_VIEW_FILTER_ID = 'd1b2c3d4-0005-4000-a000-000000000005';

const NAME_FIELD_ID = 'd1b2c3d4-0100-4000-a000-000000000001';
const DATE_FIELD_ID = 'd1b2c3d4-0100-4000-a000-000000000002';
const NUMBER_FIELD_ID = 'd1b2c3d4-0100-4000-a000-000000000003';
const BOOLEAN_FIELD_ID = 'd1b2c3d4-0100-4000-a000-000000000004';
const SELECT_FIELD_ID = 'd1b2c3d4-0100-4000-a000-000000000005';

const SELECT_OPTION_ID = 'd1b2c3d4-0200-4000-a000-000000000001';

const buildObject = (): ObjectManifest => ({
  universalIdentifier: TEST_OBJECT_ID,
  nameSingular: 'filterValueSubject',
  namePlural: 'filterValueSubjects',
  labelSingular: 'Filter Value Subject',
  labelPlural: 'Filter Value Subjects',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: NAME_FIELD_ID,
      name: 'name',
      label: 'Name',
      type: FieldMetadataType.TEXT,
    },
    {
      universalIdentifier: DATE_FIELD_ID,
      name: 'expiresAt',
      label: 'Expires At',
      type: FieldMetadataType.DATE,
    },
    {
      universalIdentifier: NUMBER_FIELD_ID,
      name: 'seatCount',
      label: 'Seat Count',
      type: FieldMetadataType.NUMBER,
    },
    {
      universalIdentifier: BOOLEAN_FIELD_ID,
      name: 'isActive',
      label: 'Is Active',
      type: FieldMetadataType.BOOLEAN,
    },
    {
      universalIdentifier: SELECT_FIELD_ID,
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.SELECT,
      options: [
        {
          id: SELECT_OPTION_ID,
          label: 'Won',
          value: 'WON',
          position: 0,
          color: 'green',
        },
      ],
    },
  ],
});

const buildView = (viewFilter: ViewFilterManifest): ViewManifest => ({
  universalIdentifier: TEST_VIEW_ID,
  name: 'Filter Value View',
  objectUniversalIdentifier: TEST_OBJECT_ID,
  type: ViewType.TABLE,
  filters: [viewFilter],
});

type TestContext = {
  viewFilter: ViewFilterManifest;
};

const failingViewFilterValueSyncTestCases: EachTestingContext<TestContext>[] = [
  {
    title:
      'when an IS_RELATIVE filter uses the relative date object form instead of its stringified form',
    context: {
      viewFilter: {
        universalIdentifier: TEST_VIEW_FILTER_ID,
        fieldMetadataUniversalIdentifier: DATE_FIELD_ID,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: { direction: 'NEXT', amount: 30, unit: 'DAY' },
      },
    },
  },
  {
    title: 'when an IS_RELATIVE filter has no amount',
    context: {
      viewFilter: {
        universalIdentifier: TEST_VIEW_FILTER_ID,
        fieldMetadataUniversalIdentifier: DATE_FIELD_ID,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'NEXT__DAY',
      },
    },
  },
  {
    title: 'when a DATE filter is not an ISO date',
    context: {
      viewFilter: {
        universalIdentifier: TEST_VIEW_FILTER_ID,
        fieldMetadataUniversalIdentifier: DATE_FIELD_ID,
        operand: ViewFilterOperand.IS,
        value: '31/01/2026',
      },
    },
  },
  {
    title: 'when a NUMBER filter is not a number',
    context: {
      viewFilter: {
        universalIdentifier: TEST_VIEW_FILTER_ID,
        fieldMetadataUniversalIdentifier: NUMBER_FIELD_ID,
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: 'thirty',
      },
    },
  },
  {
    title: 'when a NUMBER filter has trailing characters',
    context: {
      viewFilter: {
        universalIdentifier: TEST_VIEW_FILTER_ID,
        fieldMetadataUniversalIdentifier: NUMBER_FIELD_ID,
        operand: ViewFilterOperand.IS,
        value: '30abc',
      },
    },
  },
  {
    title: 'when a BOOLEAN filter is neither true nor false',
    context: {
      viewFilter: {
        universalIdentifier: TEST_VIEW_FILTER_ID,
        fieldMetadataUniversalIdentifier: BOOLEAN_FIELD_ID,
        operand: ViewFilterOperand.IS,
        value: 'yes',
      },
    },
  },
  {
    title: 'when a SELECT filter is an object rather than an array of options',
    context: {
      viewFilter: {
        universalIdentifier: TEST_VIEW_FILTER_ID,
        fieldMetadataUniversalIdentifier: SELECT_FIELD_ID,
        operand: ViewFilterOperand.IS,
        value: { stage: 'WON' },
      },
    },
  },
];

describe('Sync application should fail on invalid view filter values', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid View Filter Value App',
      description: 'App for testing view filter value manifest validation',
      sourcePath: 'test-invalid-view-filter-value',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingViewFilterValueSyncTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildBaseManifest({
          appId: TEST_APP_ID,
          roleId: TEST_ROLE_ID,
          overrides: {
            objects: [buildObject()],
            views: [buildView(context.viewFilter)],
          },
        }),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );

  it('should sync the same view filters once their values are valid', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: {
          objects: [buildObject()],
          views: [
            {
              ...buildView({
                universalIdentifier: TEST_VIEW_FILTER_ID,
                fieldMetadataUniversalIdentifier: DATE_FIELD_ID,
                operand: ViewFilterOperand.IS_RELATIVE,
                value: 'NEXT_30_DAY',
              }),
            },
          ],
        },
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  }, 60000);
});
