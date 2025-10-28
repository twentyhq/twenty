import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('Delete Object metadata with morph relation should succeed', () => {
  let opportunityId: undefined | string;
  let personId = '';
  let companyId = '';
  let morphRelationField: { id: string };

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: aId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'opportunityForDelete',
        namePlural: 'opportunitiesForDelete',
        labelSingular: 'Opportunity For Delete',
        labelPlural: 'Opportunities For Delete',
        icon: 'IconOpportunity',
      },
    });

    opportunityId = aId;
    const {
      data: {
        createOneObject: { id: bId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'personForDelete',
        namePlural: 'peopleForDelete',
        labelSingular: 'Person For Delete',
        labelPlural: 'People For Delete',
        icon: 'IconPerson',
      },
    });

    personId = bId;
    const {
      data: {
        createOneObject: { id: cId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'companyForDelete',
        namePlural: 'companiesForDelete',
        labelSingular: 'Company For Delete',
        labelPlural: 'Companies For Delete',
        icon: 'IconCompany',
      },
    });

    companyId = cId;
  });

  afterEach(async () => {
    if (isDefined(opportunityId)) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: opportunityId,
          updatePayload: {
            isActive: false,
          },
        },
      });
      await deleteOneObjectMetadata({ input: { idToDelete: opportunityId } });
      opportunityId = undefined;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: personId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({ input: { idToDelete: personId } });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: companyId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({ input: { idToDelete: companyId } });
  });

  it('When deleting source object, the relation on the target should be deleted', async () => {
    jestExpectToBeDefined(opportunityId);
    morphRelationField = await createMorphRelationBetweenObjects({
      objectMetadataId: opportunityId,
      firstTargetObjectMetadataId: personId,
      secondTargetObjectMetadataId: companyId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.MANY_TO_ONE,
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: opportunityId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({ input: { idToDelete: opportunityId } });
    const fieldAfterDeletion = await findFieldMetadata({
      fieldMetadataId: morphRelationField.id,
    });

    expect(fieldAfterDeletion).toBeUndefined();
    opportunityId = undefined;
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
