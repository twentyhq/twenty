import { type CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';

export const createRelationBetweenObjects = async <
  T extends FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION,
>({
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
  type: T;
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

  const { data } = await createOneFieldMetadata<typeof type>({
    input: createFieldInput,
    gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
            settings
            relation {
              type
              sourceObjectMetadata {
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                id
                name
              }
              targetFieldMetadata {
                id
                name
              }
            }
            object {
              id
              nameSingular
            }
          `,
    expectToFail: false,
  });

  return data.createOneField as unknown as FieldMetadataDTO<T> & {
    relation: RelationDTO;
  };
};
