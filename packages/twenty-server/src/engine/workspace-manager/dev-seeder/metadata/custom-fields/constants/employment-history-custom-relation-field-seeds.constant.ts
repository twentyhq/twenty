import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

// Note: The `person` relation is created automatically when the junction field
// `previousCompanies` is created on Person (as the inverse side)
export const EMPLOYMENT_HISTORY_CUSTOM_RELATION_FIELD_SEEDS: (FieldMetadataSeed & {
  targetObjectMetadataName: string;
})[] = [
  {
    type: FieldMetadataType.RELATION,
    label: 'Company',
    name: 'company',
    icon: 'IconBuildingSkyscraper',
    relationCreationPayload: {
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'to-be-resolved-later',
      targetFieldLabel: 'Employment Histories',
      targetFieldIcon: 'IconBriefcase',
    },
    targetObjectMetadataName: 'company',
  },
];
