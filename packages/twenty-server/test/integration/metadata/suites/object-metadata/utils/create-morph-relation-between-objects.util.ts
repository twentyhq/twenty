import { type CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

type CreatedMorphRelationField =
  FieldMetadataEntity<FieldMetadataType.MORPH_RELATION> & {
    morphRelations: RelationDTO[];
  };

export const createMorphRelationBetweenObjects = async ({
  objectMetadataId,
  firstTargetObjectMetadataId,
  secondTargetObjectMetadataId,
  type,
  relationType,
  name,
  label,
  isLabelSyncedWithName,
  targetFieldLabel,
  targetFieldIcon,
}: {
  objectMetadataId: string;
  firstTargetObjectMetadataId: string;
  secondTargetObjectMetadataId: string;
  type: FieldMetadataType;
  relationType: RelationType;
  name?: string;
  label?: string;
  isLabelSyncedWithName?: boolean;
  targetFieldLabel?: string;
  targetFieldIcon?: string;
}): Promise<CreatedMorphRelationField> => {
  const createFieldInput: CreateOneFieldFactoryInput = {
    name: name || 'owner',
    label: label || 'owner field',
    type,
    objectMetadataId,
    isLabelSyncedWithName: isLabelSyncedWithName || false,
    morphRelationsCreationPayload: [
      {
        targetObjectMetadataId: firstTargetObjectMetadataId,
        targetFieldLabel: targetFieldLabel || 'opportunity',
        targetFieldIcon: targetFieldIcon || 'IconListOpportunity',
        type: relationType,
      },
      {
        targetObjectMetadataId: secondTargetObjectMetadataId,
        targetFieldLabel: targetFieldLabel || 'opportunity',
        targetFieldIcon: targetFieldIcon || 'IconListOpportunity',
        type: relationType,
      },
    ],
  };

  const {
    data: { createOneField: createdFieldPerson },
  } = await createOneFieldMetadata({
    input: createFieldInput,
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
              }
              targetObjectMetadata {
                id
              }
              sourceFieldMetadata {
                id
              }
              sourceObjectMetadata {
                id
              }
            }
          `,
    expectToFail: false,
  });

  const createdMorphRelationField =
    createdFieldPerson as CreatedMorphRelationField;

  const targetObjectMetadataIdsInCreationOrder = [
    firstTargetObjectMetadataId,
    secondTargetObjectMetadataId,
  ];

  // The API returns morph relations in database row order, which is not stable
  return {
    ...createdMorphRelationField,
    morphRelations: [...createdMorphRelationField.morphRelations].sort(
      (morphRelationA, morphRelationB) =>
        targetObjectMetadataIdsInCreationOrder.indexOf(
          morphRelationA.targetObjectMetadata.id,
        ) -
        targetObjectMetadataIdsInCreationOrder.indexOf(
          morphRelationB.targetObjectMetadata.id,
        ),
    ),
  };
};
