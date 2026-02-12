import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

// Note: The `pet` relation is created automatically when the junction field
// `caretakers` is created on Pet (as the inverse side)

// Morph relation to caretaker (Person or Company)
export const PET_CARE_AGREEMENT_CARETAKER_MORPH_SEED: FieldMetadataSeed & {
  targetObjectMetadataNames: string[];
} = {
  type: FieldMetadataType.MORPH_RELATION,
  label: 'Caretaker',
  name: 'caretaker',
  icon: 'IconUser',
  morphRelationsCreationPayload: [
    {
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'to-be-resolved-later',
      targetFieldLabel: 'Cared For Pets',
      targetFieldIcon: 'IconPaw',
    },
  ],
  targetObjectMetadataNames: ['person', 'company'],
};
