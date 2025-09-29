import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('createOne FieldMetadataService relation fields', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
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
        createOneObject: { id: objectMetadataOpportunityId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
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
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataPersonId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataPersonId },
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataOpportunityId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataOpportunityId },
    });
  });

  it('MANY TO ONE field relation creation', async () => {
    const createdField = await createRelationBetweenObjects({
      objectMetadataId: createdObjectMetadataOpportunityId,
      targetObjectMetadataId: createdObjectMetadataPersonId,
      relationType: RelationType.MANY_TO_ONE,
      type: FieldMetadataType.RELATION,
      name: 'person',
    });

    expect(createdField.id).toBeDefined();
    expect(createdField.name).toBe('person');
    expect(createdField.relation?.type).toBe(RelationType.MANY_TO_ONE);
    expect(createdField.relation?.targetFieldMetadata.id).toBeDefined();

    expect(createdField.settings?.joinColumnName).toBe('personId');

    if (!isDefined(createdField.relation?.targetFieldMetadata?.id)) {
      throw new Error('targetFieldMetadata.id is not defined');
    }

    const opportunityFieldOnPerson = await findFieldMetadata({
      fieldMetadataId: createdField.relation.targetFieldMetadata.id,
    });

    expect(opportunityFieldOnPerson.object.nameSingular).toBe(
      'personForRelation',
    );
    expect(opportunityFieldOnPerson.relation.type).toBe(
      RelationType.ONE_TO_MANY,
    );
    expect(
      opportunityFieldOnPerson.relation.targetFieldMetadata.id,
    ).toBeDefined();
    expect(
      opportunityFieldOnPerson.relation.targetObjectMetadata.id,
    ).toBeDefined();
    expect(opportunityFieldOnPerson.settings?.joinColumnName).toBeUndefined();
  });

  it('ONE TO MANY field relation creation', async () => {
    const createdField = await createRelationBetweenObjects({
      objectMetadataId: createdObjectMetadataOpportunityId,
      targetObjectMetadataId: createdObjectMetadataPersonId,
      relationType: RelationType.ONE_TO_MANY,
      type: FieldMetadataType.RELATION,
      name: 'person',
    });

    expect(createdField.id).toBeDefined();
    expect(createdField.name).toBe('person');
    expect(createdField.relation?.type).toBe(RelationType.ONE_TO_MANY);
    expect(createdField.relation?.targetFieldMetadata.id).toBeDefined();

    expect(createdField.settings?.joinColumnName).toBeUndefined();

    if (!isDefined(createdField.relation?.targetFieldMetadata?.id)) {
      throw new Error('targetFieldMetadata.id is not defined');
    }

    const opportunityFieldOnPerson = await findFieldMetadata({
      fieldMetadataId: createdField.relation.targetFieldMetadata.id,
    });

    expect(opportunityFieldOnPerson.object.nameSingular).toBe(
      'personForRelation',
    );
    expect(opportunityFieldOnPerson.relation.type).toBe(
      RelationType.MANY_TO_ONE,
    );
    expect(
      opportunityFieldOnPerson.relation.targetFieldMetadata.id,
    ).toBeDefined();
    expect(
      opportunityFieldOnPerson.relation.targetObjectMetadata.id,
    ).toBeDefined();

    expect(opportunityFieldOnPerson.settings?.joinColumnName).toBe(
      'opportunityId',
    );
  });
});

const findFieldMetadata = async ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}) => {
  const { fields } = await findManyFieldsMetadata({
    input: {
      filter: {
        id: { eq: fieldMetadataId },
      },
      paging: { first: 10 },
    },
    expectToFail: false,
    gqlFields: `
        id
        name
        object {
          id
          nameSingular
        }
        relation {
          type
          targetFieldMetadata {
            id
          }
          targetObjectMetadata {
            id
          }
        }
        settings
    `,
  });

  expect(fields.length).toBe(1);
  const field = fields[0]?.node;

  return field;
};
