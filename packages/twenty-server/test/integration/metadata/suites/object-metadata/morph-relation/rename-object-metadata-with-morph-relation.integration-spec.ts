import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { forceCreateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/force-create-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

describe('Rename an object metadata with morph relation should succeed', () => {
  let opportunityId = '';
  let personId = '';
  let companyId = '';
  let morphRelationField: FieldMetadataEntity<FieldMetadataType.MORPH_RELATION> & {
    morphRelations: RelationDTO[];
  };

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: aId },
      },
    } = await forceCreateOneObjectMetadata({
      input: {
        nameSingular: 'opportunityForRename',
        namePlural: 'opportunitiesForRename',
        labelSingular: 'Opportunity For Rename',
        labelPlural: 'Opportunities For Rename',
        icon: 'IconOpportunity',
      },
    });

    opportunityId = aId;
    const {
      data: {
        createOneObject: { id: bId },
      },
    } = await forceCreateOneObjectMetadata({
      input: {
        nameSingular: 'personForRename',
        namePlural: 'peopleForRename',
        labelSingular: 'Person For Rename',
        labelPlural: 'People For Rename',
        icon: 'IconPerson',
      },
    });

    personId = bId;
    const {
      data: {
        createOneObject: { id: cId },
      },
    } = await forceCreateOneObjectMetadata({
      input: {
        nameSingular: 'companyForRename',
        namePlural: 'companiesForRename',
        labelSingular: 'Company For Rename',
        labelPlural: 'Companies For Rename',
        icon: 'IconCompany',
      },
    });

    companyId = cId;
  });

  afterEach(async () => {
    await deleteOneObjectMetadata({ input: { idToDelete: opportunityId } });
    await deleteOneObjectMetadata({ input: { idToDelete: personId } });
    await deleteOneObjectMetadata({ input: { idToDelete: companyId } });
  });

  it('should rename custom object, and update the join column name of the morph relation that contains the object name', async () => {
    morphRelationField = await createMorphRelationBetweenObjects({
      name: 'owner',
      objectMetadataId: opportunityId,
      firstTargetObjectMetadataId: personId,
      secondTargetObjectMetadataId: companyId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.MANY_TO_ONE,
    });

    const { data } = await updateOneObjectMetadata({
      gqlFields: `
      nameSingular
      labelSingular
      namePlural
      labelPlural
      `,
      input: {
        idToUpdate: personId,
        updatePayload: {
          nameSingular: 'personForRename2',
          namePlural: 'peopleForRename2',
          labelSingular: 'Person For Rename2',
          labelPlural: 'People For Rename2',
        },
      },
    });

    expect(data.updateOneObject.nameSingular).toBe('personForRename2');

    const ownerFieldMetadataOnPersonId = morphRelationField.morphRelations.find(
      (morphRelation) => morphRelation.targetObjectMetadata.id === personId,
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
      'ownerPersonForRename2Id',
    );
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
