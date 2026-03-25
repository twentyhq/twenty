import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';

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
  let createdObjectMetadataPersonId: undefined | string;
  let createdObjectMetadataOpportunityId: undefined | string;
  let relationField: FieldMetadataDTO & {
    relation: RelationDTO;
  };

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

    relationField =
      await createRelationBetweenObjects<FieldMetadataType.RELATION>({
        objectMetadataId: createdObjectMetadataOpportunityId,
        targetObjectMetadataId: createdObjectMetadataPersonId,
        type: FieldMetadataType.RELATION,
        relationType: RelationType.MANY_TO_ONE,
      });
  });

  afterEach(async () => {
    if (isDefined(createdObjectMetadataPersonId)) {
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
    }

    if (isDefined(createdObjectMetadataOpportunityId)) {
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
    }
  });

  it.each(successfulDeleteSourceUseCase)('$title', async ({ context }) => {
    jestExpectToBeDefined(createdObjectMetadataPersonId);
    const computedContext = context({
      objectMetadataIdToDelete: createdObjectMetadataPersonId,
      relationFieldId: relationField.id,
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: computedContext.objectMetadataIdToDelete,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: computedContext.objectMetadataIdToDelete },
    });

    createdObjectMetadataPersonId = undefined;
    const opportunityFieldOnPersonAfterDeletion = await findFieldMetadata({
      fieldMetadataId: computedContext.relationFieldId,
    });

    expect(opportunityFieldOnPersonAfterDeletion).toBeUndefined();
  });

  it.each(successfulDeleteTargetUseCase)('$title', async ({ context }) => {
    jestExpectToBeDefined(createdObjectMetadataOpportunityId);
    const computedContext = context({
      objectMetadataIdToDelete: createdObjectMetadataOpportunityId,
      relationFieldId: relationField.id,
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: computedContext.objectMetadataIdToDelete,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: computedContext.objectMetadataIdToDelete },
    });

    createdObjectMetadataOpportunityId = undefined;
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
