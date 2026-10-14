import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { destroyOneViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-view-field.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { ViewType } from 'twenty-shared/types';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

const RELATION_TRAVERSAL_GQL_FIELDS = `
    id
    fieldMetadataId
    relationTargetFieldMetadataId
    viewId
    isVisible
    position
    size
    aggregateOperation
`;

type TestSetup = {
  createdViewId: string;
  personCompanyRelationFieldId: string;
  personJobTitleFieldId: string;
  personOpportunitiesRelationFieldId: string;
  companyEmployeesFieldId: string;
  companyNameFieldId: string;
  companyAccountOwnerRelationFieldId: string;
  opportunityNameFieldId: string;
};

type FailingTestContext = {
  input: (testSetup: TestSetup) => CreateViewFieldInput;
  expectedMessage: string;
};

const failingTestCases: EachTestingContext<FailingTestContext>[] = [
  {
    title: 'when the source field is a one-to-many relation',
    context: {
      input: (testSetup) => ({
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personOpportunitiesRelationFieldId,
        relationTargetFieldMetadataId: testSetup.opportunityNameFieldId,
        position: 10,
      }),
      expectedMessage:
        'Relation target field requires fieldMetadataId to be a many-to-one relation field',
    },
  },
  {
    title: 'when the source field is not a relation',
    context: {
      input: (testSetup) => ({
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personJobTitleFieldId,
        relationTargetFieldMetadataId: testSetup.companyNameFieldId,
        position: 10,
      }),
      expectedMessage:
        'Relation target field requires fieldMetadataId to be a many-to-one relation field',
    },
  },
  {
    title: 'when the target field belongs to another object',
    context: {
      input: (testSetup) => ({
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        relationTargetFieldMetadataId: testSetup.personJobTitleFieldId,
        position: 10,
      }),
      expectedMessage:
        'Relation target field does not belong to the object the relation points to',
    },
  },
  {
    title: 'when the target field is itself a relation',
    context: {
      input: (testSetup) => ({
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        relationTargetFieldMetadataId:
          testSetup.companyAccountOwnerRelationFieldId,
        position: 10,
      }),
      expectedMessage: 'Relation target field cannot be a relation field',
    },
  },
];

describe('View field relation traversal', () => {
  let testSetup: TestSetup;
  const createdViewFieldIds: string[] = [];

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
        }
      `,
    });

    jestExpectToBeDefined(objects);

    const findObject = (nameSingular: string) => {
      const object = objects.find(
        (candidate: { nameSingular: string }) =>
          candidate.nameSingular === nameSingular,
      );

      jestExpectToBeDefined(object);

      return object;
    };

    const findFieldId = (
      object: { fieldsList?: { id: string; name: string }[] },
      name: string,
    ) => {
      const field = object.fieldsList?.find(
        (candidate: { name: string }) => candidate.name === name,
      );

      jestExpectToBeDefined(field);

      return field.id;
    };

    const personObject = findObject('person');
    const companyObject = findObject('company');
    const opportunityObject = findObject('opportunity');

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For Relation Traversal View Field',
        objectMetadataId: personObject.id,
        type: ViewType.TABLE,
        icon: 'IconUser',
      },
    });

    jestExpectToBeDefined(viewData?.createView?.id);

    testSetup = {
      createdViewId: viewData.createView.id,
      personCompanyRelationFieldId: findFieldId(personObject, 'company'),
      personJobTitleFieldId: findFieldId(personObject, 'jobTitle'),
      personOpportunitiesRelationFieldId: findFieldId(
        personObject,
        'pointOfContactForOpportunities',
      ),
      companyEmployeesFieldId: findFieldId(companyObject, 'employees'),
      companyNameFieldId: findFieldId(companyObject, 'name'),
      companyAccountOwnerRelationFieldId: findFieldId(
        companyObject,
        'accountOwner',
      ),
      opportunityNameFieldId: findFieldId(opportunityObject, 'name'),
    };
  });

  afterAll(async () => {
    if (testSetup?.createdViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: testSetup.createdViewId,
      });
    }
  });

  afterEach(async () => {
    for (const viewFieldId of createdViewFieldIds.splice(0)) {
      await destroyOneViewField({
        expectToFail: false,
        input: { id: viewFieldId },
      });
    }
  });

  it('should persist relationTargetFieldMetadataId and expose it through getViewFields', async () => {
    const { data } = await createOneViewField({
      expectToFail: false,
      input: {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
        position: 10,
        isVisible: true,
        size: 150,
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewFieldIds.push(data.createViewField.id);

    expect(data.createViewField).toMatchObject({
      viewId: testSetup.createdViewId,
      fieldMetadataId: testSetup.personCompanyRelationFieldId,
      relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
    });

    const { data: findData } = await findViewFields({
      expectToFail: false,
      viewId: testSetup.createdViewId,
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    expect(findData.getViewFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: data.createViewField.id,
          fieldMetadataId: testSetup.personCompanyRelationFieldId,
          relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
        }),
      ]),
    );
  });

  it('should default relationTargetFieldMetadataId to null', async () => {
    const { data } = await createOneViewField({
      expectToFail: false,
      input: {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personJobTitleFieldId,
        position: 10,
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewFieldIds.push(data.createViewField.id);

    expect(data.createViewField.relationTargetFieldMetadataId).toBeNull();
  });

  it('should allow the relation column and several traversed columns on the same relation in one view', async () => {
    const inputs: CreateViewFieldInput[] = [
      {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        position: 10,
      },
      {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
        position: 11,
      },
      {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        relationTargetFieldMetadataId: testSetup.companyNameFieldId,
        position: 12,
      },
    ];

    for (const input of inputs) {
      const { data } = await createOneViewField({
        expectToFail: false,
        input,
        gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
      });

      createdViewFieldIds.push(data.createViewField.id);

      expect(data.createViewField).toMatchObject({
        fieldMetadataId: input.fieldMetadataId,
        relationTargetFieldMetadataId:
          input.relationTargetFieldMetadataId ?? null,
      });
    }
  });

  it('should reject a duplicate (view, fieldMetadata, relationTargetFieldMetadata) triple', async () => {
    const input: CreateViewFieldInput = {
      viewId: testSetup.createdViewId,
      fieldMetadataId: testSetup.personCompanyRelationFieldId,
      relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
      position: 10,
    };

    const { data } = await createOneViewField({
      expectToFail: false,
      input,
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewFieldIds.push(data.createViewField.id);

    const { errors } = await createOneViewField({
      expectToFail: true,
      input: { ...input, position: 11 },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      extensions: {
        code: 'METADATA_VALIDATION_FAILED',
        errors: {
          viewField: [
            {
              errors: expect.arrayContaining([
                expect.objectContaining({
                  code: 'INVALID_VIEW_DATA',
                  message:
                    'View field with same fieldMetadataUniversalIdentifier, relationTargetFieldMetadataUniversalIdentifier and viewUniversalIdentifier already exists',
                }),
              ]),
            },
          ],
        },
      },
    });
  });

  it.each(eachTestingContextFilter(failingTestCases))(
    'should fail $title',
    async ({ context }) => {
      const { errors } = await createOneViewField({
        expectToFail: true,
        input: context.input(testSetup),
        gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        extensions: {
          code: 'METADATA_VALIDATION_FAILED',
          errors: {
            viewField: [
              {
                errors: expect.arrayContaining([
                  expect.objectContaining({
                    code: 'INVALID_VIEW_DATA',
                    message: context.expectedMessage,
                  }),
                ]),
              },
            ],
          },
        },
      });
    },
  );
});
