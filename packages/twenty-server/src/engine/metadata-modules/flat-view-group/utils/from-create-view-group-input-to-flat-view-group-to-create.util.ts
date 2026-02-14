import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

export const fromCreateViewGroupInputToFlatViewGroupToCreate = ({
  createViewGroupInput: rawCreateViewGroupInput,
  flatApplication,
  flatViewMaps,
}: {
  createViewGroupInput: CreateViewGroupInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatViewMaps'>): UniversalFlatViewGroup & {
  id: string;
} => {
  const { viewId, ...createViewGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewGroupInput,
      ['fieldValue', 'id', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewGroupId = createViewGroupInput.id ?? v4();

  const { viewUniversalIdentifier } = resolveEntityRelationUniversalIdentifiers(
    {
      metadataName: 'viewGroup',
      foreignKeyValues: { viewId },
      flatEntityMaps: { flatViewMaps },
    },
  );

  return {
    id: viewGroupId,
    viewUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewGroupInput.universalIdentifier ?? v4(),
    isVisible: createViewGroupInput.isVisible ?? true,
    fieldValue: createViewGroupInput.fieldValue,
    position: createViewGroupInput.position ?? 0,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
