import { CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('createOne FieldMetadataService relation fields', () => {
  let createdObjectMetadataPersonId = '';
  let createdObjectMetadataOpportunityId = '';
  let createdObjectMetadataCompanyId = '';

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'personForRelation',
        namePlural: 'peopleForRelation',
        labelSingular: 'Person For Relation',
        labelPlural: 'People For Relation',
        icon: 'IconPerson',
      },
    });

    createdObjectMetadataPersonId = objectMetadataPersonId;

    const {
      data: {
        createOneObject: { id: objectMetadataCompanyId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'companyForRelation',
        namePlural: 'companiesForRelation',
        labelSingular: 'Company For Relation',
        labelPlural: 'Companies For Relation',
        icon: 'IconCompany',
      },
    });

    createdObjectMetadataCompanyId = objectMetadataCompanyId;

    const {
      data: {
        createOneObject: { id: objectMetadataOpportunityId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'opportunityForRelation',
        namePlural: 'opportunitiesForRelation',
        labelSingular: 'Opportunity For Relation',
        labelPlural: 'Opportunities For Relation',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = objectMetadataOpportunityId;
  });
  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataPersonId },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataOpportunityId },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataCompanyId },
    });
  });

  it('should create a RELATION field type', async () => {
    const createdFieldPerson = await createFieldOnObject({
      objectMetadataId: createdObjectMetadataOpportunityId,
      targetObjectMetadataId: createdObjectMetadataPersonId,
    });

    expect(createdFieldPerson.name).toBe('person');

    const opportunityFieldOnPerson = await findFieldMetadata({
      fieldMetadataId: createdFieldPerson.relation.targetFieldMetadata.id,
    });

    expect(opportunityFieldOnPerson.object.nameSingular).toBe(
      'personForRelation',
    );
    expect(opportunityFieldOnPerson.relation.type).toBe(
      RelationType.ONE_TO_MANY,
    );

    await deleteOneFieldMetadata({
      input: { idToDelete: createdFieldPerson.id },
    });
  });

  it('should fail to find a RELATION field, if the Object is deleted', async () => {
    const createdFieldPerson = await createFieldOnObject({
      objectMetadataId: createdObjectMetadataOpportunityId,
      targetObjectMetadataId: createdObjectMetadataPersonId,
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataOpportunityId },
    });

    const createdFieldPersonAfter = await findFieldMetadata({
      fieldMetadataId: createdFieldPerson.id,
    });

    expect(createdFieldPersonAfter).toBeUndefined();

    await deleteOneFieldMetadata({
      input: { idToDelete: createdFieldPerson.id },
    });
  });

  it('should fail to find a RELATION field, if the target Object is deleted', async () => {
    const createdFieldPerson = await createFieldOnObject({
      objectMetadataId: createdObjectMetadataOpportunityId,
      targetObjectMetadataId: createdObjectMetadataPersonId,
    });

    const opportunityFieldOnPersonBefore = await findFieldMetadata({
      fieldMetadataId: createdFieldPerson.relation.targetFieldMetadata.id,
    });

    expect(opportunityFieldOnPersonBefore.object.nameSingular).toBe(
      'personForRelation',
    );

    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataPersonId },
    });

    const opportunityFieldOnPersonAfter = await findFieldMetadata({
      fieldMetadataId: createdFieldPerson.relation.targetFieldMetadata.id,
    });

    expect(opportunityFieldOnPersonAfter).toBeUndefined();

    await deleteOneFieldMetadata({
      input: { idToDelete: createdFieldPerson.id },
    });
  });

  // TODO: replace xit by it once the Morph works
  xit('should create a MORPH_RELATION field type', async () => {
    const createFieldInput: CreateOneFieldFactoryInput = {
      name: 'owner',
      label: 'owner field',
      type: FieldMetadataType.MORPH_RELATION,
      objectMetadataId: createdObjectMetadataOpportunityId,
      isLabelSyncedWithName: false,
      morphRelationsCreationPayload: [
        {
          targetObjectMetadataId: createdObjectMetadataPersonId,
          targetFieldLabel: 'opportunity',
          targetFieldIcon: 'IconListOpportunity',
          type: RelationType.MANY_TO_ONE,
        },
        {
          targetObjectMetadataId: createdObjectMetadataCompanyId,
          targetFieldLabel: 'opportunity',
          targetFieldIcon: 'IconListOpportunity',
          type: RelationType.MANY_TO_ONE,
        },
      ],
    };

    const { data: createdFieldOwner } = await createOneFieldMetadata({
      input: createFieldInput,
      gqlFields: `
              id
              name
              label
              isLabelSyncedWithName
            `,
      expectToFail: false,
    });

    // expect(createdFieldOwner.createOneField.name).toBe('owner');

    await deleteOneFieldMetadata({
      input: { idToDelete: createdFieldOwner.createOneField.id },
    });
  });
});

const createFieldOnObject = async ({
  objectMetadataId,
  targetObjectMetadataId,
}: {
  objectMetadataId: string;
  targetObjectMetadataId: string;
}) => {
  const createFieldInput: CreateOneFieldFactoryInput = {
    name: 'person',
    label: 'person field',
    type: FieldMetadataType.RELATION,
    objectMetadataId: objectMetadataId,
    isLabelSyncedWithName: false,
    relationCreationPayload: {
      targetObjectMetadataId: targetObjectMetadataId,
      targetFieldLabel: 'opportunity',
      targetFieldIcon: 'IconListOpportunity',
      type: RelationType.MANY_TO_ONE,
    },
  };

  const {
    data: { createOneField: createdFieldPerson },
  } = await createOneFieldMetadata({
    input: createFieldInput,
    gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
            relation {
              type
              targetFieldMetadata {
                id
              }
            }
            settings
            object {
              id
              nameSingular
            }
          `,
    expectToFail: false,
  });

  return createdFieldPerson;
};

const findFieldMetadata = async ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}) => {
  const operation = findManyFieldsMetadataQueryFactory({
    gqlFields: `
        id
        name
        object {
          id
          nameSingular
        }
        relation {
          type
        }
        settings
    `,
    input: {
      filter: {
        id: { eq: fieldMetadataId },
      },
      paging: { first: 10 },
    },
  });

  const fields = await makeMetadataAPIRequest(operation);
  const field = fields.body.data.fields.edges?.[0]?.node;

  return field;
};
