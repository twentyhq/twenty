import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemOverrides } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

type UniversalCommandMenuItemOverrides =
  FormatRecordSerializedRelationProperties<CommandMenuItemOverrides>;

const COMMAND_MENU_ITEM_OVERRIDES_FOREIGN_KEYS = [
  {
    foreignKey: 'availabilityObjectMetadataId',
    universalProperty: 'availabilityObjectMetadataUniversalIdentifier',
    mapName: 'objectMetadata',
  },
  {
    foreignKey: 'pageLayoutId',
    universalProperty: 'pageLayoutUniversalIdentifier',
    mapName: 'pageLayout',
  },
] as const;

export const fromCommandMenuItemOverridesToUniversalOverrides = ({
  overrides,
  objectMetadataUniversalIdentifierById,
  pageLayoutUniversalIdentifierById,
  shouldThrowOnMissingIdentifier = true,
}: {
  overrides: CommandMenuItemOverrides;
  objectMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  pageLayoutUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): UniversalCommandMenuItemOverrides => {
  const {
    availabilityObjectMetadataId: _availabilityObjectMetadataId,
    pageLayoutId: _pageLayoutId,
    ...scalarOverrides
  } = overrides;

  const universalIdentifierByIdByMapName = {
    objectMetadata: objectMetadataUniversalIdentifierById,
    pageLayout: pageLayoutUniversalIdentifierById,
  };

  return COMMAND_MENU_ITEM_OVERRIDES_FOREIGN_KEYS.reduce<UniversalCommandMenuItemOverrides>(
    (acc, { foreignKey, universalProperty, mapName }) => {
      const foreignKeyValue = overrides[foreignKey];

      if (foreignKeyValue === undefined) {
        return acc;
      }

      if (foreignKeyValue === null) {
        return { ...acc, [universalProperty]: null };
      }

      const universalIdentifier =
        universalIdentifierByIdByMapName[mapName][foreignKeyValue];

      if (!isDefined(universalIdentifier)) {
        if (shouldThrowOnMissingIdentifier) {
          throw new FlatEntityMapsException(
            `${mapName} universal identifier not found for id: ${foreignKeyValue}`,
            FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
          );
        }

        return { ...acc, [universalProperty]: null };
      }

      return { ...acc, [universalProperty]: universalIdentifier };
    },
    scalarOverrides,
  );
};
