import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { destroyOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { ViewSortDirection, ViewType } from 'twenty-shared/types';

import { type CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';

const RELATION_TRAVERSAL_GQL_FIELDS = `
    id
    fieldMetadataId
    relationTargetFieldMetadataId
    direction
    viewId
`;

type TestSetup = {
  createdViewId: string;
  personCompanyRelationFieldId: string;
  personJobTitleFieldId: string;
  personOpportunitiesRelationFieldId: string;
  companyEmployeesFieldId: string;
  companyAccountOwnerRelationFieldId: string;
  opportunityNameFieldId: string;
};

type FailingTestContext = {
  input: (testSetup: TestSetup) => CreateViewSortInput;
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
        direction: ViewSortDirection.ASC,
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
        direction: ViewSortDirection.ASC,
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
        direction: ViewSortDirection.ASC,
      }),
      expectedMessage: 'Relation target field cannot be a relation field',
    },
  },
];

describe('View sort relation traversal', () => {
  let testSetup: TestSetup;
  const createdViewSortIds: string[] = [];

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
        name: 'Test View For Relation Traversal View Sort',
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
    for (const viewSortId of createdViewSortIds.splice(0)) {
      await destroyOneViewSort({
        expectToFail: false,
        input: { id: viewSortId },
      });
    }
  });

  it('should persist relationTargetFieldMetadataId on create', async () => {
    const { data } = await createOneViewSort({
      expectToFail: false,
      input: {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
        direction: ViewSortDirection.DESC,
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewSortIds.push(data.createViewSort.id);

    expect(data.createViewSort).toMatchObject({
      viewId: testSetup.createdViewId,
      fieldMetadataId: testSetup.personCompanyRelationFieldId,
      relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
      direction: ViewSortDirection.DESC,
    });
  });

  it('should default relationTargetFieldMetadataId to null', async () => {
    const { data } = await createOneViewSort({
      expectToFail: false,
      input: {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personJobTitleFieldId,
        direction: ViewSortDirection.ASC,
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewSortIds.push(data.createViewSort.id);

    expect(data.createViewSort.relationTargetFieldMetadataId).toBeNull();
  });

  it('should allow a plain sort and a traversed sort on the same relation field', async () => {
    const inputs: CreateViewSortInput[] = [
      {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        direction: ViewSortDirection.ASC,
      },
      {
        viewId: testSetup.createdViewId,
        fieldMetadataId: testSetup.personCompanyRelationFieldId,
        relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
        direction: ViewSortDirection.DESC,
      },
    ];

    for (const input of inputs) {
      const { data } = await createOneViewSort({
        expectToFail: false,
        input,
        gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
      });

      createdViewSortIds.push(data.createViewSort.id);

      expect(data.createViewSort).toMatchObject({
        fieldMetadataId: input.fieldMetadataId,
        relationTargetFieldMetadataId:
          input.relationTargetFieldMetadataId ?? null,
        direction: input.direction,
      });
    }
  });

  it('should reject a duplicate (view, fieldMetadata, relationTargetFieldMetadata) triple', async () => {
    const input: CreateViewSortInput = {
      viewId: testSetup.createdViewId,
      fieldMetadataId: testSetup.personCompanyRelationFieldId,
      relationTargetFieldMetadataId: testSetup.companyEmployeesFieldId,
      direction: ViewSortDirection.ASC,
    };

    const { data } = await createOneViewSort({
      expectToFail: false,
      input,
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewSortIds.push(data.createViewSort.id);

    const { errors } = await createOneViewSort({
      expectToFail: true,
      input,
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      extensions: {
        code: 'METADATA_VALIDATION_FAILED',
        errors: {
          viewSort: [
            {
              errors: expect.arrayContaining([
                expect.objectContaining({
                  code: 'INVALID_VIEW_SORT_DATA',
                  message:
                    'View sort with same fieldMetadataId, relationTargetFieldMetadataId and viewId already exists',
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
      const { errors } = await createOneViewSort({
        expectToFail: true,
        input: context.input(testSetup),
        gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        extensions: {
          code: 'METADATA_VALIDATION_FAILED',
          errors: {
            viewSort: [
              {
                errors: expect.arrayContaining([
                  expect.objectContaining({
                    code: 'INVALID_VIEW_SORT_DATA',
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
