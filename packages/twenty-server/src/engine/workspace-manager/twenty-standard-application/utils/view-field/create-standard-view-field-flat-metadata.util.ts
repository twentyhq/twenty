import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
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
  },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardViewFieldArgs<O, V>): FlatViewField => {
  // @ts-expect-error ignore
  const viewFieldDefinition = STANDARD_OBJECTS[objectName].views[viewName]
    .viewFields[viewFieldName] as {
    universalIdentifier: string;
  };

  if (!isDefined(viewFieldDefinition)) {
    throw new Error(
      `Invalid configuration ${objectName} ${viewName.toString()} ${viewFieldName}`,
    );
  }

  return {
    id: v4(),
    universalIdentifier: viewFieldDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    viewId:
      standardObjectMetadataRelatedEntityIds[objectName].views[viewName].id,
    fieldMetadataId:
      standardObjectMetadataRelatedEntityIds[objectName].fields[fieldName].id,
    position,
    isVisible,
    size,
    aggregateOperation,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
