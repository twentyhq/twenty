import { isNonEmptyString } from '@sniptt/guards';
import {
  type ChartFilter,
  type ChartRecordFilter,
  type ChartRecordFilterGroup,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { buildFieldByObjectIdAndNameKey } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-by-object-id-and-name-key.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type ChartFilterInput } from 'src/modules/dashboard/tools/types/chart-filter-input.type';
import { type DashboardIdentifierMaps } from 'src/modules/dashboard/tools/types/dashboard-identifier-maps.type';
import { type WidgetConfigurationInput } from 'src/modules/dashboard/tools/types/widget-configuration-input.type';
import { type WidgetIdentifiersInput } from 'src/modules/dashboard/tools/types/widget-identifiers-input.type';
import { type WidgetWithMetadataIds } from 'src/modules/dashboard/tools/types/widget-with-metadata-ids.type';

const getFieldMetadataIdOrThrow = (
  {
    fieldMetadataId,
    fieldName,
    objectMetadataId,
    maps,
  }: {
    fieldMetadataId: string | undefined;
    fieldName: string | undefined;
    objectMetadataId: string | undefined;
    maps: DashboardIdentifierMaps;
  },
  referenceLabel: string,
): string => {
  if (isDefined(fieldMetadataId)) {
    return fieldMetadataId;
  }

  if (!isNonEmptyString(fieldName)) {
    throw new Error(
      `Missing required ${referenceLabel}: provide either its UUID or its field name.`,
    );
  }

  if (!isDefined(objectMetadataId)) {
    throw new Error(
      `Cannot look up field "${fieldName}": the widget has no object. Provide objectName or objectMetadataId on the widget.`,
    );
  }

  const fieldMetadataIdForName = maps.fieldIdByObjectIdAndName.get(
    buildFieldByObjectIdAndNameKey(objectMetadataId, fieldName),
  );

  if (!isDefined(fieldMetadataIdForName)) {
    throw new Error(
      `Field "${fieldName}" not found on this object. Use get_object_metadata with includeFields (or get_field_metadata) to list available field names.`,
    );
  }

  return fieldMetadataIdForName;
};

export const getObjectMetadataId = ({
  objectMetadataId,
  objectName,
  maps,
}: {
  objectMetadataId: string | undefined;
  objectName: string | undefined;
  maps: DashboardIdentifierMaps;
}): string | undefined => {
  if (isDefined(objectMetadataId)) {
    return objectMetadataId;
  }

  if (!isNonEmptyString(objectName)) {
    return undefined;
  }

  const objectMetadataIdForName = maps.objectIdByName[objectName];

  if (!isDefined(objectMetadataIdForName)) {
    throw new Error(
      `Object "${objectName}" not found. Use get_object_metadata to list available objects.`,
    );
  }

  return objectMetadataIdForName;
};

type ResolvedChartRecordFilter = ChartRecordFilter & {
  id: string;
  displayValue: string;
  positionInRecordFilterGroup: number;
};

const resolveChartFilterFieldNamesToIds = (
  filter: ChartFilterInput | undefined,
  objectMetadataId: string | undefined,
  maps: DashboardIdentifierMaps,
): ChartFilter | undefined => {
  if (!isDefined(filter)) {
    return undefined;
  }

  const inputRecordFilters = filter.recordFilters ?? [];

  if (inputRecordFilters.length === 0) {
    return undefined;
  }

  const inputRecordFilterGroups = filter.recordFilterGroups ?? [];

  const existingRootGroup = inputRecordFilterGroups.find(
    (group) => !isDefined(group.parentRecordFilterGroupId),
  );

  const rootGroup: ChartRecordFilterGroup = existingRootGroup ?? {
    id: uuidv4(),
    logicalOperator: 'AND',
  };

  const recordFilterGroups: ChartRecordFilterGroup[] = isDefined(
    existingRootGroup,
  )
    ? inputRecordFilterGroups
    : [rootGroup, ...inputRecordFilterGroups];

  const validGroupIds = new Set(recordFilterGroups.map((group) => group.id));

  const positionByGroupId = new Map<string, number>();

  const recordFilters: ResolvedChartRecordFilter[] = inputRecordFilters.map(
    (recordFilter) => {
      const { fieldName, fieldMetadataId, ...rest } = recordFilter;

      const resolvedFieldMetadataId = getFieldMetadataIdOrThrow(
        {
          fieldMetadataId,
          fieldName,
          objectMetadataId,
          maps,
        },
        'filter field',
      );

      const recordFilterGroupId = rest.recordFilterGroupId ?? rootGroup.id;

      if (!validGroupIds.has(recordFilterGroupId)) {
        throw new Error(
          `Invalid recordFilterGroupId "${recordFilterGroupId}": no matching filter group exists. Provide a valid group id or omit to use the root group.`,
        );
      }

      const positionInRecordFilterGroup =
        positionByGroupId.get(recordFilterGroupId) ?? 0;

      positionByGroupId.set(
        recordFilterGroupId,
        positionInRecordFilterGroup + 1,
      );

      const field = maps.fieldById.get(resolvedFieldMetadataId);
      const value = rest.value ?? '';

      return {
        id: uuidv4(),
        fieldMetadataId: resolvedFieldMetadataId,
        operand: rest.operand,
        value,
        displayValue: value,
        type: field?.type ?? '',
        recordFilterGroupId,
        positionInRecordFilterGroup,
        ...(isDefined(rest.subFieldName)
          ? { subFieldName: rest.subFieldName }
          : {}),
      };
    },
  );

  return {
    recordFilters,
    recordFilterGroups,
  };
};

export const resolveConfigurationFieldNamesToIds = (
  configuration: WidgetConfigurationInput,
  objectMetadataId: string | undefined,
  maps: DashboardIdentifierMaps,
): AllPageLayoutWidgetConfiguration => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART: {
      const {
        aggregateFieldName,
        aggregateFieldMetadataId,
        ratioAggregateConfig,
        filter,
        ...rest
      } = configuration;

      return {
        ...rest,
        aggregateFieldMetadataId: getFieldMetadataIdOrThrow(
          {
            fieldMetadataId: aggregateFieldMetadataId,
            fieldName: aggregateFieldName,
            objectMetadataId,
            maps,
          },
          'aggregate field',
        ),
        filter: resolveChartFilterFieldNamesToIds(
          filter,
          objectMetadataId,
          maps,
        ),
        ratioAggregateConfig: isDefined(ratioAggregateConfig)
          ? {
              optionValue: ratioAggregateConfig.optionValue,
              fieldMetadataId: getFieldMetadataIdOrThrow(
                {
                  fieldMetadataId: ratioAggregateConfig.fieldMetadataId,
                  fieldName: ratioAggregateConfig.fieldName,
                  objectMetadataId,
                  maps,
                },
                'ratio aggregate field',
              ),
            }
          : undefined,
      };
    }

    case WidgetConfigurationType.BAR_CHART:
    case WidgetConfigurationType.LINE_CHART: {
      const {
        aggregateFieldName,
        aggregateFieldMetadataId,
        primaryAxisGroupByFieldName,
        primaryAxisGroupByFieldMetadataId,
        secondaryAxisGroupByFieldName,
        secondaryAxisGroupByFieldMetadataId,
        filter,
        ...rest
      } = configuration;

      return {
        ...rest,
        aggregateFieldMetadataId: getFieldMetadataIdOrThrow(
          {
            fieldMetadataId: aggregateFieldMetadataId,
            fieldName: aggregateFieldName,
            objectMetadataId,
            maps,
          },
          'aggregate field',
        ),
        filter: resolveChartFilterFieldNamesToIds(
          filter,
          objectMetadataId,
          maps,
        ),
        primaryAxisGroupByFieldMetadataId: getFieldMetadataIdOrThrow(
          {
            fieldMetadataId: primaryAxisGroupByFieldMetadataId,
            fieldName: primaryAxisGroupByFieldName,
            objectMetadataId,
            maps,
          },
          'primary axis group-by field',
        ),
        secondaryAxisGroupByFieldMetadataId:
          isDefined(secondaryAxisGroupByFieldMetadataId) ||
          isNonEmptyString(secondaryAxisGroupByFieldName)
            ? getFieldMetadataIdOrThrow(
                {
                  fieldMetadataId: secondaryAxisGroupByFieldMetadataId,
                  fieldName: secondaryAxisGroupByFieldName,
                  objectMetadataId,
                  maps,
                },
                'secondary axis group-by field',
              )
            : undefined,
      };
    }

    case WidgetConfigurationType.PIE_CHART: {
      const {
        aggregateFieldName,
        aggregateFieldMetadataId,
        groupByFieldName,
        groupByFieldMetadataId,
        filter,
        ...rest
      } = configuration;

      return {
        ...rest,
        aggregateFieldMetadataId: getFieldMetadataIdOrThrow(
          {
            fieldMetadataId: aggregateFieldMetadataId,
            fieldName: aggregateFieldName,
            objectMetadataId,
            maps,
          },
          'aggregate field',
        ),
        filter: resolveChartFilterFieldNamesToIds(
          filter,
          objectMetadataId,
          maps,
        ),
        groupByFieldMetadataId: getFieldMetadataIdOrThrow(
          {
            fieldMetadataId: groupByFieldMetadataId,
            fieldName: groupByFieldName,
            objectMetadataId,
            maps,
          },
          'group-by field',
        ),
      };
    }

    case WidgetConfigurationType.STANDALONE_RICH_TEXT:
      return {
        ...configuration,
        body: {
          ...configuration.body,
          markdown: configuration.body.markdown ?? null,
        },
      };
    case WidgetConfigurationType.IFRAME:
    case WidgetConfigurationType.RECORD_TABLE:
      return configuration;
  }
};

export const resolveWidgetFieldNamesToIds = (
  widget: WidgetIdentifiersInput,
  maps: DashboardIdentifierMaps,
): WidgetWithMetadataIds => {
  const objectMetadataId = getObjectMetadataId({
    objectMetadataId: widget.objectMetadataId,
    objectName: widget.objectName,
    maps,
  });

  return {
    title: widget.title,
    type: widget.type,
    gridPosition: widget.gridPosition,
    objectMetadataId,
    configuration: isDefined(widget.configuration)
      ? resolveConfigurationFieldNamesToIds(
          widget.configuration,
          objectMetadataId,
          maps,
        )
      : undefined,
  };
};
