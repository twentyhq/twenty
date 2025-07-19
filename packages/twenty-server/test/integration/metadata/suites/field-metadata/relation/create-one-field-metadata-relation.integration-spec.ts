import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('createOne FieldMetadataService relation fields', () => {
  let createdObjectMetadataPersonId = '';
  let createdObjectMetadataOpportunityId = '';

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
  });

  type EachTestingContextArray = EachTestingContext<
    (args: { objectMetadataId: string; targetObjectMetadataId: string }) => {
      relationType: RelationType;
      objectMetadataId: string;
      targetObjectMetadataId: string;
      type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
    }
  >[];

  const eachTestingContextArray: EachTestingContextArray = [
    {
      title: 'should create a RELATION field type MANY_TO_ONE',
      context: ({ objectMetadataId, targetObjectMetadataId }) => ({
        relationType: RelationType.MANY_TO_ONE,
        objectMetadataId,
        targetObjectMetadataId,
        type: FieldMetadataType.RELATION,
      }),
    },
    {
      title: 'should create a RELATION field type ONE_TO_MANY',
      context: ({ objectMetadataId, targetObjectMetadataId }) => ({
        relationType: RelationType.ONE_TO_MANY,
        objectMetadataId,
        targetObjectMetadataId,
        type: FieldMetadataType.RELATION,
      }),
    },
  ];

  it.each(eachTestingContextArray)('$title', async ({ context }) => {
    const contextPayload = context({
      objectMetadataId: createdObjectMetadataOpportunityId,
      targetObjectMetadataId: createdObjectMetadataPersonId,
    });

    const createdField = await createRelationBetweenObjects<
      typeof contextPayload.type
    >({
      objectMetadataId: contextPayload.objectMetadataId,
      targetObjectMetadataId: contextPayload.targetObjectMetadataId,
      type: contextPayload.type,
      relationType: contextPayload.relationType,
    });

    expect(createdField.id).toBeDefined();
    expect(createdField.name).toBe('person');
    expect(createdField.relation?.type).toBe(contextPayload.relationType);
    expect(createdField.relation?.targetFieldMetadata.id).toBeDefined();
    // TODO: expect(createdField.morphRelations).toBeUndefined();
    const isManyToOne =
      contextPayload.relationType === RelationType.MANY_TO_ONE;

    if (isManyToOne) {
      expect(createdField.settings?.joinColumnName).toBe('personId');
    } else {
      expect(createdField.settings?.joinColumnName).toBeUndefined();
    }

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
      isManyToOne ? RelationType.ONE_TO_MANY : RelationType.MANY_TO_ONE,
    );
    expect(
      opportunityFieldOnPerson.relation.targetFieldMetadata.id,
    ).toBeDefined();
    expect(
      opportunityFieldOnPerson.relation.targetObjectMetadata.id,
    ).toBeDefined();

    if (!isManyToOne) {
      expect(opportunityFieldOnPerson.settings?.joinColumnName).toBe(
        'opportunityId',
      );
    } else {
      expect(opportunityFieldOnPerson.settings?.joinColumnName).toBeUndefined();
    }

    await deleteOneFieldMetadata({
      input: { idToDelete: createdField.id },
    }).catch();
  });
});

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
          targetFieldMetadata {
            id
          }
          targetObjectMetadata {
            id
          }
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
