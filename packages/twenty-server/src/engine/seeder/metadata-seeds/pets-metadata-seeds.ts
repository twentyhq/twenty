import { ObjectMetadataSeed } from 'src/engine/seeder/interfaces/object-metadata-seed';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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
  ],
};
