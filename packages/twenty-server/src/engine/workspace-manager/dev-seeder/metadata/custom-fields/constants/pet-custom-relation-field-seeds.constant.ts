import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { ROCKET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/rocket-custom-object-seed.constant';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PET_CUSTOM_RELATION_FIELD_SEEDS: (FieldMetadataSeed & {
  targetObjectMetadataNames: string[];
})[] = [
  {
    type: FieldMetadataType.MORPH_RELATION,
    label: 'Polymorphic Owner',
    name: 'polymorphicOwner',
    icon: 'IconRelationManyToOne',
    morphRelationsCreationPayload: [
      {
        type: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'to-be-resolved-later',
        targetFieldLabel: 'Owned Pets',
        targetFieldIcon: 'IconRelationOneToMany',
      },
    ],
    targetObjectMetadataNames: [
      'surveyResult',
      ROCKET_CUSTOM_OBJECT_SEED.nameSingular,
    ],
  },
  {
    type: FieldMetadataType.MORPH_RELATION,
    label: 'Polymorphic Helper',
    name: 'polymorphicHelper',
    icon: 'IconRelationOneToMany',
    morphRelationsCreationPayload: [
      {
        type: RelationType.ONE_TO_MANY,
        targetObjectMetadataId: 'to-be-resolved-later',
        targetFieldLabel: 'Helped Pets',
        targetFieldIcon: 'IconRelationOneToMany',
      },
    ],
    targetObjectMetadataNames: [
      'surveyResult',
      ROCKET_CUSTOM_OBJECT_SEED.nameSingular,
    ],
  },
];
