import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export const createAccessTestManyToOneField = async ({
  objectMetadataId,
  targetObjectMetadataId,
  name,
  targetFieldLabel,
}: {
  objectMetadataId: string;
  targetObjectMetadataId: string;
  name: string;
  targetFieldLabel: string;
}): Promise<string> => {
  const createdField = await createRelationBetweenObjects({
    objectMetadataId,
    targetObjectMetadataId,
    type: FieldMetadataType.RELATION,
    relationType: RelationType.MANY_TO_ONE,
    name,
    label: name,
    targetFieldLabel,
    targetFieldIcon: 'IconUsers',
  });

  return createdField.id;
};
