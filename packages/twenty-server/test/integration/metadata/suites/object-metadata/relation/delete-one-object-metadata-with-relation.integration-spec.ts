import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { forceCreateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/force-create-one-object-metadata.util';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';

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
  let globalTestContext: {
    opportunityMetadataId: string;
    personMetadataId: string;
    relationField: FieldMetadataDTO & {
      relation: RelationDTO;
    };
  };

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await forceCreateOneObjectMetadata({
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
    } = await forceCreateOneObjectMetadata({
      input: {
        nameSingular: 'opportunityForRelation',
        namePlural: 'opportunitiesForRelation',
        labelSingular: 'Opportunity For Relation',
        labelPlural: 'Opportunities For Relation',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = objectMetadataOpportunityId;

    globalTestContext = {
      opportunityMetadataId: createdObjectMetadataOpportunityId,
      personMetadataId: createdObjectMetadataPersonId,
      relationField:
        await createRelationBetweenObjects<FieldMetadataType.RELATION>({
          objectMetadataId: createdObjectMetadataOpportunityId,
          targetObjectMetadataId: createdObjectMetadataPersonId,
          type: FieldMetadataType.RELATION,
          relationType: RelationType.MANY_TO_ONE,
        }),
    };
  });

  afterEach(async () => {
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
    const computedContext = context({
      objectMetadataIdToDelete: globalTestContext.opportunityMetadataId,
      relationFieldId: globalTestContext.relationField.id,
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
