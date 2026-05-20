import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { destroyOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/destroy-one-view-filter.util';
import { updateOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/update-one-view-filter.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewFilterOperand, ViewType } from 'twenty-shared/types';

// Round-trip of relation-traversal view filters (the one-hop
// `relationTargetFieldMetadataId` carried alongside the source relation
// field id) through the metadata create + update mutations.
const RELATION_TRAVERSAL_GQL_FIELDS = `
    id
    fieldMetadataId
    operand
    value
    viewId
    subFieldName
    relationTargetFieldMetadataId
    createdAt
    updatedAt
    deletedAt
`;

describe('View Filter relation-traversal round-trip should succeed', () => {
  let createdViewId: string;
  let createdViewFilterId: string;
  let personCompanyRelationFieldId: string;
  let companyNameFieldId: string;
  let companyDomainNameFieldId: string;

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

    const personObject = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );
    jestExpectToBeDefined(personObject);

    const companyObject = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );
    jestExpectToBeDefined(companyObject);

    const personCompanyRelationField = personObject.fieldsList?.find(
      (field: { name: string; type: string }) =>
        field.name === 'company' && field.type === 'RELATION',
    );
    jestExpectToBeDefined(personCompanyRelationField);
    personCompanyRelationFieldId = personCompanyRelationField.id;

    const companyNameField = companyObject.fieldsList?.find(
      (field: { name: string }) => field.name === 'name',
    );
    jestExpectToBeDefined(companyNameField);
    companyNameFieldId = companyNameField.id;

    const companyDomainNameField = companyObject.fieldsList?.find(
      (field: { name: string }) => field.name === 'domainName',
    );
    jestExpectToBeDefined(companyDomainNameField);
    companyDomainNameFieldId = companyDomainNameField.id;

    const { data: viewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For Relation Traversal Filter',
        objectMetadataId: personObject.id,
        type: ViewType.TABLE,
        icon: 'IconUser',
      },
    });

    createdViewId = viewData?.createView?.id;
    jestExpectToBeDefined(createdViewId);
  });

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneView({
        expectToFail: false,
        viewId: createdViewId,
      });
    }
  });

  afterEach(async () => {
    if (createdViewFilterId) {
      await destroyOneViewFilter({
        expectToFail: false,
        input: { id: createdViewFilterId },
      });
      createdViewFilterId = '';
    }
  });

  it('should persist relationTargetFieldMetadataId on create', async () => {
    const { data } = await createOneViewFilter({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: personCompanyRelationFieldId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'Acme',
        relationTargetFieldMetadataId: companyNameFieldId,
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewFilterId = data?.createViewFilter?.id;

    expect(data.createViewFilter).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      fieldMetadataId: personCompanyRelationFieldId,
      relationTargetFieldMetadataId: companyNameFieldId,
      operand: ViewFilterOperand.CONTAINS,
      value: 'Acme',
    });
  });

  it('should default relationTargetFieldMetadataId to null when not provided', async () => {
    const { data } = await createOneViewFilter({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: personCompanyRelationFieldId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'Acme',
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewFilterId = data?.createViewFilter?.id;

    expect(data.createViewFilter).toMatchObject({
      id: expect.any(String),
      viewId: createdViewId,
      fieldMetadataId: personCompanyRelationFieldId,
      relationTargetFieldMetadataId: null,
    });
  });

  it('should update relationTargetFieldMetadataId on an existing filter', async () => {
    const { data: createData } = await createOneViewFilter({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: personCompanyRelationFieldId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'Acme',
        relationTargetFieldMetadataId: companyNameFieldId,
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewFilterId = createData?.createViewFilter?.id;
    jestExpectToBeDefined(createdViewFilterId);

    const { data: updateData } = await updateOneViewFilter({
      expectToFail: false,
      input: {
        id: createdViewFilterId,
        update: {
          relationTargetFieldMetadataId: companyDomainNameFieldId,
        },
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    expect(updateData.updateViewFilter).toMatchObject({
      id: createdViewFilterId,
      fieldMetadataId: personCompanyRelationFieldId,
      relationTargetFieldMetadataId: companyDomainNameFieldId,
    });
  });

  it('should preserve relationTargetFieldMetadataId when an unrelated property is updated', async () => {
    const { data: createData } = await createOneViewFilter({
      expectToFail: false,
      input: {
        viewId: createdViewId,
        fieldMetadataId: personCompanyRelationFieldId,
        operand: ViewFilterOperand.CONTAINS,
        value: 'Acme',
        relationTargetFieldMetadataId: companyNameFieldId,
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    createdViewFilterId = createData?.createViewFilter?.id;
    jestExpectToBeDefined(createdViewFilterId);

    const { data: updateData } = await updateOneViewFilter({
      expectToFail: false,
      input: {
        id: createdViewFilterId,
        update: {
          value: 'Acme Corp',
        },
      },
      gqlFields: RELATION_TRAVERSAL_GQL_FIELDS,
    });

    expect(updateData.updateViewFilter).toMatchObject({
      id: createdViewFilterId,
      value: 'Acme Corp',
      relationTargetFieldMetadataId: companyNameFieldId,
    });
  });
});
