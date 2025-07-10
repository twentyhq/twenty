import { CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export const createRelationBetweenObjects = async ({
  objectMetadataId,
  targetObjectMetadataId,
  type,
  relationType,
  name,
  label,
  isLabelSyncedWithName,
  targetFieldLabel,
  targetFieldIcon,
}: {
  objectMetadataId: string;
  targetObjectMetadataId: string;
  type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  relationType: RelationType;
  name?: string;
  label?: string;
  isLabelSyncedWithName?: boolean;
  targetFieldLabel?: string;
  targetFieldIcon?: string;
}) => {
  const createFieldInput: CreateOneFieldFactoryInput = {
    name: name || 'person',
    label: label || 'person field',
    type: type,
    objectMetadataId: objectMetadataId,
    isLabelSyncedWithName: isLabelSyncedWithName || false,
    relationCreationPayload: {
      targetObjectMetadataId: targetObjectMetadataId,
      targetFieldLabel: targetFieldLabel || 'opportunity',
      targetFieldIcon: targetFieldIcon || 'IconListOpportunity',
      type: relationType,
    },
  };

  const {
    data: { createOneField: createdFieldPerson },
  } = await createOneFieldMetadata<typeof type>({
    input: createFieldInput,
    gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
            relation {
              type
              targetFieldMetadata {
                id
              }
            }
            settings
            object {
              id
              nameSingular
            }
          `,
    expectToFail: false,
  });

  return createdFieldPerson;
};
