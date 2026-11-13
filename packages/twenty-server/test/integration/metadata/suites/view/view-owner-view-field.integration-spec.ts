import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { destroyOneViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-view-field.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type DealFieldNode = {
  id: string;
  name: string;
  object?: { id: string };
};

const SCOPE_VIEW_GQL_FIELDS = `
  ${VIEW_GQL_FIELDS}
  ownerViewFieldId
`;

const testContext = {
  dealObjectId: '',
  actionItemObjectId: '',
  actionItemsFieldId: '',
  nextStepFieldId: '',
  dealViewId: '',
};

const createDealViewField = async (fieldMetadataId: string) => {
  const {
    data: { createViewField },
  } = await createOneViewField({
    expectToFail: false,
    input: {
      fieldMetadataId,
      viewId: testContext.dealViewId,
      position: 1,
    },
  });

  return createViewField.id;
};

const createScopeView = async ({
  ownerViewFieldId,
  objectMetadataId = testContext.actionItemObjectId,
  type = ViewType.TABLE_WIDGET,
  expectToFail,
}: {
  ownerViewFieldId: string;
  objectMetadataId?: string;
  type?: ViewType;
  expectToFail: boolean;
}) =>
  createOneView({
    expectToFail,
    gqlFields: SCOPE_VIEW_GQL_FIELDS,
    input: {
      name: 'Open action items',
      icon: 'IconFilter',
      objectMetadataId,
      type,
      ownerViewFieldId,
    },
  });

describe('View scoping a one-to-many view field', () => {
  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: dealObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'scopeDeals',
        nameSingular: 'scopeDeal',
      }),
    });

    const {
      data: {
        createOneObject: { id: actionItemObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'scopeActionItems',
        nameSingular: 'scopeActionItem',
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

    const {
      data: {
        createOneField: { id: nextStepFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: dealObjectId,
        name: 'nextStep',
        label: 'Next step',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.TEXT,
      },
    });

    const { fields } = await findManyFieldsMetadata({
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        name
        object {
          id
        }
      `,
    });

    const dealFields = fields
      .map(({ node }: { node: DealFieldNode }) => node)
      .filter((field: DealFieldNode) => field.object?.id === dealObjectId);

    testContext.dealObjectId = dealObjectId;
    testContext.actionItemObjectId = actionItemObjectId;
    testContext.actionItemsFieldId =
      dealFields.find((field: DealFieldNode) => field.name === 'actionItems')
        ?.id ?? '';
    testContext.nextStepFieldId = nextStepFieldId;

    const {
      data: { createView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: 'SMB queue',
        icon: 'IconTable',
        objectMetadataId: dealObjectId,
      },
    });

    testContext.dealViewId = createView.id;
  });

  afterAll(async () => {
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

  it('creates a scope view on the relation target, then removes it with its view field', async () => {
    expect(testContext.actionItemsFieldId).not.toBe('');

    const viewFieldId = await createDealViewField(
      testContext.actionItemsFieldId,
    );

    const {
      data: { createView: scopeView },
    } = await createScopeView({
      ownerViewFieldId: viewFieldId,
      expectToFail: false,
    });

    expect(scopeView.ownerViewFieldId).toBe(viewFieldId);

    const secondScopeViewResponse = await createScopeView({
      ownerViewFieldId: viewFieldId,
      expectToFail: true,
    });

    expect(JSON.stringify(secondScopeViewResponse.errors)).toContain(
      'A view field can be scoped by only one view',
    );

    await destroyOneViewField({
      expectToFail: false,
      input: { id: viewFieldId },
    });

    const { data } = await findOneView({
      viewId: scopeView.id,
      gqlFields: SCOPE_VIEW_GQL_FIELDS,
    });

    expect(data.getView).toBeNull();
  });

  it('removes the scope view when the scoped view field parent view is destroyed', async () => {
    const {
      data: { createView: parentView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Mid-market queue',
        icon: 'IconTable',
        objectMetadataId: testContext.dealObjectId,
      },
    });

    const {
      data: { createViewField },
    } = await createOneViewField({
      expectToFail: false,
      input: {
        fieldMetadataId: testContext.actionItemsFieldId,
        viewId: parentView.id,
        position: 1,
      },
    });

    const {
      data: { createView: scopeView },
    } = await createScopeView({
      ownerViewFieldId: createViewField.id,
      expectToFail: false,
    });

    await destroyOneView({
      expectToFail: false,
      viewId: parentView.id,
    });

    const { data } = await findOneView({
      viewId: scopeView.id,
      gqlFields: SCOPE_VIEW_GQL_FIELDS,
    });

    expect(data.getView).toBeNull();
  });

  it.each([
    {
      title: 'is not a TABLE_WIDGET view',
      getScopeViewOverrides: () => ({ type: ViewType.TABLE }),
      expectedMessage: 'must be of type TABLE_WIDGET',
    },
    {
      title: 'is not on the relation target object',
      getScopeViewOverrides: () => ({
        objectMetadataId: testContext.dealObjectId,
      }),
      expectedMessage: 'must be on the relation target object',
    },
  ])(
    'rejects a scope view that $title',
    async ({ getScopeViewOverrides, expectedMessage }) => {
      const viewFieldId = await createDealViewField(
        testContext.actionItemsFieldId,
      );

      const response = await createScopeView({
        ownerViewFieldId: viewFieldId,
        expectToFail: true,
        ...getScopeViewOverrides(),
      });

      expect(JSON.stringify(response.errors)).toContain(expectedMessage);

      await destroyOneViewField({
        expectToFail: false,
        input: { id: viewFieldId },
      });
    },
  );

  it('rejects scoping a view field that does not list related records', async () => {
    const viewFieldId = await createDealViewField(testContext.nextStepFieldId);

    const response = await createScopeView({
      ownerViewFieldId: viewFieldId,
      expectToFail: true,
    });

    expect(JSON.stringify(response.errors)).toContain(
      'Only a view field of a one-to-many relation can be scoped',
    );

    await destroyOneViewField({
      expectToFail: false,
      input: { id: viewFieldId },
    });
  });
});
