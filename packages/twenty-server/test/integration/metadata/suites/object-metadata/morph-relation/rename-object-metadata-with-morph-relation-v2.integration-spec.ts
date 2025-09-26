import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('Rename an object metadata with morph relation should succeed', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: aId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'opportunityForRenameSecond',
        namePlural: 'opportunitiesForRenameSecond',
        labelSingular: 'Opportunity For Rename',
        labelPlural: 'Opportunities For Rename',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = aId;
    const {
      data: {
        createOneObject: { id: bId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'personForRenameSecond',
        namePlural: 'peopleForRenameSecond',
        labelSingular: 'Person For Rename',
        labelPlural: 'People For Rename',
        icon: 'IconPerson',
      },
    });

    createdObjectMetadataPersonId = bId;
    const {
      data: {
        createOneObject: { id: cId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'companyForRenameSecond',
        namePlural: 'companiesForRenameSecond',
        labelSingular: 'Company For Rename',
        labelPlural: 'Companies For Rename',
        icon: 'IconCompany',
      },
    });

    createdObjectMetadataCompanyId = cId;
  });

  afterEach(async () => {
    const createdObjectMetadataIds = [
      createdObjectMetadataPersonId,
      createdObjectMetadataOpportunityId,
      createdObjectMetadataCompanyId,
    ];

    for (const objectMetadataId of createdObjectMetadataIds) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataId },
      });
    }
  });

  it.failing(
    'should rename custom object, and update both the field name and join column name of the morph relation that contains the object name',
    async () => {
      const morphRelationField = await createMorphRelationBetweenObjects({
        name: 'owner',
        objectMetadataId: createdObjectMetadataOpportunityId,
        firstTargetObjectMetadataId: createdObjectMetadataPersonId,
        secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
        type: FieldMetadataType.MORPH_RELATION,
        relationType: RelationType.MANY_TO_ONE,
      });

      expect(morphRelationField.morphRelations.length).toBe(2);

      const { data } = await updateOneObjectMetadata({
        expectToFail: false,
        gqlFields: `
      nameSingular
      labelSingular
      namePlural
      labelPlural
      `,
        input: {
          idToUpdate: createdObjectMetadataPersonId,
          updatePayload: {
            nameSingular: 'personForRenameSecond2',
            namePlural: 'peopleForRenameSecond2',
            labelSingular: 'Person For Rename2',
            labelPlural: 'People For Rename2',
          },
        },
      });

      expect(data.updateOneObject.nameSingular).toBe('personForRenameSecond2');

      const ownerFieldMetadataOnPersonId =
        morphRelationField.morphRelations.find(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.id ===
            createdObjectMetadataPersonId,
        )?.sourceFieldMetadata.id;

      if (!ownerFieldMetadataOnPersonId) {
        throw new Error(
          'Morph Relation Error: Owner field metadata on person not found',
        );
      }

      const fieldAfterRenaming = await findFieldMetadata({
        fieldMetadataId: ownerFieldMetadataOnPersonId,
      });

      expect(fieldAfterRenaming.settings.joinColumnName).toBe(
        'ownerPersonForRenameSecond2Id',
      );
    },
  );
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
      object { id nameSingular }
      relation { type targetFieldMetadata { id } targetObjectMetadata { id } }
      settings
    `,
    input: {
      filter: { id: { eq: fieldMetadataId } },
      paging: { first: 1 },
    },
  });
  const fields = await makeMetadataAPIRequest(operation);
  const field = fields.body.data.fields.edges?.[0]?.node;

  return field;
};
