import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type DeleteOneObjectMetadataItemTestingContext = EachTestingContext<
  (args: { objectMetadataIdToDelete: string; relationFieldId: string }) => {
    objectMetadataIdToDelete: string;
    relationFieldId: string;
  }
>[];
const successfulDeleteSourceUseCase: DeleteOneObjectMetadataItemTestingContext =
  [
    {
      title:
        'When deleting source object, the relation on the target should be deleted',
      context: ({ objectMetadataIdToDelete, relationFieldId }) => ({
        objectMetadataIdToDelete,
        relationFieldId,
      }),
    },
  ];

const successfulDeleteTargetUseCase: DeleteOneObjectMetadataItemTestingContext =
  [
    {
      title:
        'When deleting target object, the relation on the source should be deleted',
      context: ({ objectMetadataIdToDelete, relationFieldId }) => ({
        objectMetadataIdToDelete,
        relationFieldId,
      }),
    },
  ];

describe('Delete Object metadata with relation should succeed', () => {
  let createdObjectMetadataPersonId = '';
  let createdObjectMetadataOpportunityId = '';
  let createdRelationField: FieldMetadataInterface<FieldMetadataType.RELATION>;
  let globalTestContext: {
    opportunityMetadataId: string;
    personMetadataId: string;
    relationField: FieldMetadataInterface<FieldMetadataType.RELATION>;
  };

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

    createdRelationField =
      await createRelationBetweenObjects<FieldMetadataType.RELATION>({
        objectMetadataId: createdObjectMetadataOpportunityId,
        targetObjectMetadataId: createdObjectMetadataPersonId,
        type: FieldMetadataType.RELATION,
        relationType: RelationType.MANY_TO_ONE,
      });

    globalTestContext = {
      opportunityMetadataId: createdObjectMetadataOpportunityId,
      personMetadataId: createdObjectMetadataPersonId,
      relationField: createdRelationField,
    };
  });
  afterEach(async () => {
    await deleteOneFieldMetadata({
      input: { idToDelete: createdRelationField.id },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataPersonId },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataOpportunityId },
    });
  });

  it.each(successfulDeleteSourceUseCase)('$title', async ({ context }) => {
    const computedContext = context({
      objectMetadataIdToDelete: globalTestContext.personMetadataId,
      relationFieldId: globalTestContext.relationField.id,
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: computedContext.objectMetadataIdToDelete },
    });

    const opportunityFieldOnPersonAfterDeletion = await findFieldMetadata({
      fieldMetadataId: computedContext.relationFieldId,
    });

    expect(opportunityFieldOnPersonAfterDeletion).toBeUndefined();
  });

  it.each(successfulDeleteTargetUseCase)('$title', async ({ context }) => {
    if (!isDefined(globalTestContext.relationField.relation)) {
      throw new Error('Relation field relation is undefined');
    }

    const computedContext = context({
      objectMetadataIdToDelete: globalTestContext.opportunityMetadataId,
      relationFieldId:
        globalTestContext.relationField.relation.targetFieldMetadata.id,
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: computedContext.objectMetadataIdToDelete },
    });

    const personFieldOnOpportunityAfterDeletion = await findFieldMetadata({
      fieldMetadataId: computedContext.relationFieldId,
    });

    expect(personFieldOnOpportunityAfterDeletion).toBeUndefined();
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
      paging: { first: 1 },
    },
  });

  const fields = await makeMetadataAPIRequest(operation);
  const field = fields.body.data.fields.edges?.[0]?.node;

  return field;
};
