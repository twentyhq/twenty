import { v4 } from 'uuid';

import { isDefined } from 'class-validator';
import { type AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
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
  },
  standardFieldMetadataIdByObjectAndFieldName,
  twentyStandardApplicationId,
  now,
}: CreateStandardViewArgs<O>): FlatView => {
  // @ts-expect-error ignore
  const viewDefinition = STANDARD_OBJECTS[objectName].views.objectViews[
    viewName
  ] as unknown as {
    universalIdentifier: string;
  };

  if (!isDefined(viewDefinition)) {
    throw new Error(`Invalid configuration ${objectName} ${viewName.toString}`);
  }

  const objectMetadataId =
    standardFieldMetadataIdByObjectAndFieldName[objectName].id;
  const fieldIds =
    standardFieldMetadataIdByObjectAndFieldName[objectName].fields;

  const kanbanAggregateOperationFieldMetadataId =
    kanbanAggregateOperationFieldName
      ? fieldIds[kanbanAggregateOperationFieldName]
      : null;

  const mainGroupByFieldMetadataId = mainGroupByFieldName
    ? fieldIds[mainGroupByFieldName]
    : null;

  const calendarFieldMetadataId = calendarFieldName
    ? fieldIds[calendarFieldName]
    : null;

  return {
    id: v4(),
    universalIdentifier: viewDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
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
    calendarLayout: null,
    calendarFieldMetadataId,
    anyFieldFilterValue: null,
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    viewFieldIds: [],
    viewFilterIds: [],
    viewGroupIds: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
