import { type ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectViewFilterName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-filter-name.type';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardViewFilterOptions<
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
> = {
  viewName: V;
  viewFilterName: AllStandardObjectViewFilterName<O, V>;
  fieldName: AllStandardObjectFieldName<O>;
  operand: ViewFilterOperand;
  value: string;
  subFieldName?: string | null;
  viewFilterGroupId?: string | null;
  positionInViewFilterGroup?: number | null;
};

export type CreateStandardViewFilterArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
  V extends AllStandardObjectViewName<O> = AllStandardObjectViewName<O>,
> = StandardBuilderArgs<'viewFilter'> & {
  objectName: O;
  context: CreateStandardViewFilterOptions<O, V>;
};

export const createStandardViewFilterFlatMetadata = <
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
>({
  workspaceId,
  objectName,
  context: {
    viewName,
    viewFilterName,
    fieldName,
    operand,
    value,
    subFieldName = null,
    viewFilterGroupId = null,
    positionInViewFilterGroup = null,
  },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardViewFilterArgs<O, V>): FlatViewFilter => {
  // @ts-expect-error ignore
  const viewFilterDefinition = STANDARD_OBJECTS[objectName].views[viewName]
    .viewFilters[viewFilterName] as {
    universalIdentifier: string;
  };

  if (!isDefined(viewFilterDefinition)) {
    throw new Error(
      `Invalid configuration ${objectName} ${viewName.toString()} ${viewFilterName}`,
    );
  }

  return {
    id: v4(),
    universalIdentifier: viewFilterDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    viewId:
      standardObjectMetadataRelatedEntityIds[objectName].views[viewName].id,
    fieldMetadataId:
      standardObjectMetadataRelatedEntityIds[objectName].fields[fieldName].id,
    operand,
    value,
    subFieldName,
    viewFilterGroupId,
    positionInViewFilterGroup,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
