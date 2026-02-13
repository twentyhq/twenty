import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectViewFieldGroupName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-field-group-name.type';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

type CreateStandardViewFieldGroupOptions<
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
> = {
  viewName: V;
  viewFieldGroupName: AllStandardObjectViewFieldGroupName<O, V>;
  name: string;
  position: number;
  isVisible: boolean;
};

export type CreateStandardViewFieldGroupArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
  V extends AllStandardObjectViewName<O> = AllStandardObjectViewName<O>,
> = StandardBuilderArgs<'viewFieldGroup'> & {
  objectName: O;
  context: CreateStandardViewFieldGroupOptions<O, V>;
};

export const createStandardViewFieldGroupFlatMetadata = <
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
>({
  workspaceId,
  objectName,
  context: { viewName, viewFieldGroupName, name, position, isVisible },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardViewFieldGroupArgs<O, V>): FlatViewFieldGroup => {
  // @ts-expect-error ignore
  const viewDefinition = STANDARD_OBJECTS[objectName].views[viewName] as {
    universalIdentifier: string;
    viewFieldGroups: Record<string, { universalIdentifier: string }>;
  };

  const viewFieldGroupDefinition =
    viewDefinition.viewFieldGroups[viewFieldGroupName as string];

  if (!isDefined(viewFieldGroupDefinition)) {
    throw new Error(
      `Invalid configuration ${objectName} ${viewName.toString()} ${String(viewFieldGroupName)}`,
    );
  }

  return {
    id: standardObjectMetadataRelatedEntityIds[objectName].views[viewName]
      .viewFieldGroups[viewFieldGroupName].id,
    viewFieldIds: [],
    viewFieldUniversalIdentifiers: [],
    universalIdentifier: viewFieldGroupDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    viewId:
      standardObjectMetadataRelatedEntityIds[objectName].views[viewName].id,
    viewUniversalIdentifier: viewDefinition.universalIdentifier,
    name,
    position,
    isVisible,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
