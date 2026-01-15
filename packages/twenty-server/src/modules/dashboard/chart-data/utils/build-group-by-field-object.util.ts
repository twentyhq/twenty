import {
  CalendarStartDay,
  GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE,
} from 'twenty-shared/constants';
import {
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import {
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
  isFieldMetadataDateKind,
} from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from 'src/modules/dashboard/chart-data/constants/graph-defaults.constants';

export type GroupByFieldObject = Record<
  string,
  boolean | Record<string, boolean | string | Record<string, boolean | string>>
>;

export type BuildGroupByFieldObjectParams = {
  fieldMetadata: FlatFieldMetadata;
  subFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  firstDayOfTheWeek?: CalendarStartDay | null;
  isNestedDateField?: boolean;
  timeZone?: string;
};

export const buildGroupByFieldObject = ({
  fieldMetadata,
  subFieldName,
  dateGranularity,
  firstDayOfTheWeek,
  isNestedDateField,
  timeZone,
}: BuildGroupByFieldObjectParams): GroupByFieldObject => {
  const isRelation = isMorphOrRelationFlatFieldMetadata(fieldMetadata);
  const isComposite = isCompositeFieldMetadataType(fieldMetadata.type);
  const isDateField = isFieldMetadataDateKind(fieldMetadata.type);

  if (isRelation) {
    if (!isDefined(subFieldName)) {
      return { [`${fieldMetadata.name}Id`]: true };
    }

    const parts = subFieldName.split('.');
    const nestedFieldName = parts[0];
    const nestedSubFieldName = parts[1];

    if (isNestedDateField === true) {
      const usedDateGranularity =
        dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY;

      const shouldHaveTimeZone =
        GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE.includes(
          usedDateGranularity,
        );

      const timeZoneIsNotProvided = !isDefined(timeZone);

      if (shouldHaveTimeZone) {
        if (timeZoneIsNotProvided) {
          throw new Error(`Date order by should have a time zone.`);
        } else {
          return {
            [fieldMetadata.name]: {
              [nestedFieldName]: {
                granularity: usedDateGranularity,
                timeZone,
              },
            },
          };
        }
      }

      return {
        [fieldMetadata.name]: {
          [nestedFieldName]: {
            granularity: usedDateGranularity,
          },
        },
      };
    }

    if (isDefined(nestedSubFieldName)) {
      return {
        [fieldMetadata.name]: {
          [nestedFieldName]: {
            [nestedSubFieldName]: true,
          },
        },
      };
    }

    return {
      [fieldMetadata.name]: {
        [nestedFieldName]: true,
      },
    };
  }

  if (isComposite) {
    if (!isDefined(subFieldName)) {
      throw new Error(
        `Composite field ${fieldMetadata.name} requires a subfield to be specified`,
      );
    }

    return {
      [fieldMetadata.name]: {
        [subFieldName]: true,
      },
    };
  }

  if (isDateField) {
    const usedDateGranularity =
      dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY;

    const shouldHaveTimeZone =
      GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE.includes(
        usedDateGranularity,
      );

    const timeZoneIsNotProvided = !isDefined(timeZone);

    const result: Record<string, string> = { granularity: usedDateGranularity };

    if (shouldHaveTimeZone) {
      if (timeZoneIsNotProvided) {
        throw new Error(`Date order by should have a time zone.`);
      } else {
        result.timeZone = timeZone;
      }
    }

    if (
      usedDateGranularity === ObjectRecordGroupByDateGranularity.WEEK &&
      isDefined(firstDayOfTheWeek) &&
      firstDayOfTheWeek !== CalendarStartDay.SYSTEM
    ) {
      const weekStartDay =
        convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
          firstDayOfTheWeek,
          FirstDayOfTheWeek.MONDAY,
        );

      result.weekStartDay = weekStartDay;
    }

    return { [fieldMetadata.name]: result };
  }

  return { [fieldMetadata.name]: true };
};
