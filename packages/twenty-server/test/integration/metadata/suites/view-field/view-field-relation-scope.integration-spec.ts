import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { updateOneViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-view-field.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type ViewFieldRelationScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/view-field-relation-scope.input';

type FieldNode = {
  id: string;
  name: string;
  object?: { id: string };
};

const SCOPED_VIEW_FIELD_GQL_FIELDS = `
  ${VIEW_FIELD_GQL_FIELDS}
  relationTargetFieldMetadataId
  relationScope {
    filters {
      id
      fieldMetadataId
      operand
      value
      subFieldName
      relationTargetFieldMetadataId
      filterGroupId
    }
    filterGroups {
      id
      parentFilterGroupId
      logicalOperator
    }
    sorts {
      fieldMetadataId
      direction
      subFieldName
      relationTargetFieldMetadataId
    }
    limit
    aggregateOperation
  }
`;

const STAGE_FILTER_ID = '0f7d3a52-4d1e-4c38-9a59-0a3c2e1b8f11';
const CITY_FILTER_ID = '6a1c9f0e-2b7d-4e55-8d3a-5f4b2c1e9a07';
const FILTER_GROUP_ID = 'c3b8e2d1-7f6a-4b59-9e0c-1d2a3b4c5d6e';

const testContext = {
  companyObjectId: '',
  dealObjectId: '',
  personObjectId: '',
  companyDealsFieldId: '',
  dealCompanyFieldId: '',
  dealOwnerFieldId: '',
  dealStageFieldId: '',
  dealCloseDateFieldId: '',
  personCityFieldId: '',
  companyViewId: '',
  dealViewId: '',
};

const createObject = async (nameSingular: string) => {
  const {
    data: {
      createOneObject: { id },
    },
  } = await createOneObjectMetadata({
    input: getMockCreateObjectInput({
      nameSingular,
      namePlural: `${nameSingular}s`,
    }),
  });

  return id;
};

const createField = async (
  input: Parameters<typeof createOneFieldMetadata>[0]['input'],
) => {
  const {
    data: {
      createOneField: { id },
    },
  } = await createOneFieldMetadata({
    expectToFail: false,
    input: { isLabelSyncedWithName: false, ...input },
  });

  return id;
};

const createManyToOneRelation = ({
  objectMetadataId,
  targetObjectMetadataId,
  name,
  targetFieldLabel,
}: {
  objectMetadataId: string;
  targetObjectMetadataId: string;
  name: string;
  targetFieldLabel: string;
}) =>
  createField({
    objectMetadataId,
    name,
    label: name,
    type: FieldMetadataType.RELATION,
    relationCreationPayload: {
      targetFieldLabel,
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadataId,
      targetFieldIcon: 'IconBuildingSkyscraper',
    },
  });

const createView = async (objectMetadataId: string) => {
  const {
    data: { createView },
  } = await createOneView({
    expectToFail: false,
    input: { name: 'Scoped', icon: 'IconTable', objectMetadataId },
  });

  return createView.id;
};

const buildOpenDealsScope = (): ViewFieldRelationScopeInput => ({
  filters: [
    {
      id: STAGE_FILTER_ID,
      fieldMetadataId: testContext.dealStageFieldId,
      operand: ViewFilterOperand.IS_NOT,
      value: ['LOST'],
      filterGroupId: FILTER_GROUP_ID,
    },
    {
      id: CITY_FILTER_ID,
      fieldMetadataId: testContext.dealOwnerFieldId,
      relationTargetFieldMetadataId: testContext.personCityFieldId,
      operand: ViewFilterOperand.CONTAINS,
      value: 'Paris',
      filterGroupId: FILTER_GROUP_ID,
    },
  ],
  filterGroups: [
    { id: FILTER_GROUP_ID, logicalOperator: ViewFilterGroupLogicalOperator.OR },
  ],
  sorts: [
    {
      fieldMetadataId: testContext.dealCloseDateFieldId,
      direction: ViewSortDirection.DESC,
    },
  ],
  limit: 1,
});

const buildOpenDealsFilterScope = (): ViewFieldRelationScopeInput => {
  const { sorts: _sorts, limit: _limit, ...filters } = buildOpenDealsScope();

  return { ...filters, sorts: [] };
};

const createScopedViewField = ({
  relationScope,
  relationTargetFieldMetadataId,
  aggregateOperation,
  viewId = testContext.companyViewId,
  fieldMetadataId = testContext.companyDealsFieldId,
  isCanonical = false,
  expectToFail,
}: {
  relationScope: ViewFieldRelationScopeInput;
  relationTargetFieldMetadataId?: string;
  aggregateOperation?: AggregateOperations;
  viewId?: string;
  fieldMetadataId?: string;
  isCanonical?: boolean;
  expectToFail: boolean;
}) =>
  createOneViewField({
    expectToFail,
    gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
    input: {
      viewId,
      fieldMetadataId,
      relationScope: isDefined(aggregateOperation)
        ? { ...relationScope, aggregateOperation }
        : relationScope,
      relationTargetFieldMetadataId,
      isCanonical,
      position: 1,
    },
  });

const findCompanyViewFieldIds = async () => {
  const {
    data: { getViewFields },
  } = await findViewFields({
    viewId: testContext.companyViewId,
    gqlFields: 'id',
    expectToFail: false,
  });

  return getViewFields.map((viewField: { id: string }) => viewField.id);
};

describe('View field filtering, sorting and limiting its related records', () => {
  beforeAll(async () => {
    testContext.companyObjectId = await createObject('scopeCompany');
    testContext.dealObjectId = await createObject('scopeDeal');
    testContext.personObjectId = await createObject('scopePerson');

    testContext.dealCompanyFieldId = await createManyToOneRelation({
      objectMetadataId: testContext.dealObjectId,
      targetObjectMetadataId: testContext.companyObjectId,
      name: 'company',
      targetFieldLabel: 'Deals',
    });
    testContext.dealOwnerFieldId = await createManyToOneRelation({
      objectMetadataId: testContext.dealObjectId,
      targetObjectMetadataId: testContext.personObjectId,
      name: 'owner',
      targetFieldLabel: 'Owned deals',
    });
    testContext.dealStageFieldId = await createField({
      objectMetadataId: testContext.dealObjectId,
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.SELECT,
      options: [
        { label: 'Open', value: 'OPEN', color: 'blue', position: 0 },
        { label: 'Won', value: 'WON', color: 'green', position: 1 },
        { label: 'Lost', value: 'LOST', color: 'red', position: 2 },
      ],
    });
    testContext.dealCloseDateFieldId = await createField({
      objectMetadataId: testContext.dealObjectId,
      name: 'closeDate',
      label: 'Close date',
      type: FieldMetadataType.DATE_TIME,
    });
    testContext.personCityFieldId = await createField({
      objectMetadataId: testContext.personObjectId,
      name: 'city',
      label: 'City',
      type: FieldMetadataType.TEXT,
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

    const findFieldOrThrow = ({
      objectMetadataId,
      name,
    }: {
      objectMetadataId: string;
      name: string;
    }) => {
      const field = fields
        .map(({ node }: { node: FieldNode }) => node)
        .find(
          (node: FieldNode) =>
            node.object?.id === objectMetadataId && node.name === name,
        );

      assertIsDefinedOrThrow(field);

      return field.id;
    };

    testContext.companyDealsFieldId = findFieldOrThrow({
      objectMetadataId: testContext.companyObjectId,
      name: 'deals',
    });
    testContext.companyViewId = await createView(testContext.companyObjectId);
    testContext.dealViewId = await createView(testContext.dealObjectId);
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      testContext.dealObjectId,
      testContext.companyObjectId,
      testContext.personObjectId,
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

  it('stores open deals sorted by close date, first one, on an added column', async () => {
    const relationScope = buildOpenDealsScope();

    const {
      data: { createViewField },
    } = await createScopedViewField({ relationScope, expectToFail: false });

    expect(createViewField.relationScope).toEqual({
      filters: [
        {
          ...relationScope.filters[0],
          subFieldName: null,
          relationTargetFieldMetadataId: null,
        },
        { ...relationScope.filters[1], subFieldName: null },
      ],
      filterGroups: [
        { ...relationScope.filterGroups[0], parentFilterGroupId: null },
      ],
      sorts: [
        {
          ...relationScope.sorts[0],
          subFieldName: null,
          relationTargetFieldMetadataId: null,
        },
      ],
      limit: 1,
      aggregateOperation: null,
    });
  });

  it('changes and clears the relation scope', async () => {
    const {
      data: { createViewField },
    } = await createScopedViewField({
      relationScope: buildOpenDealsScope(),
      expectToFail: false,
    });

    const {
      data: { updateViewField: limitedViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: { relationScope: { ...buildOpenDealsScope(), limit: 5 } },
      },
    });

    expect(limitedViewField.relationScope?.limit).toBe(5);

    const {
      data: { updateViewField: clearedViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
      input: { id: createViewField.id, update: { relationScope: null } },
    });

    expect(clearedViewField.relationScope).toBeNull();
  });

  it('shows a field of the related records, then the records again', async () => {
    const {
      data: { createViewField },
    } = await createScopedViewField({
      relationScope: buildOpenDealsScope(),
      relationTargetFieldMetadataId: testContext.dealStageFieldId,
      expectToFail: false,
    });

    expect(createViewField.relationTargetFieldMetadataId).toBe(
      testContext.dealStageFieldId,
    );

    const {
      data: { updateViewField: closeDateViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: {
          relationTargetFieldMetadataId: testContext.dealCloseDateFieldId,
        },
      },
    });

    expect(closeDateViewField.relationTargetFieldMetadataId).toBe(
      testContext.dealCloseDateFieldId,
    );

    const {
      data: { updateViewField: recordsViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: { relationTargetFieldMetadataId: null },
      },
    });

    expect(recordsViewField.relationTargetFieldMetadataId).toBeNull();
    expect(recordsViewField.relationScope?.limit).toBe(1);
  });

  it('keeps the scope of a column showing a field of the related records', async () => {
    const {
      data: { createViewField },
    } = await createScopedViewField({
      relationScope: buildOpenDealsScope(),
      relationTargetFieldMetadataId: testContext.dealStageFieldId,
      expectToFail: false,
    });

    const response = await updateOneViewField({
      expectToFail: true,
      gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
      input: { id: createViewField.id, update: { relationScope: null } },
    });

    expect(JSON.stringify(response.errors)).toContain(
      'one-to-many relation field with a relation scope',
    );

    const {
      data: { updateViewField: plainViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: { relationScope: null, relationTargetFieldMetadataId: null },
      },
    });

    expect(plainViewField).toMatchObject({
      relationScope: null,
      relationTargetFieldMetadataId: null,
    });
  });

  it('counts the open deals, then shows their earliest close date', async () => {
    const {
      data: { createViewField },
    } = await createScopedViewField({
      relationScope: buildOpenDealsFilterScope(),
      aggregateOperation: AggregateOperations.COUNT,
      expectToFail: false,
    });

    expect(createViewField).toMatchObject({
      relationScope: { aggregateOperation: AggregateOperations.COUNT },
      relationTargetFieldMetadataId: null,
    });

    const {
      data: { updateViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: SCOPED_VIEW_FIELD_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: {
          relationScope: {
            ...buildOpenDealsFilterScope(),
            aggregateOperation: AggregateOperations.MIN,
          },
          relationTargetFieldMetadataId: testContext.dealCloseDateFieldId,
        },
      },
    });

    expect(updateViewField).toMatchObject({
      relationScope: { aggregateOperation: AggregateOperations.MIN },
      relationTargetFieldMetadataId: testContext.dealCloseDateFieldId,
    });
  });

  it.each([
    {
      title: 'its scope is limited',
      getRelationScope: () => ({ ...buildOpenDealsFilterScope(), limit: 3 }),
      aggregateOperation: AggregateOperations.COUNT,
      expectedMessage: 'cannot have sorts or a limit',
    },
    {
      title: 'its scope is sorted',
      getRelationScope: buildOpenDealsScope,
      aggregateOperation: AggregateOperations.COUNT,
      expectedMessage: 'cannot have sorts or a limit',
    },
    {
      title: 'it sums a date',
      getRelationScope: buildOpenDealsFilterScope,
      aggregateOperation: AggregateOperations.SUM,
      getRelationTargetFieldMetadataId: () => testContext.dealCloseDateFieldId,
      expectedMessage: 'does not support this aggregate operation',
    },
    {
      title: 'it sums without a field',
      getRelationScope: buildOpenDealsFilterScope,
      aggregateOperation: AggregateOperations.SUM,
      expectedMessage: 'requires a related record field',
    },
  ])(
    'rejects an aggregate column when $title',
    async ({
      getRelationScope,
      aggregateOperation,
      getRelationTargetFieldMetadataId,
      expectedMessage,
    }) => {
      const response = await createScopedViewField({
        relationScope: getRelationScope(),
        aggregateOperation,
        relationTargetFieldMetadataId: getRelationTargetFieldMetadataId?.(),
        expectToFail: true,
      });

      expect(JSON.stringify(response.errors)).toContain(expectedMessage);
    },
  );

  it('removes the column when the field it shows is deactivated', async () => {
    const priorityFieldId = await createField({
      objectMetadataId: testContext.dealObjectId,
      name: 'priority',
      label: 'Priority',
      type: FieldMetadataType.TEXT,
    });

    const {
      data: { createViewField },
    } = await createScopedViewField({
      relationScope: buildOpenDealsScope(),
      relationTargetFieldMetadataId: priorityFieldId,
      expectToFail: false,
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: priorityFieldId,
        updatePayload: { isActive: false },
      },
    });

    expect(await findCompanyViewFieldIds()).not.toContain(createViewField.id);
  });

  it.each([
    {
      title: 'is canonical',
      isCanonical: true,
      expectedMessage: 'Only non-canonical view fields',
    },
    {
      title: 'is a many-to-one relation',
      getViewId: () => testContext.dealViewId,
      getFieldId: () => testContext.dealCompanyFieldId,
      expectedMessage: 'one-to-many relation field',
    },
    {
      title: 'filters on a field of another object',
      getRelationScope: () => ({
        ...buildOpenDealsScope(),
        filters: [
          {
            id: STAGE_FILTER_ID,
            fieldMetadataId: testContext.personCityFieldId,
            operand: ViewFilterOperand.IS_NOT_EMPTY,
            value: '',
          },
        ],
      }),
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'filters on a select option the field does not have',
      getRelationScope: () => ({
        ...buildOpenDealsScope(),
        filters: [{ ...buildOpenDealsScope().filters[0], value: ['ARCHIVED'] }],
      }),
      expectedMessage: 'ARCHIVED',
    },
    {
      title: 'sorts through a relation on a field of another object',
      getRelationScope: () => ({
        ...buildOpenDealsScope(),
        sorts: [
          {
            fieldMetadataId: testContext.dealOwnerFieldId,
            relationTargetFieldMetadataId: testContext.dealOwnerFieldId,
            direction: ViewSortDirection.ASC,
          },
        ],
      }),
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'has a limit out of range',
      getRelationScope: () => ({ ...buildOpenDealsScope(), limit: 61 }),
      expectedMessage: 'limit must be an integer between 1 and 60',
    },
    {
      title: 'shows a field of another object',
      getRelationTargetFieldId: () => testContext.personCityFieldId,
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'shows a relation of the related records',
      getRelationTargetFieldId: () => testContext.dealOwnerFieldId,
      expectedMessage: 'cannot be a relation',
    },
  ])(
    'rejects a column that $title',
    async ({
      isCanonical = false,
      getViewId = () => testContext.companyViewId,
      getFieldId = () => testContext.companyDealsFieldId,
      getRelationScope = buildOpenDealsScope,
      getRelationTargetFieldId = () => undefined,
      expectedMessage,
    }) => {
      const response = await createScopedViewField({
        viewId: getViewId(),
        fieldMetadataId: getFieldId(),
        relationScope: getRelationScope(),
        relationTargetFieldMetadataId: getRelationTargetFieldId(),
        isCanonical,
        expectToFail: true,
      });

      expect(JSON.stringify(response.errors)).toContain(expectedMessage);
    },
  );

  it('removes the column when a field it filters on through a relation is deactivated', async () => {
    const {
      data: { createViewField },
    } = await createScopedViewField({
      relationScope: buildOpenDealsScope(),
      expectToFail: false,
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testContext.personCityFieldId,
        updatePayload: { isActive: false },
      },
    });

    expect(await findCompanyViewFieldIds()).not.toContain(createViewField.id);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testContext.personCityFieldId,
        updatePayload: { isActive: true },
      },
    });
  });

  it('removes the column when a field it sorts on is deleted', async () => {
    const amountFieldId = await createField({
      objectMetadataId: testContext.dealObjectId,
      name: 'amount',
      label: 'Amount',
      type: FieldMetadataType.NUMBER,
    });

    const {
      data: { createViewField },
    } = await createScopedViewField({
      relationScope: {
        filters: [],
        filterGroups: [],
        sorts: [
          { fieldMetadataId: amountFieldId, direction: ViewSortDirection.DESC },
        ],
      },
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: amountFieldId },
    });

    expect(await findCompanyViewFieldIds()).not.toContain(createViewField.id);
  });
});
