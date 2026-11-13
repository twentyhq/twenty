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
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type FieldNode = {
  id: string;
  name: string;
  object?: { id: string };
};

const LOOKUP_VIEW_FIELD_GQL_FIELDS = `
  ${VIEW_FIELD_GQL_FIELDS}
  relationTargetFieldMetadataId
`;

const testContext = {
  dealObjectId: '',
  companyObjectId: '',
  dealCompanyFieldId: '',
  companyDealsFieldId: '',
  companyIndustryFieldId: '',
  dealNextStepFieldId: '',
  dealViewId: '',
  companyViewId: '',
};

const createTextField = async (objectMetadataId: string, name: string) => {
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
      type: FieldMetadataType.TEXT,
    },
  });

  return id as string;
};

const createView = async (objectMetadataId: string) => {
  const {
    data: { createView },
  } = await createOneView({
    expectToFail: false,
    input: { name: 'Lookups', icon: 'IconTable', objectMetadataId },
  });

  return createView.id as string;
};

const createLookupViewField = ({
  viewId,
  fieldMetadataId,
  relationTargetFieldMetadataId,
  isCanonical = false,
  expectToFail,
}: {
  viewId: string;
  fieldMetadataId: string;
  relationTargetFieldMetadataId: string;
  isCanonical?: boolean;
  expectToFail: boolean;
}) =>
  createOneViewField({
    expectToFail,
    gqlFields: LOOKUP_VIEW_FIELD_GQL_FIELDS,
    input: {
      viewId,
      fieldMetadataId,
      relationTargetFieldMetadataId,
      isCanonical,
      position: 1,
    },
  });

describe('View field showing a field of the related record', () => {
  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: dealObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'lookupDeals',
        nameSingular: 'lookupDeal',
      }),
    });

    const {
      data: {
        createOneObject: { id: companyObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'lookupCompanies',
        nameSingular: 'lookupCompany',
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

    testContext.dealObjectId = dealObjectId;
    testContext.companyObjectId = companyObjectId;
    testContext.dealCompanyFieldId = dealCompanyFieldId;
    testContext.companyDealsFieldId =
      fields
        .map(({ node }: { node: FieldNode }) => node)
        .find(
          (field: FieldNode) =>
            field.object?.id === companyObjectId && field.name === 'deals',
        )?.id ?? '';
    testContext.companyIndustryFieldId = await createTextField(
      companyObjectId,
      'industry',
    );
    testContext.dealNextStepFieldId = await createTextField(
      dealObjectId,
      'nextStep',
    );
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

  it('shows a field of the related record on an added column', async () => {
    expect(testContext.companyDealsFieldId).not.toBe('');

    const {
      data: { createViewField },
    } = await createLookupViewField({
      viewId: testContext.dealViewId,
      fieldMetadataId: testContext.dealCompanyFieldId,
      relationTargetFieldMetadataId: testContext.companyIndustryFieldId,
      expectToFail: false,
    });

    expect(createViewField.relationTargetFieldMetadataId).toBe(
      testContext.companyIndustryFieldId,
    );
  });

  it.each([
    {
      title: 'is canonical',
      isCanonical: true,
      expectedMessage: 'Only non-canonical view fields',
    },
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
    'rejects a column that $title',
    async ({
      isCanonical = false,
      getViewId = () => testContext.dealViewId,
      getFieldId = () => testContext.dealCompanyFieldId,
      getTargetFieldId = () => testContext.companyIndustryFieldId,
      expectedMessage,
    }) => {
      const response = await createLookupViewField({
        viewId: getViewId(),
        fieldMetadataId: getFieldId(),
        relationTargetFieldMetadataId: getTargetFieldId(),
        isCanonical,
        expectToFail: true,
      });

      expect(JSON.stringify(response.errors)).toContain(expectedMessage);
    },
  );

  it('removes the column when the related record field is deleted', async () => {
    const tierFieldId = await createTextField(
      testContext.companyObjectId,
      'tier',
    );

    const {
      data: { createViewField },
    } = await createLookupViewField({
      viewId: testContext.dealViewId,
      fieldMetadataId: testContext.dealCompanyFieldId,
      relationTargetFieldMetadataId: tierFieldId,
      expectToFail: false,
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: { idToUpdate: tierFieldId, updatePayload: { isActive: false } },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: tierFieldId },
    });

    const {
      data: { getViewFields },
    } = await findViewFields({
      viewId: testContext.dealViewId,
      gqlFields: LOOKUP_VIEW_FIELD_GQL_FIELDS,
      expectToFail: false,
    });

    expect(
      getViewFields.map((viewField: { id: string }) => viewField.id),
    ).not.toContain(createViewField.id);
  });
});
