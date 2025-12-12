import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectViewGroupName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-group-name.type';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardViewGroupOptions<
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
> = {
  viewName: V;
  viewGroupName: AllStandardObjectViewGroupName<O, V>;
  fieldName: AllStandardObjectFieldName<O>;
  isVisible: boolean;
  fieldValue: string;
  position: number;
};

export type CreateStandardViewGroupArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
  V extends AllStandardObjectViewName<O> = AllStandardObjectViewName<O>,
> = StandardBuilderArgs<'viewGroup'> & {
  objectName: O;
  context: CreateStandardViewGroupOptions<O, V>;
};

export const createStandardViewGroupFlatMetadata = <
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
>({
  workspaceId,
  objectName,
  context: {
    viewName,
    viewGroupName,
    fieldName,
    isVisible,
    fieldValue,
    position,
  },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardViewGroupArgs<O, V>): FlatViewGroup => {
  // @ts-expect-error ignore
  const viewGroupDefinition = STANDARD_OBJECTS[objectName].views[viewName]
    .viewGroups[viewGroupName] as {
    universalIdentifier: string;
  };

  if (!isDefined(viewGroupDefinition)) {
    throw new Error(
      `Invalid configuration ${objectName} ${viewName.toString()} ${viewGroupName}`,
    );
  }

  return {
    id: v4(),
    universalIdentifier: viewGroupDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    viewId:
      standardObjectMetadataRelatedEntityIds[objectName].views[viewName].id,
    fieldMetadataId:
      standardObjectMetadataRelatedEntityIds[objectName].fields[fieldName].id,
    isVisible,
    fieldValue,
    position,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
