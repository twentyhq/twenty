import { isDefined } from 'class-validator';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type AggregateOperations,
  type ViewKey,
  ViewOpenRecordIn,
  type ViewRoadmapZoom,
  type ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardViewOptions<O extends AllStandardObjectName> = {
  viewName: AllStandardObjectViewName<O>;
  name: string;
  type: ViewType;
  key: ViewKey | null;
  position: number;
  icon: string;
  isCompact?: boolean;
  isCustom?: boolean;
  openRecordIn?: ViewOpenRecordIn;
  kanbanAggregateOperation?: AggregateOperations | null;
  kanbanAggregateOperationFieldName?: AllStandardObjectFieldName<O>;
  mainGroupByFieldName?: AllStandardObjectFieldName<O>;
  calendarFieldName?: AllStandardObjectFieldName<O>;
  // Roadmap config — only honoured when `type === ViewType.ROADMAP`. Each
  // field name is resolved against `STANDARD_OBJECTS[objectName].fields`
  // to its universalIdentifier + against the workspace ID map to its real
  // FK id. The resulting view ships pre-configured to the user.
  roadmapDefaultZoom?: ViewRoadmapZoom | null;
  roadmapShowToday?: boolean;
  roadmapShowWeekends?: boolean;
  roadmapShowDeviation?: boolean;
  roadmapFieldStartName?: AllStandardObjectFieldName<O>;
  roadmapFieldEndName?: AllStandardObjectFieldName<O>;
  roadmapFieldGroupName?: AllStandardObjectFieldName<O>;
  roadmapFieldColorName?: AllStandardObjectFieldName<O>;
  roadmapFieldLabelName?: AllStandardObjectFieldName<O>;
  roadmapFieldPlannedStartName?: AllStandardObjectFieldName<O>;
  roadmapFieldPlannedEndName?: AllStandardObjectFieldName<O>;
  roadmapFieldStatusName?: AllStandardObjectFieldName<O>;
  roadmapFieldBlockedByName?: AllStandardObjectFieldName<O>;
};

export type CreateStandardViewArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
> = StandardBuilderArgs<'view'> & {
  objectName: O;
  context: CreateStandardViewOptions<O>;
};

export const createStandardViewFlatMetadata = <
  O extends AllStandardObjectName,
>({
  workspaceId,
  objectName,
  context: {
    viewName,
    name,
    type,
    key,
    position,
    icon,
    isCompact = false,
    isCustom = false,
    openRecordIn = ViewOpenRecordIn.SIDE_PANEL,
    kanbanAggregateOperation = null,
    kanbanAggregateOperationFieldName,
    mainGroupByFieldName,
    calendarFieldName,
    roadmapDefaultZoom = null,
    roadmapShowToday = true,
    roadmapShowWeekends = true,
    roadmapShowDeviation = false,
    roadmapFieldStartName,
    roadmapFieldEndName,
    roadmapFieldGroupName,
    roadmapFieldColorName,
    roadmapFieldLabelName,
    roadmapFieldPlannedStartName,
    roadmapFieldPlannedEndName,
    roadmapFieldStatusName,
    roadmapFieldBlockedByName,
  },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardViewArgs<O>): FlatView => {
  // @ts-expect-error ignore
  const viewDefinition = STANDARD_OBJECTS[objectName].views[viewName] as {
    universalIdentifier: string;
  };

  if (!isDefined(viewDefinition)) {
    throw new Error(`Invalid configuration ${objectName} ${viewName.toString}`);
  }

  const objectMetadataId =
    standardObjectMetadataRelatedEntityIds[objectName].id;
  const objectMetadataUniversalIdentifier =
    STANDARD_OBJECTS[objectName].universalIdentifier;

  const kanbanAggregateOperationFieldMetadataId =
    kanbanAggregateOperationFieldName
      ? standardObjectMetadataRelatedEntityIds[objectName].fields[
          kanbanAggregateOperationFieldName
        ].id
      : null;

  const mainGroupByFieldMetadataId = mainGroupByFieldName
    ? standardObjectMetadataRelatedEntityIds[objectName].fields[
        mainGroupByFieldName
      ].id
    : null;

  const calendarFieldMetadataId = calendarFieldName
    ? standardObjectMetadataRelatedEntityIds[objectName].fields[
        calendarFieldName
      ].id
    : null;

  const kanbanAggregateOperationFieldMetadataUniversalIdentifier =
    kanbanAggregateOperationFieldName
      ? // @ts-expect-error ignore
        STANDARD_OBJECTS[objectName].fields[kanbanAggregateOperationFieldName]
          .universalIdentifier
      : null;

  const mainGroupByFieldMetadataUniversalIdentifier = mainGroupByFieldName
    ? // @ts-expect-error ignore
      STANDARD_OBJECTS[objectName].fields[mainGroupByFieldName]
        .universalIdentifier
    : null;

  const calendarFieldMetadataUniversalIdentifier = calendarFieldName
    ? // @ts-expect-error ignore
      STANDARD_OBJECTS[objectName].fields[calendarFieldName].universalIdentifier
    : null;

  // Roadmap field resolvers — same pattern as calendarField, repeated 8 times.
  // Each helper returns either a non-null pair `{ id, universalIdentifier }`
  // or null (when no field name was provided), so the return object can hard-
  // code the destructuring without further conditionals.
  const resolveRoadmapField = (
    fieldName: AllStandardObjectFieldName<O> | undefined,
  ): { id: string; universalIdentifier: string } | null => {
    if (!fieldName) return null;
    return {
      id: standardObjectMetadataRelatedEntityIds[objectName].fields[fieldName]
        .id,
      universalIdentifier:
        // @ts-expect-error ignore
        STANDARD_OBJECTS[objectName].fields[fieldName].universalIdentifier,
    };
  };

  const roadmapFieldStart = resolveRoadmapField(roadmapFieldStartName);
  const roadmapFieldEnd = resolveRoadmapField(roadmapFieldEndName);
  const roadmapFieldGroup = resolveRoadmapField(roadmapFieldGroupName);
  const roadmapFieldColor = resolveRoadmapField(roadmapFieldColorName);
  const roadmapFieldLabel = resolveRoadmapField(roadmapFieldLabelName);
  const roadmapFieldPlannedStart = resolveRoadmapField(
    roadmapFieldPlannedStartName,
  );
  const roadmapFieldPlannedEnd = resolveRoadmapField(
    roadmapFieldPlannedEndName,
  );
  const roadmapFieldStatus = resolveRoadmapField(roadmapFieldStatusName);
  const roadmapFieldBlockedBy = resolveRoadmapField(roadmapFieldBlockedByName);

  return {
    calendarFieldMetadataUniversalIdentifier,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    mainGroupByFieldMetadataUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    id: standardObjectMetadataRelatedEntityIds[objectName].views[viewName].id,
    universalIdentifier: viewDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    objectMetadataId,
    name,
    type,
    key,
    icon,
    position,
    isCompact,
    isCustom,
    openRecordIn,
    kanbanAggregateOperation,
    kanbanAggregateOperationFieldMetadataId,
    mainGroupByFieldMetadataId,
    shouldHideEmptyGroups: false,
    calendarLayout: null,
    calendarFieldMetadataId,
    roadmapDefaultZoom,
    roadmapShowToday,
    roadmapShowWeekends,
    roadmapFieldStartId: roadmapFieldStart?.id ?? null,
    roadmapFieldEndId: roadmapFieldEnd?.id ?? null,
    roadmapFieldGroupId: roadmapFieldGroup?.id ?? null,
    roadmapFieldColorId: roadmapFieldColor?.id ?? null,
    roadmapFieldLabelId: roadmapFieldLabel?.id ?? null,
    roadmapFieldPlannedStartId: roadmapFieldPlannedStart?.id ?? null,
    roadmapFieldPlannedEndId: roadmapFieldPlannedEnd?.id ?? null,
    roadmapFieldStatusId: roadmapFieldStatus?.id ?? null,
    roadmapFieldBlockedById: roadmapFieldBlockedBy?.id ?? null,
    roadmapShowDeviation,
    roadmapFieldStartUniversalIdentifier:
      roadmapFieldStart?.universalIdentifier ?? null,
    roadmapFieldEndUniversalIdentifier:
      roadmapFieldEnd?.universalIdentifier ?? null,
    roadmapFieldGroupUniversalIdentifier:
      roadmapFieldGroup?.universalIdentifier ?? null,
    roadmapFieldColorUniversalIdentifier:
      roadmapFieldColor?.universalIdentifier ?? null,
    roadmapFieldLabelUniversalIdentifier:
      roadmapFieldLabel?.universalIdentifier ?? null,
    roadmapFieldPlannedStartUniversalIdentifier:
      roadmapFieldPlannedStart?.universalIdentifier ?? null,
    roadmapFieldPlannedEndUniversalIdentifier:
      roadmapFieldPlannedEnd?.universalIdentifier ?? null,
    roadmapFieldStatusUniversalIdentifier:
      roadmapFieldStatus?.universalIdentifier ?? null,
    roadmapFieldBlockedByUniversalIdentifier:
      roadmapFieldBlockedBy?.universalIdentifier ?? null,
    anyFieldFilterValue: null,
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    viewFieldIds: [],
    viewFieldUniversalIdentifiers: [],
    viewFieldGroupIds: [],
    viewFieldGroupUniversalIdentifiers: [],
    viewFilterIds: [],
    viewFilterUniversalIdentifiers: [],
    viewGroupIds: [],
    viewGroupUniversalIdentifiers: [],
    viewFilterGroupIds: [],
    viewFilterGroupUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
