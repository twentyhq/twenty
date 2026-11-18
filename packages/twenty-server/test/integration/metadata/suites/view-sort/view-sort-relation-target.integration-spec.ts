import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { findViewSortsOperationFactory } from 'test/integration/graphql/utils/find-view-sorts-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { destroyOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-view-sort.util';
import { updateOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/update-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { FieldMetadataType, ViewSortDirection } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type FieldNode = {
  id: string;
  name: string;
  object?: { id: string };
};

const RELATION_TARGET_VIEW_SORT_GQL_FIELDS = `
  ${VIEW_SORT_GQL_FIELDS}
  relationTargetFieldMetadataId
`;

const testContext = {
  dealObjectId: '',
  companyObjectId: '',
  dealCompanyFieldId: '',
  companyDealsFieldId: '',
  companyEmployeesFieldId: '',
  dealNextStepFieldId: '',
  dealViewId: '',
  companyViewId: '',
};

const createField = async ({
  objectMetadataId,
  name,
  type,
}: {
  objectMetadataId: string;
  name: string;
  type: FieldMetadataType;
}) => {
  const {
    data: {
      createOneField: { id },
    },
  } = await createOneFieldMetadata({
    expectToFail: false,
    input: {
      objectMetadataId,
      name,
      label: name,
      isLabelSyncedWithName: false,
      type,
    },
  });

  return id;
};

const createView = async (objectMetadataId: string) => {
  const {
    data: { createView },
  } = await createOneView({
    expectToFail: false,
    input: { name: 'Related sorts', icon: 'IconTable', objectMetadataId },
  });

  return createView.id;
};

const createRelationTargetViewSort = ({
  viewId,
  fieldMetadataId,
  relationTargetFieldMetadataId,
  expectToFail,
}: {
  viewId: string;
  fieldMetadataId: string;
  relationTargetFieldMetadataId: string;
  expectToFail: boolean;
}) =>
  createOneViewSort({
    expectToFail,
    gqlFields: RELATION_TARGET_VIEW_SORT_GQL_FIELDS,
    input: {
      viewId,
      fieldMetadataId,
      relationTargetFieldMetadataId,
      direction: ViewSortDirection.DESC,
    },
  });

const findViewSortIds = async (viewId: string): Promise<string[]> => {
  const response = await makeMetadataApiRequest(
    findViewSortsOperationFactory({ viewId }),
  );

  return response.body.data.getViewSorts.map(
    (viewSort: { id: string }) => viewSort.id,
  );
};

describe('View sort ordering by a field of the related record', () => {
  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: dealObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'sortedDeals',
        nameSingular: 'sortedDeal',
      }),
    });

    const {
      data: {
        createOneObject: { id: companyObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'sortedCompanies',
        nameSingular: 'sortedCompany',
      }),
    });

    const {
      data: {
        createOneField: { id: dealCompanyFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: dealObjectId,
        name: 'company',
        label: 'Company',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'Deals',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId: companyObjectId,
          targetFieldIcon: 'IconMoneybag',
        },
      },
    });

    const { fields } = await findManyFieldsMetadata({
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        name
        object {
          id
        }
      `,
    });

    const companyDealsField = fields
      .map(({ node }: { node: FieldNode }) => node)
      .find(
        (field: FieldNode) =>
          field.object?.id === companyObjectId && field.name === 'deals',
      );

    assertIsDefinedOrThrow(companyDealsField);

    testContext.dealObjectId = dealObjectId;
    testContext.companyObjectId = companyObjectId;
    testContext.dealCompanyFieldId = dealCompanyFieldId;
    testContext.companyDealsFieldId = companyDealsField.id;
    testContext.companyEmployeesFieldId = await createField({
      objectMetadataId: companyObjectId,
      name: 'employees',
      type: FieldMetadataType.NUMBER,
    });
    testContext.dealNextStepFieldId = await createField({
      objectMetadataId: dealObjectId,
      name: 'nextStep',
      type: FieldMetadataType.TEXT,
    });
    testContext.dealViewId = await createView(dealObjectId);
    testContext.companyViewId = await createView(companyObjectId);
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      testContext.dealObjectId,
      testContext.companyObjectId,
    ]) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        input: { idToDelete: objectMetadataId },
      });
    }
  });

  it('sorts by a field of the related record, then clears it on update', async () => {
    const {
      data: { createViewSort },
    } = await createRelationTargetViewSort({
      viewId: testContext.dealViewId,
      fieldMetadataId: testContext.dealCompanyFieldId,
      relationTargetFieldMetadataId: testContext.companyEmployeesFieldId,
      expectToFail: false,
    });

    expect(createViewSort.relationTargetFieldMetadataId).toBe(
      testContext.companyEmployeesFieldId,
    );

    const {
      data: { updateViewSort },
    } = await updateOneViewSort({
      expectToFail: false,
      gqlFields: RELATION_TARGET_VIEW_SORT_GQL_FIELDS,
      input: {
        id: createViewSort.id,
        update: { relationTargetFieldMetadataId: null },
      },
    });

    expect(updateViewSort.relationTargetFieldMetadataId).toBeNull();

    await destroyOneViewSort({
      expectToFail: false,
      input: { id: createViewSort.id },
    });
  });

  it.each([
    {
      title: 'is not a relation',
      getFieldId: () => testContext.dealNextStepFieldId,
      expectedMessage: 'many-to-one relation field',
    },
    {
      title: 'is a one-to-many relation',
      getViewId: () => testContext.companyViewId,
      getFieldId: () => testContext.companyDealsFieldId,
      getTargetFieldId: () => testContext.dealNextStepFieldId,
      expectedMessage: 'many-to-one relation field',
    },
    {
      title: 'targets a field of another object',
      getTargetFieldId: () => testContext.dealNextStepFieldId,
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'targets a relation',
      getTargetFieldId: () => testContext.companyDealsFieldId,
      expectedMessage: 'cannot be a relation',
    },
  ])(
    'rejects a sort that $title',
    async ({
      getViewId = () => testContext.dealViewId,
      getFieldId = () => testContext.dealCompanyFieldId,
      getTargetFieldId = () => testContext.companyEmployeesFieldId,
      expectedMessage,
    }) => {
      const response = await createRelationTargetViewSort({
        viewId: getViewId(),
        fieldMetadataId: getFieldId(),
        relationTargetFieldMetadataId: getTargetFieldId(),
        expectToFail: true,
      });

      expect(JSON.stringify(response.errors)).toContain(expectedMessage);
    },
  );

  it('rejects an update that targets a relation', async () => {
    const {
      data: { createViewSort },
    } = await createRelationTargetViewSort({
      viewId: testContext.dealViewId,
      fieldMetadataId: testContext.dealCompanyFieldId,
      relationTargetFieldMetadataId: testContext.companyEmployeesFieldId,
      expectToFail: false,
    });

    const response = await updateOneViewSort({
      expectToFail: true,
      input: {
        id: createViewSort.id,
        update: {
          relationTargetFieldMetadataId: testContext.companyDealsFieldId,
        },
      },
    });

    expect(JSON.stringify(response.errors)).toContain('cannot be a relation');

    await destroyOneViewSort({
      expectToFail: false,
      input: { id: createViewSort.id },
    });
  });

  it('removes the sort when the related record field is deleted', async () => {
    const revenueFieldId = await createField({
      objectMetadataId: testContext.companyObjectId,
      name: 'revenue',
      type: FieldMetadataType.NUMBER,
    });

    const {
      data: { createViewSort },
    } = await createRelationTargetViewSort({
      viewId: testContext.dealViewId,
      fieldMetadataId: testContext.dealCompanyFieldId,
      relationTargetFieldMetadataId: revenueFieldId,
      expectToFail: false,
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: { idToUpdate: revenueFieldId, updatePayload: { isActive: false } },
    });

    expect(await findViewSortIds(testContext.dealViewId)).not.toContain(
      createViewSort.id,
    );

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: revenueFieldId },
    });
  });

  it('removes the sort when an active related record field is deleted', async () => {
    const scoreFieldId = await createField({
      objectMetadataId: testContext.companyObjectId,
      name: 'score',
      type: FieldMetadataType.NUMBER,
    });

    const {
      data: { createViewSort },
    } = await createRelationTargetViewSort({
      viewId: testContext.dealViewId,
      fieldMetadataId: testContext.dealCompanyFieldId,
      relationTargetFieldMetadataId: scoreFieldId,
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: scoreFieldId },
    });

    expect(await findViewSortIds(testContext.dealViewId)).not.toContain(
      createViewSort.id,
    );
  });
});
