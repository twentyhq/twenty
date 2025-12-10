import { v4 } from 'uuid';

import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type AllStandardObjectViewFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-field-name.type';
import { type AllStandardObjectViewGroupName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-group-name.type';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';

type StandardObjectViewIds<O extends AllStandardObjectName> = {
  [V in AllStandardObjectViewName<O>]: {
    id: string;
    viewGroups: Record<AllStandardObjectViewGroupName<O, V>, { id: string }>;
    viewFields: Record<AllStandardObjectViewFieldName<O, V>, { id: string }>;
  };
};

export type StandardObjectMetadataRelatedEntityIds = {
  [O in AllStandardObjectName]: {
    id: string;
    fields: Record<AllStandardObjectFieldName<O>, { id: string }>;
    views: StandardObjectViewIds<O>;
  };
};

const computeStandardViewObjectIds = <O extends AllStandardObjectName>({
  objectName,
}: {
  objectName: O;
}): StandardObjectViewIds<O> | undefined => {
  const objectDefinition = STANDARD_OBJECTS[objectName];

  if (!Object.prototype.hasOwnProperty.call(objectDefinition, 'views')) {
    return undefined;
  }

  // @ts-expect-error ignore
  const viewDefinitions = objectDefinition.views;
  const viewNames = Object.keys(
    viewDefinitions,
  ) as AllStandardObjectViewName<O>[];

  const viewIds = {} as StandardObjectViewIds<O>;

  for (const viewName of viewNames) {
    const viewDefinition =
      viewDefinitions[viewName as keyof typeof viewDefinitions];

    const viewFieldNames = Object.keys(viewDefinition.viewFields);
    const viewFieldIds = {} as Record<
      AllStandardObjectViewFieldName<O, typeof viewName>,
      { id: string }
    >;

    for (const viewFieldName of viewFieldNames) {
      viewFieldIds[
        viewFieldName as AllStandardObjectViewFieldName<O, typeof viewName>
      ] = {
        id: v4(),
      };
    }

    const viewGroupIds = {} as Record<
      AllStandardObjectViewGroupName<O, typeof viewName>,
      { id: string }
    >;

    if (Object.prototype.hasOwnProperty.call(viewDefinition, 'viewGroups')) {
      const viewGroupNames = Object.keys(
        (viewDefinition as { viewGroups: Record<string, unknown> }).viewGroups,
      );

      for (const viewGroupName of viewGroupNames) {
        viewGroupIds[
          viewGroupName as AllStandardObjectViewGroupName<O, typeof viewName>
        ] = {
          id: v4(),
        };
      }
    }

    viewIds[viewName] = {
      id: v4(),
      viewFields: viewFieldIds,
      viewGroups: viewGroupIds,
    };
  }

  return viewIds;
};

// TODO remove once we have refactored the builder to iterate over universalIdentifier only
export const getStandardObjectMetadataRelatedEntityIds =
  (): StandardObjectMetadataRelatedEntityIds => {
    const result = {} as StandardObjectMetadataRelatedEntityIds;

    for (const objectName of Object.keys(
      STANDARD_OBJECTS,
    ) as AllStandardObjectName[]) {
      const fieldNames = Object.keys(
        STANDARD_OBJECTS[objectName].fields,
      ) as AllStandardObjectFieldName<typeof objectName>[];

      const fieldIds = {} as Record<
        AllStandardObjectFieldName<typeof objectName>,
        { id: string }
      >;

      for (const fieldName of fieldNames) {
        fieldIds[fieldName] = { id: v4() };
      }

      const viewIds = computeStandardViewObjectIds({
        objectName,
      });

      result[objectName] = {
        // @ts-expect-error ignore this
        fields: fieldIds,
        id: v4(),
        // @ts-expect-error ignore this
        views: viewIds,
      };
    }

    return result;
  };
