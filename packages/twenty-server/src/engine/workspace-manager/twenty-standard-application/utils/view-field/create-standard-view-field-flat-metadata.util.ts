import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type AggregateOperations } from 'twenty-shared/types';

import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectViewFieldGroupName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-field-group-name.type';
import { type AllStandardObjectViewFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-field-name.type';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardViewFieldOptions<
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
> = {
  viewName: V;
  viewFieldName: AllStandardObjectViewFieldName<O, V>;
  fieldName: AllStandardObjectFieldName<O>;
  position: number;
  isVisible: boolean;
  size: number;
  aggregateOperation?: AggregateOperations | null;
  viewFieldGroupName?: AllStandardObjectViewFieldGroupName<O, V> | null;
};

export type CreateStandardViewFieldArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
  V extends AllStandardObjectViewName<O> = AllStandardObjectViewName<O>,
> = StandardBuilderArgs<'viewField'> & {
  objectName: O;
  context: CreateStandardViewFieldOptions<O, V>;
};

export const createStandardViewFieldFlatMetadata = <
  O extends AllStandardObjectName,
  V extends AllStandardObjectViewName<O>,
>({
  workspaceId,
  objectName,
  context: {
    viewName,
    viewFieldName,
    fieldName,
    position,
    isVisible,
    size,
    aggregateOperation = null,
    viewFieldGroupName = null,
  },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardViewFieldArgs<O, V>): FlatViewField => {
  const objectDefinition = STANDARD_OBJECTS[objectName] as {
    fields: Record<
      AllStandardObjectFieldName<O>,
      { universalIdentifier: string }
    >;
    views: Record<
      V,
      {
        universalIdentifier: string;
        viewFields: Record<string, { universalIdentifier: string }>;
        viewFieldGroups?: Record<string, { universalIdentifier: string }>;
      }
    >;
  };

  const viewDefinition = objectDefinition.views[viewName];
  const viewFieldDefinition = viewDefinition.viewFields[viewFieldName];
  const fieldDefinition = objectDefinition.fields[fieldName];

  if (!isDefined(viewFieldDefinition)) {
    throw new Error(
      `Invalid configuration ${objectName} ${viewName.toString()} ${viewFieldName}`,
    );
  }

  let viewFieldGroupId: string | null = null;
  let viewFieldGroupUniversalIdentifier: string | null = null;

  if (isDefined(viewFieldGroupName)) {
    const viewFieldGroupDefinition =
      viewDefinition.viewFieldGroups?.[viewFieldGroupName as string];

    if (!isDefined(viewFieldGroupDefinition)) {
      throw new Error(
        `Invalid view field group ${objectName} ${viewName.toString()} ${String(viewFieldGroupName)}`,
      );
    }

    viewFieldGroupUniversalIdentifier =
      viewFieldGroupDefinition.universalIdentifier;

    viewFieldGroupId = (
      standardObjectMetadataRelatedEntityIds[objectName].views[viewName]
        .viewFieldGroups as Record<string, { id: string }>
    )[viewFieldGroupName as string].id;
  }

  return {
    id: v4(),
    universalIdentifier: viewFieldDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    viewId:
      standardObjectMetadataRelatedEntityIds[objectName].views[viewName].id,
    viewUniversalIdentifier: viewDefinition.universalIdentifier,
    fieldMetadataId:
      standardObjectMetadataRelatedEntityIds[objectName].fields[fieldName].id,
    fieldMetadataUniversalIdentifier: fieldDefinition.universalIdentifier,
    viewFieldGroupId,
    viewFieldGroupUniversalIdentifier,
    position,
    isVisible,
    size,
    aggregateOperation,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
