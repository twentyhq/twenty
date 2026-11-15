import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertViewFieldWithScope } from 'test/integration/metadata/suites/view-field/utils/upsert-view-field-with-scope.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

const testContext = {
  dealObjectId: '',
  actionItemObjectId: '',
  actionItemsFieldId: '',
  actionItemNameFieldId: '',
  dealViewId: '',
};

describe('upsertViewFieldWithScope', () => {
  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: dealObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'scopedColumnDeals',
        nameSingular: 'scopedColumnDeal',
      }),
    });

    const {
      data: {
        createOneObject: { id: actionItemObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'scopedColumnActionItems',
        nameSingular: 'scopedColumnActionItem',
      }),
    });

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: actionItemObjectId,
        name: 'deal',
        label: 'Deal',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'Action items',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId: dealObjectId,
          targetFieldIcon: 'IconCheckbox',
        },
      },
    });

    testContext.dealObjectId = dealObjectId;
    testContext.actionItemObjectId = actionItemObjectId;
    testContext.actionItemsFieldId = await findFieldMetadataIdByName({
      objectMetadataId: dealObjectId,
      fieldName: 'actionItems',
    });
    testContext.actionItemNameFieldId = await findFieldMetadataIdByName({
      objectMetadataId: actionItemObjectId,
      fieldName: 'name',
    });

    const {
      data: { createView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Enterprise deals',
        icon: 'IconTable',
        objectMetadataId: dealObjectId,
      },
    });

    testContext.dealViewId = createView.id;
  });

  afterAll(async () => {
    await destroyOneView({
      expectToFail: false,
      viewId: testContext.dealViewId,
    });

    for (const objectMetadataId of [
      testContext.actionItemObjectId,
      testContext.dealObjectId,
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

  const buildColumnInput = (viewFieldId: string) => ({
    id: viewFieldId,
    viewId: testContext.dealViewId,
    fieldMetadataId: testContext.actionItemsFieldId,
    isCanonical: false,
    isVisible: true,
    position: 3,
    size: 180,
  });

  it('creates, replaces and clears a column scope with its column', async () => {
    const viewFieldId = v4();
    const filterGroupId = v4();
    const groupedFilterId = v4();
    const sortId = v4();

    const {
      data: { upsertViewFieldWithScope: created },
    } = await upsertViewFieldWithScope({
      expectToFail: false,
      input: {
        ...buildColumnInput(viewFieldId),
        settings: { label: 'Open action items', recordLimit: 5 },
        scope: {
          viewFilterGroups: [
            {
              id: filterGroupId,
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
            },
          ],
          viewFilters: [
            {
              id: groupedFilterId,
              fieldMetadataId: testContext.actionItemNameFieldId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'renewal',
              viewFilterGroupId: filterGroupId,
            },
          ],
          viewSorts: [
            {
              id: sortId,
              fieldMetadataId: testContext.actionItemNameFieldId,
              direction: ViewSortDirection.DESC,
            },
          ],
        },
      },
    });

    expect(created.viewField).toMatchObject({
      id: viewFieldId,
      viewId: testContext.dealViewId,
      settings: { label: 'Open action items', recordLimit: 5 },
    });
    expect(created.scopeView).toMatchObject({
      type: ViewType.TABLE_WIDGET,
      objectMetadataId: testContext.actionItemObjectId,
      ownerViewFieldId: viewFieldId,
      visibility: ViewVisibility.WORKSPACE,
      viewFilterGroups: [
        {
          id: filterGroupId,
          logicalOperator: ViewFilterGroupLogicalOperator.OR,
        },
      ],
      viewFilters: [{ id: groupedFilterId, viewFilterGroupId: filterGroupId }],
      viewSorts: [{ id: sortId, direction: ViewSortDirection.DESC }],
    });

    const scopeViewId = created.scopeView?.id;

    assertIsDefinedOrThrow(scopeViewId);

    const ungroupedFilterId = v4();

    const {
      data: { upsertViewFieldWithScope: replaced },
    } = await upsertViewFieldWithScope({
      expectToFail: false,
      input: {
        ...buildColumnInput(viewFieldId),
        settings: { label: 'Renewals', recordLimit: 5 },
        scope: {
          viewFilterGroups: [],
          viewFilters: [
            {
              id: ungroupedFilterId,
              fieldMetadataId: testContext.actionItemNameFieldId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'upsell',
            },
          ],
          viewSorts: [],
        },
      },
    });

    expect(replaced.viewField.settings).toMatchObject({ label: 'Renewals' });
    expect(replaced.scopeView?.id).toBe(scopeViewId);
    expect(replaced.scopeView?.viewFilterGroups).toEqual([]);
    expect(replaced.scopeView?.viewFilters).toEqual([
      expect.objectContaining({
        id: ungroupedFilterId,
        value: 'upsell',
        viewFilterGroupId: null,
      }),
    ]);
    expect(replaced.scopeView?.viewSorts).toEqual([]);

    const {
      data: { upsertViewFieldWithScope: cleared },
    } = await upsertViewFieldWithScope({
      expectToFail: false,
      input: {
        ...buildColumnInput(viewFieldId),
        settings: { label: null, recordLimit: null },
        scope: null,
      },
    });

    expect(cleared.scopeView).toBeNull();
    expect(cleared.viewField.settings).toMatchObject({ label: null });

    const { data } = await findOneView({ viewId: scopeViewId });

    expect(data.getView).toBeNull();
  });

  it('moves a nested filter group to the root when its parent is set to null', async () => {
    const viewFieldId = v4();
    const rootGroupId = v4();
    const nestedGroupId = v4();
    const gqlFields = `scopeView { viewFilterGroups { id parentViewFilterGroupId } }`;
    const buildScope = (nestedGroupParentId: string | null) => ({
      viewFilterGroups: [
        {
          id: rootGroupId,
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
        },
        {
          id: nestedGroupId,
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
          parentViewFilterGroupId: nestedGroupParentId,
        },
      ],
      viewFilters: [
        {
          id: v4(),
          fieldMetadataId: testContext.actionItemNameFieldId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'renewal',
          viewFilterGroupId: nestedGroupId,
        },
      ],
      viewSorts: [],
    });

    await upsertViewFieldWithScope({
      expectToFail: false,
      gqlFields,
      input: {
        ...buildColumnInput(viewFieldId),
        scope: buildScope(rootGroupId),
      },
    });

    const {
      data: { upsertViewFieldWithScope: moved },
    } = await upsertViewFieldWithScope({
      expectToFail: false,
      gqlFields,
      input: { ...buildColumnInput(viewFieldId), scope: buildScope(null) },
    });

    expect(moved.scopeView?.viewFilterGroups).toContainEqual({
      id: nestedGroupId,
      parentViewFilterGroupId: null,
    });
  });

  it('keeps a filter in its group when the update omits the group', async () => {
    const viewFieldId = v4();
    const groupId = v4();
    const filterId = v4();
    const gqlFields = `scopeView { viewFilters { id value viewFilterGroupId } }`;
    const buildScope = (filter: {
      value: string;
      viewFilterGroupId?: string;
    }) => ({
      viewFilterGroups: [
        { id: groupId, logicalOperator: ViewFilterGroupLogicalOperator.AND },
      ],
      viewFilters: [
        {
          id: filterId,
          fieldMetadataId: testContext.actionItemNameFieldId,
          operand: ViewFilterOperand.CONTAINS,
          ...filter,
        },
      ],
      viewSorts: [],
    });

    await upsertViewFieldWithScope({
      expectToFail: false,
      gqlFields,
      input: {
        ...buildColumnInput(viewFieldId),
        scope: buildScope({ value: 'renewal', viewFilterGroupId: groupId }),
      },
    });

    const {
      data: { upsertViewFieldWithScope: updated },
    } = await upsertViewFieldWithScope({
      expectToFail: false,
      gqlFields,
      input: {
        ...buildColumnInput(viewFieldId),
        scope: buildScope({ value: 'churn' }),
      },
    });

    expect(updated.scopeView?.viewFilters).toEqual([
      { id: filterId, value: 'churn', viewFilterGroupId: groupId },
    ]);
  });

  it('clears the aggregate operation of a column saved with null', async () => {
    const viewFieldId = v4();
    const gqlFields = `viewField { aggregateOperation }`;

    await upsertViewFieldWithScope({
      expectToFail: false,
      gqlFields,
      input: {
        ...buildColumnInput(viewFieldId),
        aggregateOperation: AggregateOperations.COUNT,
      },
    });

    const {
      data: { upsertViewFieldWithScope: cleared },
    } = await upsertViewFieldWithScope({
      expectToFail: false,
      gqlFields,
      input: { ...buildColumnInput(viewFieldId), aggregateOperation: null },
    });

    expect(cleared.viewField.aggregateOperation).toBeNull();
  });

  it('gives a new scope the visibility and creator of the view holding its column', async () => {
    const {
      data: { createView: unlistedView },
    } = await createOneView({
      expectToFail: false,
      gqlFields: 'id createdByUserWorkspaceId',
      input: {
        name: 'My deals',
        icon: 'IconTable',
        objectMetadataId: testContext.dealObjectId,
        visibility: ViewVisibility.UNLISTED,
      },
    });

    const {
      data: { upsertViewFieldWithScope: created },
    } = await upsertViewFieldWithScope({
      expectToFail: false,
      input: {
        ...buildColumnInput(v4()),
        viewId: unlistedView.id,
        scope: {
          viewFilterGroups: [],
          viewFilters: [],
          viewSorts: [
            {
              fieldMetadataId: testContext.actionItemNameFieldId,
              direction: ViewSortDirection.ASC,
            },
          ],
        },
      },
    });

    expect(created.scopeView).toMatchObject({
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: unlistedView.createdByUserWorkspaceId,
    });

    await destroyOneView({ expectToFail: false, viewId: unlistedView.id });
  });

  it('rejects a user who cannot edit the view holding the column', async () => {
    const viewFieldId = v4();

    await upsertViewFieldWithScope({
      expectToFail: false,
      input: buildColumnInput(viewFieldId),
    });

    const scope = {
      viewFilterGroups: [],
      viewFilters: [
        {
          fieldMetadataId: testContext.actionItemNameFieldId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'guest',
        },
      ],
      viewSorts: [],
    };

    const { errors } = await upsertViewFieldWithScope({
      expectToFail: true,
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      input: { ...buildColumnInput(viewFieldId), scope },
    });

    expect(errors?.[0]?.message).toBe(
      'You do not have permission to modify this view',
    );

    // Pointing at a view the guest owns must not unlock a column of another view
    const {
      data: { createView: guestView },
    } = await createOneView({
      expectToFail: false,
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      input: {
        name: 'Guest deals',
        icon: 'IconTable',
        objectMetadataId: testContext.dealObjectId,
        visibility: ViewVisibility.UNLISTED,
      },
    });

    const { errors: crossViewErrors } = await upsertViewFieldWithScope({
      expectToFail: true,
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      input: { ...buildColumnInput(viewFieldId), viewId: guestView.id, scope },
    });

    expect(crossViewErrors?.[0]?.message).toBe(
      'You do not have permission to modify this view',
    );

    const {
      data: { getViews: actionItemViews },
    } = await findViews<{ ownerViewFieldId: string | null }>({
      objectMetadataId: testContext.actionItemObjectId,
      gqlFields: 'id ownerViewFieldId',
      expectToFail: false,
    });

    expect(
      actionItemViews.filter(
        ({ ownerViewFieldId }) => ownerViewFieldId === viewFieldId,
      ),
    ).toEqual([]);

    await destroyOneView({ expectToFail: false, viewId: guestView.id });
  });
});
