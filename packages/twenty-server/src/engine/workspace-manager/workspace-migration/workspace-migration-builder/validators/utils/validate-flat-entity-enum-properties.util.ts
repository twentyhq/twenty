import { msg, t } from '@lingui/core/macro';
import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined, isEnumValue } from 'twenty-shared/utils';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type FlatEntityEnumPropertyConfiguration = {
  values: Readonly<Record<string, string>> | readonly string[];
  isNullable?: boolean;
};

type FlatEntityEnumProperty = FlatEntityEnumPropertyConfiguration & {
  property: string;
};

const computeEnumProperties = (
  metadataName: AllMetadataName,
): FlatEntityEnumProperty[] =>
  (
    Object.entries(
      ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName],
    ) as [string, { enum?: FlatEntityEnumPropertyConfiguration }][]
  ).flatMap(([property, { enum: enumConfiguration }]) =>
    isDefined(enumConfiguration) ? [{ property, ...enumConfiguration }] : [],
  );

const ALL_ENUM_PROPERTIES_BY_METADATA_NAME = Object.values(
  ALL_METADATA_NAME,
).reduce(
  (acc, metadataName) => ({
    ...acc,
    [metadataName]: computeEnumProperties(metadataName),
  }),
  {} as Record<AllMetadataName, FlatEntityEnumProperty[]>,
);

// Undefined properties are skipped: they are either absent from an update or
// left to the column default on creation
export const validateFlatEntityEnumProperties = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: Partial<Record<string, unknown>>;
}): FlatEntityValidationError[] =>
  ALL_ENUM_PROPERTIES_BY_METADATA_NAME[metadataName].flatMap(
    ({ property, values, isNullable }) => {
      const value = flatEntity[property];

      if (
        value === undefined ||
        (value === null && isNullable === true) ||
        isEnumValue(values, value)
      ) {
        return [];
      }

      const stringifiedValue = JSON.stringify(value);
      const expectedValues = Object.values(values).join(', ');

      return [
        {
          code: FlatEntityMapsExceptionCode.INVALID_ENUM_VALUE,
          message: t`Invalid value ${stringifiedValue} for ${property}, expected one of: ${expectedValues}`,
          userFriendlyMessage: msg`Invalid value ${stringifiedValue} for ${property}`,
          value,
        },
      ];
    },
  );
