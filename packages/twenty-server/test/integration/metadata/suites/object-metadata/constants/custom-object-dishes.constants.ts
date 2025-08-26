import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const CUSTOM_OBJECT_DISHES = {
  namePlural: 'dishes',
  nameSingular: 'dish',
  description: 'My favorite dishes',
  labelPlural: 'Dishes I love',
  labelSingular: 'Dish I love',
} as const satisfies Partial<FlatObjectMetadata>;
