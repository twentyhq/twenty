import { type DeepPartial } from 'ai';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';

type AggregatedFieldMetadataDto = {
  description: (string | null)[];
  name: string[];
  label: string[];
  isActive: boolean[];
};
const aggregateFieldMetadata = (
  fieldMetadataDtos: { node: FieldMetadataDTO }[],
) => {
  const initialAcc: AggregatedFieldMetadataDto = {
    description: [],
    name: [],
    label: [],
    isActive: [],
  };

  return fieldMetadataDtos.reduce((acc, { node: fieldMetadataDto }) => {
    return {
      ...acc,
      description: [
        ...new Set([...acc.description, fieldMetadataDto.description]),
      ].sort(),
      isActive: [
        ...new Set([...acc.isActive, fieldMetadataDto.isActive]),
      ].sort(),
      label: [...new Set([...acc.label, fieldMetadataDto.label])].sort(),
      name: [...new Set([...acc.name, fieldMetadataDto.name])].sort(),
    };
  }, initialAcc);
};

describe('updateOne FieldMetadataService morph relation fields v2', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'personForMorphRelationSecond',
        namePlural: 'peopleForMorphRelationSecond',
        labelSingular: 'Person For Morph Relation',
        labelPlural: 'People For Morph Relation',
        icon: 'IconPerson',
      },
    });

    createdObjectMetadataPersonId = objectMetadataPersonId;

    const {
      data: {
        createOneObject: { id: objectMetadataCompanyId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'companyForMorphRelationSecond',
        namePlural: 'companiesForMorphRelationSecond',
        labelSingular: 'Company For Morph Relation',
        labelPlural: 'Companies For Morph Relation',
        icon: 'IconCompany',
      },
    });

    createdObjectMetadataCompanyId = objectMetadataCompanyId;

    const {
      data: {
        createOneObject: { id: objectMetadataOpportunityId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'opportunityForMorphRelationSecond',
        namePlural: 'opportunitiesForMorphRelationSecond',
        labelSingular: 'Opportunity For Morph Relation',
        labelPlural: 'Opportunities For Morph Relation',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = objectMetadataOpportunityId;
  });

  afterAll(async () => {
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

  beforeEach(async () => {
    const {
      data: { createOneField: rawCreateOneField },
    } = await createOneFieldMetadata({
      input: {
        label: 'field label',
        name: 'fieldName',
        objectMetadataId: createdObjectMetadataCompanyId,
        description: 'Description for all',
        type: FieldMetadataType.MORPH_RELATION,
        morphRelationsCreationPayload: [
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'toto',
            targetObjectMetadataId: createdObjectMetadataOpportunityId,
            type: RelationType.MANY_TO_ONE,
          },
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'tata',
            targetObjectMetadataId: createdObjectMetadataPersonId,
            type: RelationType.MANY_TO_ONE,
          },
        ],
      },
      expectToFail: false,
    });

    createdFieldMetadataId = rawCreateOneField.id;
  });

  it('It should update all morph related flat field metadata and their related field allowing its deletion', async () => {
    // SETUP
    const { fields: findResult } = await findManyFieldsMetadata({
      input: {
        filter: { id: { eq: createdFieldMetadataId } },
        paging: { first: 1 },
      },
      expectToFail: false,
      gqlFields: `
        id
        type
        name
        label
        isLabelSyncedWithName
        settings
        object {
          id
          nameSingular
        }
        morphRelations {
          type
          targetFieldMetadata {
            id
            type
          }
          sourceFieldMetadata {
            id
            type
          }
        }
      `,
    });

    expect(findResult.length).toBe(1);
    const createdMorphFromResult = findResult[0].node as FieldMetadataDTO & {
      morphRelations: RelationDTO[];
    };

    jestExpectToBeDefined(createdMorphFromResult);

    createdMorphFromResult.morphRelations.map((relationDto) =>
      expect(relationDto).toMatchObject<DeepPartial<RelationDTO>>({
        sourceFieldMetadata: {
          type: FieldMetadataType.MORPH_RELATION,
        },
        targetFieldMetadata: {
          type: FieldMetadataType.RELATION,
        },
      }),
    );

    const allMorphFieldIds = createdMorphFromResult.morphRelations.map(
      ({ sourceFieldMetadata }) => sourceFieldMetadata.id,
    );

    const allRelationFieldIds = createdMorphFromResult.morphRelations.map(
      ({ targetFieldMetadata }) => targetFieldMetadata.id,
    );

    /// ASSERT
    {
      const morphRelationFieldsBeforeUpdate = (await findManyFieldsMetadata({
        input: {
          filter: { id: { in: allMorphFieldIds } },
          paging: { first: allMorphFieldIds.length },
        },
        gqlFields: `
        id
        name
        description
        label
        isActive
      `,
        expectToFail: false,
      })) as { fields: { node: FieldMetadataDTO }[] };

      expect(morphRelationFieldsBeforeUpdate.fields.length).toBe(
        allMorphFieldIds.length,
      );
      const aggregatedMorphFieldMetadataDtos = aggregateFieldMetadata(
        morphRelationFieldsBeforeUpdate.fields,
      );

      expect(aggregatedMorphFieldMetadataDtos).toMatchSnapshot();
      expect(
        aggregatedMorphFieldMetadataDtos,
      ).toMatchObject<AggregatedFieldMetadataDto>({
        description: ['Description for all'],
        isActive: [true],
        label: ['field label'],
        name: [expect.any(String), expect.any(String)],
      });
      const relationFieldsBeforeUpdate = (await findManyFieldsMetadata({
        input: {
          filter: { id: { in: allRelationFieldIds } },
          paging: { first: allRelationFieldIds.length },
        },
        gqlFields: `
        id
        name
        description
        label
        isActive
      `,
        expectToFail: false,
      })) as { fields: { node: FieldMetadataDTO }[] };

      expect(relationFieldsBeforeUpdate.fields.length).toBe(
        allRelationFieldIds.length,
      );

      const aggregatedRelationFieldMetadataDtos = aggregateFieldMetadata(
        relationFieldsBeforeUpdate.fields,
      );

      expect(aggregatedRelationFieldMetadataDtos).toMatchSnapshot();
    }

    // UPDATE
    const input = {
      idToUpdate: createdFieldMetadataId,
      updatePayload: {
        isActive: false,
        label: 'new label',
        description: 'new description',
      },
    };

    await updateOneFieldMetadata({
      expectToFail: false,
      input,
      gqlFields: `
        id
        name
        description
        label
        isActive
        `,
    });

    //ASSERT
    {
      const morphRelationFieldsAfterUpdate = (await findManyFieldsMetadata({
        input: {
          filter: { id: { in: allMorphFieldIds } },
          paging: { first: allMorphFieldIds.length },
        },
        gqlFields: `
        id
        name
        description
        label
        isActive
      `,
        expectToFail: false,
      })) as { fields: { node: FieldMetadataDTO }[] };

      expect(morphRelationFieldsAfterUpdate.fields.length).toBe(
        allMorphFieldIds.length,
      );
      const aggregatedMorphFieldMetadataDtos = aggregateFieldMetadata(
        morphRelationFieldsAfterUpdate.fields,
      );

      expect(aggregatedMorphFieldMetadataDtos).toMatchSnapshot();
      expect(
        aggregatedMorphFieldMetadataDtos,
      ).toMatchObject<AggregatedFieldMetadataDto>({
        description: ['new description'],
        isActive: [false],
        label: ['new label'],
        name: [expect.any(String), expect.any(String)],
      });

      const allRelationFieldIds = createdMorphFromResult.morphRelations.map(
        ({ targetFieldMetadata }) => targetFieldMetadata.id,
      );

      const relationFieldsBeforeUpdate = (await findManyFieldsMetadata({
        input: {
          filter: { id: { in: allRelationFieldIds } },
          paging: { first: allRelationFieldIds.length },
        },
        gqlFields: `
        id
        name
        description
        label
        isActive
      `,
        expectToFail: false,
      })) as { fields: { node: FieldMetadataDTO }[] };

      expect(relationFieldsBeforeUpdate.fields.length).toBe(
        allRelationFieldIds.length,
      );

      const aggregatedRelationFieldMetadataDtos = aggregateFieldMetadata(
        relationFieldsBeforeUpdate.fields,
      );

      expect(aggregatedRelationFieldMetadataDtos).toMatchSnapshot();
    }

    await deleteOneFieldMetadata({
      input: {
        idToDelete: createdFieldMetadataId,
      },
      expectToFail: false,
    });
  });
});
