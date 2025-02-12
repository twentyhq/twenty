import { ObjectMetadataSeed } from 'src/engine/seeder/interfaces/object-metadata-seed';

import { FieldMetadataType } from 'twenty-shared';

export const PETS_METADATA_SEEDS: ObjectMetadataSeed = {
  labelPlural: 'Pets',
  labelSingular: 'Pet',
  namePlural: 'pets',
  nameSingular: 'pet',
  icon: 'IconCat',
  fields: [
    {
      type: FieldMetadataType.SELECT,
      label: 'Species',
      name: 'species',
      options: [
        { label: 'Dog', value: 'dog', position: 0, color: 'blue' },
        { label: 'Cat', value: 'cat', position: 1, color: 'red' },
        { label: 'Bird', value: 'bird', position: 2, color: 'green' },
        { label: 'Fish', value: 'fish', position: 3, color: 'yellow' },
        { label: 'Rabbit', value: 'rabbit', position: 4, color: 'purple' },
        { label: 'Hamster', value: 'hamster', position: 5, color: 'orange' },
      ],
    },
    {
      type: FieldMetadataType.MULTI_SELECT,
      label: 'Traits',
      name: 'traits',
      options: [
        { label: 'Playful', value: 'playful', position: 0, color: 'blue' },
        { label: 'Friendly', value: 'friendly', position: 1, color: 'red' },
        {
          label: 'Protective',
          value: 'protective',
          position: 2,
          color: 'green',
        },
        { label: 'Shy', value: 'shy', position: 3, color: 'yellow' },
        { label: 'Brave', value: 'brave', position: 4, color: 'purple' },
        { label: 'Curious', value: 'curious', position: 5, color: 'orange' },
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
  ],
};
