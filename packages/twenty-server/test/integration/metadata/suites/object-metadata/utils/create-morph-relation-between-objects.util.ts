import { CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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
}) => {
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

  // TODO: add morphRelations to the query once available
  // morphRelations {
  //   type
  //   targetFieldMetadata {
  //     id
  //   }
  // }
  const {
    data: { createOneField: createdFieldPerson },
  } = await createOneFieldMetadata({
    input: createFieldInput,
    gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
            settings
            object {
              id
              nameSingular
            }
          `,
    expectToFail: false,
  });

  return createdFieldPerson as FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>;
};
