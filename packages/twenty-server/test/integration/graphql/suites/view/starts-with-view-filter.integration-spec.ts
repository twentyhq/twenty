import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { destroyOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/destroy-one-view-filter.util';
import { findViewFilters } from 'test/integration/metadata/suites/view-filter/utils/find-view-filters.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  FieldMetadataType,
  ViewFilterOperand,
  ViewType,
} from 'twenty-shared/types';
import {
  type FieldShared,
  turnRecordFilterIntoRecordGqlOperationFilter,
} from 'twenty-shared/utils';

const TEST_COMPANY_IDS = {
  LOWER_CASE_PREFIX: '20202020-cccc-4000-8000-200000000001',
  MIXED_CASE_PREFIX: '20202020-cccc-4000-8000-200000000002',
  DIFFERENT_PREFIX: '20202020-cccc-4000-8000-200000000003',
  LITERAL_WILDCARDS: '20202020-cccc-4000-8000-200000000004',
  WILDCARD_FALSE_POSITIVE: '20202020-cccc-4000-8000-200000000005',
} as const;

const ALL_TEST_COMPANY_IDS = Object.values(TEST_COMPANY_IDS);

describe('STARTS_WITH view filter persistence and record query', () => {
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let testViewId: string;
  let testViewFilterId: string | undefined;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
          type
          label
        }
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObject = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObject);
    companyObjectMetadataId = companyObject.id;

    const companyNameField = companyObject.fieldsList?.find(
      (field: { name: string; type: string }) =>
        field.name === 'name' && field.type === FieldMetadataType.TEXT,
    );

    jestExpectToBeDefined(companyNameField);
    companyNameFieldMetadataId = companyNameField.id;

    const { data: viewData, errors: viewErrors } = await createOneView({
      expectToFail: false,
      input: {
        name: 'STARTS_WITH View Filter Integration Test',
        objectMetadataId: companyObjectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconFilter',
      },
    });

    expect(viewErrors).toBeUndefined();
    testViewId = viewData.createView.id;

    const createCompaniesResponse = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id name',
        data: [
          {
            id: TEST_COMPANY_IDS.LOWER_CASE_PREFIX,
            name: 'acme Alpha',
          },
          {
            id: TEST_COMPANY_IDS.MIXED_CASE_PREFIX,
            name: 'AcMe Beta',
          },
          {
            id: TEST_COMPANY_IDS.DIFFERENT_PREFIX,
            name: 'Acorn',
          },
          {
            id: TEST_COMPANY_IDS.LITERAL_WILDCARDS,
            name: '100%_\\Path Alpha',
          },
          {
            id: TEST_COMPANY_IDS.WILDCARD_FALSE_POSITIVE,
            name: '100anythingXPath Beta',
          },
        ],
        upsert: true,
      }),
    );

    expect(createCompaniesResponse.body.errors).toBeUndefined();
  });

  afterEach(async () => {
    if (!testViewFilterId) {
      return;
    }

    await destroyOneViewFilter({
      expectToFail: false,
      input: { id: testViewFilterId },
    });
    testViewFilterId = undefined;
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_COMPANY_IDS } },
      }),
    );

    if (testViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: testViewId,
      });
    }
  });

  it.each([
    {
      filterValue: 'ACM',
      expectedCompanyIds: [
        TEST_COMPANY_IDS.LOWER_CASE_PREFIX,
        TEST_COMPANY_IDS.MIXED_CASE_PREFIX,
      ],
      description: 'matches prefixes without regard to case',
    },
    {
      filterValue: '100%_\\Path',
      expectedCompanyIds: [TEST_COMPANY_IDS.LITERAL_WILDCARDS],
      description: 'treats ILIKE metacharacters as literal characters',
    },
  ])('$description', async ({ filterValue, expectedCompanyIds }) => {
    const { data: createData, errors: createErrors } =
      await createOneViewFilter({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: companyNameFieldMetadataId,
          operand: ViewFilterOperand.STARTS_WITH,
          value: filterValue,
        },
      });

    expect(createErrors).toBeUndefined();
    testViewFilterId = createData.createViewFilter.id;

    const { data: findData, errors: findErrors } = await findViewFilters({
      expectToFail: false,
      viewId: testViewId,
    });

    expect(findErrors).toBeUndefined();

    const persistedViewFilter = findData.getViewFilters.find(
      (viewFilter) => viewFilter.id === testViewFilterId,
    );

    jestExpectToBeDefined(persistedViewFilter);
    expect(persistedViewFilter).toMatchObject({
      fieldMetadataId: companyNameFieldMetadataId,
      operand: ViewFilterOperand.STARTS_WITH,
      value: filterValue,
      viewId: testViewId,
    });

    if (typeof persistedViewFilter.value !== 'string') {
      throw new Error(
        'Expected the persisted view filter value to be a string',
      );
    }

    const fieldMetadataItemById = new Map<string, FieldShared>([
      [
        companyNameFieldMetadataId,
        {
          id: companyNameFieldMetadataId,
          name: 'name',
          type: FieldMetadataType.TEXT,
          label: 'Name',
        },
      ],
    ]);

    const recordGqlOperationFilter =
      turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies: {},
        fieldMetadataItemById,
        recordFilter: {
          fieldMetadataId: persistedViewFilter.fieldMetadataId,
          operand: persistedViewFilter.operand,
          type: 'TEXT',
          value: persistedViewFilter.value,
        },
      });

    jestExpectToBeDefined(recordGqlOperationFilter);

    const response = await makeGraphqlAPIRequest({
      query: gql`
        query Companies($filter: CompanyFilterInput) {
          companies(filter: $filter, first: 50) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      variables: {
        filter: {
          and: [{ id: { in: ALL_TEST_COMPANY_IDS } }, recordGqlOperationFilter],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const returnedCompanyIds = response.body.data.companies.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(returnedCompanyIds.sort()).toEqual(expectedCompanyIds.sort());
  });
});
