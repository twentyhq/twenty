import { COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { buildFieldsByObjectIdMap } from 'src/modules/dashboard/tools/utils/build-fields-by-object-id-map.util';

const compositeSubFieldMaps = COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES as Record<
  string,
  Record<string, string>
>;

const getCompositeSubFieldNames = (fieldType: FieldMetadataType) =>
  Object.values(compositeSubFieldMaps[fieldType] ?? {});

type GraphConfigurationLike = {
  configurationType?: WidgetConfigurationType;
  aggregateFieldMetadataId?: string | null;
  primaryAxisGroupByFieldMetadataId?: string | null;
  primaryAxisGroupBySubFieldName?: string | null;
  secondaryAxisGroupByFieldMetadataId?: string | null;
  secondaryAxisGroupBySubFieldName?: string | null;
  groupByFieldMetadataId?: string | null;
  groupBySubFieldName?: string | null;
};

const GRAPH_CONFIGURATION_TYPES = new Set<WidgetConfigurationType>([
  WidgetConfigurationType.AGGREGATE_CHART,
  WidgetConfigurationType.BAR_CHART,
  WidgetConfigurationType.LINE_CHART,
  WidgetConfigurationType.PIE_CHART,
]);

const isGraphConfiguration = (configuration: GraphConfigurationLike) =>
  isDefined(configuration.configurationType) &&
  GRAPH_CONFIGURATION_TYPES.has(configuration.configurationType);

const getFieldById = (
  fieldId: string | null | undefined,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) => {
  if (!isDefined(fieldId)) return null;
  const identifier = flatFieldMetadataMaps.universalIdentifierById[fieldId];

  if (!isDefined(identifier)) return null;

  const field = flatFieldMetadataMaps.byUniversalIdentifier[identifier];

  if (!isDefined(field) || !field.isActive) return null;

  return field;
};

const validateCompositeSubField = ({
  field,
  subFieldName,
  fieldLabel,
}: {
  field: FlatFieldMetadata;
  subFieldName: string | null | undefined;
  fieldLabel: string;
}) => {
  if (!isDefined(subFieldName)) {
    throw new Error(`Composite field "${fieldLabel}" requires a subfield.`);
  }

  if (subFieldName.includes('.')) {
    throw new Error(`Composite subfield "${subFieldName}" is invalid.`);
  }

  const allowedSubFields = getCompositeSubFieldNames(field.type);
  const isValid = allowedSubFields.some((value) => value === subFieldName);

  if (!isValid) {
    throw new Error(
      `Invalid subfield "${subFieldName}" for "${fieldLabel}". Allowed: ${allowedSubFields.join(
        ', ',
      )}`,
    );
  }
};

const resolveMorphTargetObjectId = ({
  field,
  allFields,
}: {
  field: FlatFieldMetadata;
  allFields: FlatFieldMetadata[];
}) => {
  if (!isDefined(field.morphId)) {
    return null;
  }

  const targetIds = new Set<string>();

  allFields.forEach((flatField) => {
    if (
      flatField.morphId === field.morphId &&
      isDefined(flatField.relationTargetObjectMetadataId)
    ) {
      targetIds.add(flatField.relationTargetObjectMetadataId);
    }
  });

  if (targetIds.size !== 1) {
    return null;
  }

  return [...targetIds][0] ?? null;
};

const validateRelationSubField = ({
  field,
  subFieldName,
  fieldLabel,
  allFields,
  fieldsByObjectId,
}: {
  field: FlatFieldMetadata;
  subFieldName: string | null | undefined;
  fieldLabel: string;
  allFields: FlatFieldMetadata[];
  fieldsByObjectId: Map<string, FlatFieldMetadata[]>;
}) => {
  if (!isDefined(subFieldName)) {
    return;
  }

  const dotIndex = subFieldName.indexOf('.');
  const nestedFieldName =
    dotIndex === -1 ? subFieldName : subFieldName.slice(0, dotIndex);
  const nestedSubFieldName =
    dotIndex === -1 ? undefined : subFieldName.slice(dotIndex + 1);

  if (!nestedFieldName) {
    throw new Error(`Relation subfield "${subFieldName}" is invalid.`);
  }
  if (isDefined(nestedSubFieldName) && nestedSubFieldName.includes('.')) {
    throw new Error(`Relation subfield "${subFieldName}" is invalid.`);
  }

  let targetObjectId = field.relationTargetObjectMetadataId ?? null;

  if (field.type === FieldMetadataType.MORPH_RELATION) {
    targetObjectId = resolveMorphTargetObjectId({ field, allFields });
  }

  if (!isDefined(targetObjectId)) {
    throw new Error(
      `Relation field "${fieldLabel}" does not have a resolvable target object.`,
    );
  }

  const targetFields = fieldsByObjectId.get(targetObjectId) ?? [];
  const nestedField = targetFields.find(
    (targetField) => targetField.name === nestedFieldName,
  );

  if (!isDefined(nestedField)) {
    throw new Error(
      `Relation subfield "${nestedFieldName}" not found for "${fieldLabel}".`,
    );
  }

  if (!isDefined(nestedSubFieldName)) {
    if (isCompositeFieldMetadataType(nestedField.type)) {
      throw new Error(
        `Composite field "${nestedFieldName}" requires a subfield.`,
      );
    }

    return;
  }

  if (!isCompositeFieldMetadataType(nestedField.type)) {
    throw new Error(`Field "${nestedFieldName}" is not composite.`);
  }

  validateCompositeSubField({
    field: nestedField,
    subFieldName: nestedSubFieldName,
    fieldLabel: nestedFieldName,
  });
};

const validateGroupByField = ({
  fieldId,
  subFieldName,
  fieldLabel,
  objectMetadataId,
  flatFieldMetadataMaps,
  allFields,
  fieldsByObjectId,
}: {
  fieldId?: string | null;
  subFieldName?: string | null;
  fieldLabel: string;
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  allFields: FlatFieldMetadata[];
  fieldsByObjectId: Map<string, FlatFieldMetadata[]>;
}) => {
  if (!isDefined(fieldId)) {
    throw new Error(`${fieldLabel} is required.`);
  }

  const field = getFieldById(fieldId, flatFieldMetadataMaps);

  if (!isDefined(field)) {
    throw new Error(`${fieldLabel} "${fieldId}" not found.`);
  }

  if (field.objectMetadataId !== objectMetadataId) {
    throw new Error(
      `${fieldLabel} must belong to objectMetadataId "${objectMetadataId}".`,
    );
  }

  if (isCompositeFieldMetadataType(field.type)) {
    validateCompositeSubField({
      field,
      subFieldName,
      fieldLabel: field.name,
    });

    return;
  }

  if (isMorphOrRelationFlatFieldMetadata(field)) {
    validateRelationSubField({
      field,
      subFieldName,
      fieldLabel: field.name,
      allFields,
      fieldsByObjectId,
    });

    return;
  }

  if (isDefined(subFieldName)) {
    throw new Error(`Field "${field.name}" does not support subfields.`);
  }
};

export const validateGraphWidgetConfiguration = ({
  configuration,
  objectMetadataId,
  widgetType,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  configuration?: AllPageLayoutWidgetConfiguration | null;
  objectMetadataId?: string | null;
  widgetType?: WidgetType | null;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  if (!isDefined(configuration)) return;

  const graphLike = configuration as GraphConfigurationLike;

  if (!isGraphConfiguration(graphLike)) {
    return;
  }

  if (widgetType && widgetType !== WidgetType.GRAPH) {
    throw new Error(
      `Graph configuration is only valid for widgets of type GRAPH.`,
    );
  }

  if (!isDefined(objectMetadataId)) {
    throw new Error('objectMetadataId is required for graph widgets.');
  }

  const objectIdentifier =
    flatObjectMetadataMaps.universalIdentifierById[objectMetadataId];

  if (!isDefined(objectIdentifier)) {
    throw new Error(`objectMetadataId "${objectMetadataId}" not found.`);
  }

  const objectMetadata =
    flatObjectMetadataMaps.byUniversalIdentifier[objectIdentifier];

  if (!isDefined(objectMetadata) || !objectMetadata.isActive) {
    throw new Error(`objectMetadataId "${objectMetadataId}" not found.`);
  }

  const allFields = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((field) => field.isActive);
  const fieldsByObjectId = buildFieldsByObjectIdMap(allFields);

  if (!isDefined(graphLike.aggregateFieldMetadataId)) {
    throw new Error('aggregateFieldMetadataId is required for graph widgets.');
  }

  const aggregateField = getFieldById(
    graphLike.aggregateFieldMetadataId,
    flatFieldMetadataMaps,
  );

  if (!isDefined(aggregateField)) {
    throw new Error(
      `aggregateFieldMetadataId "${graphLike.aggregateFieldMetadataId}" not found.`,
    );
  }

  if (aggregateField.objectMetadataId !== objectMetadataId) {
    throw new Error(
      `aggregateFieldMetadataId must belong to objectMetadataId "${objectMetadataId}".`,
    );
  }

  switch (graphLike.configurationType) {
    case WidgetConfigurationType.BAR_CHART:
    case WidgetConfigurationType.LINE_CHART: {
      validateGroupByField({
        fieldId: graphLike.primaryAxisGroupByFieldMetadataId,
        subFieldName: graphLike.primaryAxisGroupBySubFieldName,
        fieldLabel: 'primaryAxisGroupByFieldMetadataId',
        objectMetadataId,
        flatFieldMetadataMaps,
        allFields,
        fieldsByObjectId,
      });

      if (isDefined(graphLike.secondaryAxisGroupBySubFieldName)) {
        if (!isDefined(graphLike.secondaryAxisGroupByFieldMetadataId)) {
          throw new Error(
            'secondaryAxisGroupByFieldMetadataId is required when secondaryAxisGroupBySubFieldName is provided.',
          );
        }
      }

      if (isDefined(graphLike.secondaryAxisGroupByFieldMetadataId)) {
        validateGroupByField({
          fieldId: graphLike.secondaryAxisGroupByFieldMetadataId,
          subFieldName: graphLike.secondaryAxisGroupBySubFieldName,
          fieldLabel: 'secondaryAxisGroupByFieldMetadataId',
          objectMetadataId,
          flatFieldMetadataMaps,
          allFields,
          fieldsByObjectId,
        });
      }
      break;
    }
    case WidgetConfigurationType.PIE_CHART: {
      validateGroupByField({
        fieldId: graphLike.groupByFieldMetadataId,
        subFieldName: graphLike.groupBySubFieldName,
        fieldLabel: 'groupByFieldMetadataId',
        objectMetadataId,
        flatFieldMetadataMaps,
        allFields,
        fieldsByObjectId,
      });
      break;
    }
    case WidgetConfigurationType.AGGREGATE_CHART:
    default:
      break;
  }
};
