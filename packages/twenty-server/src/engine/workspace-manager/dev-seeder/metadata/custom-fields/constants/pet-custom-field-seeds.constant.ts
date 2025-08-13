import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PET_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    label: 'Species',
    name: 'species',
    options: [
      { label: 'Dog', value: 'DOG', position: 0, color: 'blue' },
      { label: 'Cat', value: 'CAT', position: 1, color: 'red' },
      { label: 'Bird', value: 'BIRD', position: 2, color: 'green' },
      { label: 'Fish', value: 'FISH', position: 3, color: 'yellow' },
      { label: 'Rabbit', value: 'RABBIT', position: 4, color: 'purple' },
      { label: 'Hamster', value: 'HAMSTER', position: 5, color: 'orange' },
    ],
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Traits',
    name: 'traits',
    options: [
      { label: 'Playful', value: 'PLAYFUL', position: 0, color: 'blue' },
      { label: 'Friendly', value: 'FRIENDLY', position: 1, color: 'red' },
      {
        label: 'Protective',
        value: 'PROTECTIVE',
        position: 2,
        color: 'green',
      },
      { label: 'Shy', value: 'SHY', position: 3, color: 'yellow' },
      { label: 'Brave', value: 'BRAVE', position: 4, color: 'purple' },
      { label: 'Curious', value: 'CURIOUS', position: 5, color: 'orange' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Comments',
    name: 'comments',
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Age',
    name: 'age',
  },
  {
    type: FieldMetadataType.ADDRESS,
    label: 'Location',
    name: 'location',
  },
  {
    type: FieldMetadataType.PHONES,
    label: 'Vet phone',
    name: 'vetPhone',
  },
  {
    type: FieldMetadataType.EMAILS,
    label: 'Vet email',
    name: 'vetEmail',
  },
  {
    type: FieldMetadataType.DATE,
    label: 'Birthday',
    name: 'birthday',
  },
  {
    type: FieldMetadataType.BOOLEAN,
    label: 'Is good with kids',
    name: 'isGoodWithKids',
  },
  {
    type: FieldMetadataType.LINKS,
    label: 'Pictures',
    name: 'pictures',
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Average cost of kibble per month',
    name: 'averageCostOfKibblePerMonth',
  },
  {
    type: FieldMetadataType.FULL_NAME,
    label: 'Makes its owner think of',
    name: 'makesOwnerThinkOf',
  },
  {
    type: FieldMetadataType.RATING,
    label: 'Sound swag (bark style, meow style, etc.)',
    name: 'soundSwag',
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'Bio',
    name: 'bio',
  },
  {
    type: FieldMetadataType.ARRAY,
    label: 'Interesting facts',
    name: 'interestingFacts',
  },
  {
    type: FieldMetadataType.RAW_JSON,
    label: 'Extra data',
    name: 'extraData',
  },
];
