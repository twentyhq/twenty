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
import { GRAPH_DEFAULT_DATE_GRANULARITY } from 'src/modules/dashboard/chart-data/constants/graph-default-date-granularity.constant';

export type GroupByFieldObject = Record<
  string,
  boolean | Record<string, boolean | string | Record<string, boolean | string>>
>;

type BuildDateGroupByObjectParams = {
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  firstDayOfTheWeek?: CalendarStartDay | null;
  timeZone?: string;
};

const buildDateGroupByObject = ({
  dateGranularity,
  firstDayOfTheWeek,
  timeZone,
}: BuildDateGroupByObjectParams): Record<string, string> => {
  const usedDateGranularity = dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY;

  const shouldHaveTimeZone =
    GROUP_BY_DATE_GRANULARITY_THAT_REQUIRE_TIME_ZONE.includes(
      usedDateGranularity,
    );

  const result: Record<string, string> = {
    granularity: usedDateGranularity,
  };

  if (shouldHaveTimeZone) {
    if (!isDefined(timeZone)) {
      throw new Error(`Date group by should have a time zone.`);
    }
    result.timeZone = timeZone;
  }

  const shouldIncludeWeekStartDay =
    usedDateGranularity === ObjectRecordGroupByDateGranularity.WEEK ||
    usedDateGranularity === ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK;

  if (
    shouldIncludeWeekStartDay &&
    isDefined(firstDayOfTheWeek) &&
    firstDayOfTheWeek !== CalendarStartDay.SYSTEM
  ) {
    const weekStartDay = convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
      firstDayOfTheWeek,
      FirstDayOfTheWeek.MONDAY,
    );

    result.weekStartDay = weekStartDay;
  }

  return result;
};

export type BuildGroupByFieldObjectParams = {
  fieldMetadata: FlatFieldMetadata;
  subFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  firstDayOfTheWeek?: CalendarStartDay | null;
  isNestedDateField?: boolean;
  timeZone?: string;
  shouldUnnest?: boolean;
};

export const buildGroupByFieldObject = ({
  fieldMetadata,
  subFieldName,
  dateGranularity,
  firstDayOfTheWeek,
  isNestedDateField,
  timeZone,
  shouldUnnest,
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
      const dateGroupByObject = buildDateGroupByObject({
        dateGranularity,
        firstDayOfTheWeek,
        timeZone,
      });

      return {
        [fieldMetadata.name]: {
          [nestedFieldName]: dateGroupByObject,
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
    const dateGroupByObject = buildDateGroupByObject({
      dateGranularity,
      firstDayOfTheWeek,
      timeZone,
    });

    return { [fieldMetadata.name]: dateGroupByObject };
  }

  if (shouldUnnest) {
    return { [fieldMetadata.name]: { unnest: true } };
  }

  return { [fieldMetadata.name]: true };
};
