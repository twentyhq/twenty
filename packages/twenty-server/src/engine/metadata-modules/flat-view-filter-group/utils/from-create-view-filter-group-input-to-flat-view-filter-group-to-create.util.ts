import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { type UniversalFlatViewFilterGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter-group.type';

export const fromCreateViewFilterGroupInputToFlatViewFilterGroupToCreate = ({
  createViewFilterGroupInput: rawCreateViewFilterGroupInput,
  flatApplication,
  flatViewMaps,
  flatViewFilterGroupMaps,
}: {
  createViewFilterGroupInput: CreateViewFilterGroupInput;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatViewFilterGroupMaps'
>): UniversalFlatViewFilterGroup & { id: string } => {
  const { viewId, ...createViewFilterGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFilterGroupInput,
      ['id', 'viewId', 'parentViewFilterGroupId'],
    );

  const createdAt = new Date().toISOString();
  const viewFilterGroupId = createViewFilterGroupInput.id ?? v4();

  const { viewUniversalIdentifier, parentViewFilterGroupUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      metadataName: 'viewFilterGroup',
      foreignKeyValues: {
        viewId,
        parentViewFilterGroupId:
          createViewFilterGroupInput.parentViewFilterGroupId,
      },
      flatEntityMaps: { flatViewMaps, flatViewFilterGroupMaps },
    });

  return {
    id: viewFilterGroupId,
    viewUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: viewFilterGroupId,
    logicalOperator:
      createViewFilterGroupInput.logicalOperator ??
      ViewFilterGroupLogicalOperator.AND,
    parentViewFilterGroupUniversalIdentifier,
    positionInViewFilterGroup:
      createViewFilterGroupInput.positionInViewFilterGroup ?? null,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    viewFilterUniversalIdentifiers: [],
    childViewFilterGroupUniversalIdentifiers: [],
  };
};
