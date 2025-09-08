import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PET_CUSTOM_RELATION_FIELD_SEEDS: (FieldMetadataSeed & {
  targetObjectMetadataNames: string[];
})[] = [
  {
    type: FieldMetadataType.MORPH_RELATION,
    label: 'Owner of the Pet (rocket or survey)',
    name: 'owner',
    icon: 'IconRelationManyToOne',
    morphRelationsCreationPayload: [
      {
        type: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'to-be-resolved-later',
        targetFieldLabel: 'Owned by',
        targetFieldIcon: 'IconRelationOneToMany',
      },
    ],
    targetObjectMetadataNames: ['surveyResult', 'rocket'],
  },
  {
    type: FieldMetadataType.MORPH_RELATION,
    label: 'Helper of the Pet (rocket or survey)',
    name: 'helper',
    icon: 'IconRelationOneToMany',
    morphRelationsCreationPayload: [
      {
        type: RelationType.ONE_TO_MANY,
        targetObjectMetadataId: 'to-be-resolved-later',
        targetFieldLabel: 'Helped by',
        targetFieldIcon: 'IconRelationOneToMany',
      },
    ],
    targetObjectMetadataNames: ['surveyResult', 'rocket'],
  },
];
