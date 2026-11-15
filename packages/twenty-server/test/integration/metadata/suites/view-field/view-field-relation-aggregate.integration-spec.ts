import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { updateOneViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-view-field.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type FieldNode = {
  id: string;
  name: string;
  object?: { id: string };
};

const AGGREGATE_VIEW_FIELD_GQL_FIELDS = `
  ${VIEW_FIELD_GQL_FIELDS}
  relationTargetFieldMetadataId
  relationAggregateOperation
`;

const testContext = {
  dealObjectId: '',
  companyObjectId: '',
  dealCompanyFieldId: '',
  companyDealsFieldId: '',
  dealAmountFieldId: '',
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
    input: { name: 'Aggregates', icon: 'IconTable', objectMetadataId },
  });

  return createView.id;
};

const createAggregateViewField = ({
  viewId,
  fieldMetadataId,
  relationAggregateOperation,
  relationTargetFieldMetadataId,
  isCanonical = false,
  expectToFail,
}: {
  viewId: string;
  fieldMetadataId: string;
  relationAggregateOperation?: AggregateOperations;
  relationTargetFieldMetadataId?: string;
  isCanonical?: boolean;
  expectToFail: boolean;
}) =>
  createOneViewField({
    expectToFail,
    gqlFields: AGGREGATE_VIEW_FIELD_GQL_FIELDS,
    input: {
      viewId,
      fieldMetadataId,
      relationAggregateOperation,
      relationTargetFieldMetadataId,
      isCanonical,
      position: 1,
    },
  });

describe('View field showing an aggregate of related records', () => {
  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: dealObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'aggregateDeals',
        nameSingular: 'aggregateDeal',
      }),
    });

    const {
      data: {
        createOneObject: { id: companyObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'aggregateCompanies',
        nameSingular: 'aggregateCompany',
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
    testContext.dealAmountFieldId = await createField({
      objectMetadataId: dealObjectId,
      name: 'amount',
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

  it('counts the related records on an added column', async () => {
    const {
      data: { createViewField },
    } = await createAggregateViewField({
      viewId: testContext.companyViewId,
      fieldMetadataId: testContext.companyDealsFieldId,
      relationAggregateOperation: AggregateOperations.COUNT,
      expectToFail: false,
    });

    expect(createViewField.relationAggregateOperation).toBe(
      AggregateOperations.COUNT,
    );
    expect(createViewField.relationTargetFieldMetadataId).toBeNull();
  });

  it('sums a number field of the related records on an added column', async () => {
    const {
      data: { createViewField },
    } = await createAggregateViewField({
      viewId: testContext.companyViewId,
      fieldMetadataId: testContext.companyDealsFieldId,
      relationAggregateOperation: AggregateOperations.SUM,
      relationTargetFieldMetadataId: testContext.dealAmountFieldId,
      expectToFail: false,
    });

    expect(createViewField.relationAggregateOperation).toBe(
      AggregateOperations.SUM,
    );
    expect(createViewField.relationTargetFieldMetadataId).toBe(
      testContext.dealAmountFieldId,
    );
  });

  it('switches a count column to an average of a number field', async () => {
    const {
      data: { createViewField },
    } = await createAggregateViewField({
      viewId: testContext.companyViewId,
      fieldMetadataId: testContext.companyDealsFieldId,
      relationAggregateOperation: AggregateOperations.COUNT,
      expectToFail: false,
    });

    const {
      data: { updateViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: AGGREGATE_VIEW_FIELD_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: {
          relationAggregateOperation: AggregateOperations.AVG,
          relationTargetFieldMetadataId: testContext.dealAmountFieldId,
        },
      },
    });

    expect(updateViewField.relationAggregateOperation).toBe(
      AggregateOperations.AVG,
    );

    const updateResponse = await updateOneViewField({
      expectToFail: true,
      gqlFields: AGGREGATE_VIEW_FIELD_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: {
          relationAggregateOperation: AggregateOperations.SUM,
          relationTargetFieldMetadataId: testContext.dealNextStepFieldId,
        },
      },
    });

    expect(JSON.stringify(updateResponse.errors)).toContain(
      'does not support this aggregate operation',
    );
  });

  it.each([
    {
      title: 'is canonical',
      isCanonical: true,
      expectedMessage: 'Only non-canonical view fields',
    },
    {
      title: 'counts with a related record field',
      getTargetFieldId: () => testContext.dealAmountFieldId,
      expectedMessage: 'count of related records cannot',
    },
    {
      title: 'sums without a related record field',
      relationAggregateOperation: AggregateOperations.SUM,
      expectedMessage: 'requires a related record field',
    },
    {
      title: 'sums a text field',
      relationAggregateOperation: AggregateOperations.SUM,
      getTargetFieldId: () => testContext.dealNextStepFieldId,
      expectedMessage: 'does not support this aggregate operation',
    },
    {
      title: 'aggregates a many-to-one relation',
      getViewId: () => testContext.dealViewId,
      getFieldId: () => testContext.dealCompanyFieldId,
      expectedMessage: 'one-to-many relation field',
    },
    {
      title: 'targets a field of a one-to-many relation without an aggregate',
      relationAggregateOperation: null,
      getTargetFieldId: () => testContext.dealAmountFieldId,
      expectedMessage: 'many-to-one relation field',
    },
  ])(
    'rejects a column that $title',
    async ({
      isCanonical = false,
      relationAggregateOperation = AggregateOperations.COUNT,
      getViewId = () => testContext.companyViewId,
      getFieldId = () => testContext.companyDealsFieldId,
      getTargetFieldId = () => undefined,
      expectedMessage,
    }: {
      isCanonical?: boolean;
      relationAggregateOperation?: AggregateOperations | null;
      getViewId?: () => string;
      getFieldId?: () => string;
      getTargetFieldId?: () => string | undefined;
      expectedMessage: string;
    }) => {
      const response = await createAggregateViewField({
        viewId: getViewId(),
        fieldMetadataId: getFieldId(),
        relationAggregateOperation: relationAggregateOperation ?? undefined,
        relationTargetFieldMetadataId: getTargetFieldId(),
        isCanonical,
        expectToFail: true,
      });

      expect(JSON.stringify(response.errors)).toContain(expectedMessage);
    },
  );
});
