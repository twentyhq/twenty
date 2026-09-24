import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OverridablePropertyConfiguration = {
  isOverridable?: boolean;
  universalProperty?: string;
};

export const ALL_OVERRIDABLE_UNIVERSAL_PROPERTIES_BY_METADATA_NAME: Record<
  AllMetadataName,
  readonly string[]
> = Object.fromEntries(
  Object.values(ALL_METADATA_NAME).map((metadataName) => [
    metadataName,
    Object.entries(
      ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[
        metadataName
      ] as Record<string, OverridablePropertyConfiguration>,
    ).flatMap(([property, { isOverridable, universalProperty }]) =>
      isOverridable === true ? [universalProperty ?? property] : [],
    ),
  ]),
) as unknown as Record<AllMetadataName, readonly string[]>;
