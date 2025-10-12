import { MetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { IsEmptyRecord } from 'twenty-shared/types';

type MetadataRequiredForValidation = {
  [T in AllMetadataName]: Record<MetadataRelatedMetadataNames<T>, true> & {
    [K in Exclude<AllMetadataName, T>]?: true;
  };
};

export const ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION = {
  fieldMetadata: {
    objectMetadata: true,
  },
  objectMetadata: {
    fieldMetadata: true,
  },
  view: {
    objectMetadata: true,
  },
  viewField: {
    view: true,
    fieldMetadata: true,
    objectMetadata: true,
  },
  index: {
    objectMetadata: true,
    fieldMetadata: true,
  },
  serverlessFunction: {},
  cronTrigger: {
    serverlessFunction: true,
  },
  databaseEventTrigger: {
    serverlessFunction: true,
  },
  routeTrigger: {
    serverlessFunction: true,
  },
  viewFilter: {
    view: true,
    fieldMetadata: true,
  },
} as const satisfies MetadataRequiredForValidation;

export type MetadataValidationRelatedMetadataNames<T extends AllMetadataName> =
  IsEmptyRecord<
    (typeof ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION)[T]
  > extends true
    ? undefined
    : NonNullable<
        Extract<
          keyof (typeof ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION)[T],
          AllMetadataName
        >
      >;
