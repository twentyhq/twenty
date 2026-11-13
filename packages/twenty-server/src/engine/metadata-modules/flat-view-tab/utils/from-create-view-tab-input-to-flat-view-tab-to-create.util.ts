import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/create-view-tab.input';
import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';

export const fromCreateViewTabInputToFlatViewTabToCreate = ({
  createViewTabInput: rawCreateViewTabInput,
  flatApplication,
  flatViewMaps,
}: {
  createViewTabInput: CreateViewTabInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatViewMaps'>): UniversalFlatViewTab & {
  id: string;
} => {
  const { viewId, ...createViewTabInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewTabInput,
      ['fieldValue', 'name', 'id', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewTabId = createViewTabInput.id ?? v4();

  const { viewUniversalIdentifier } = resolveEntityRelationUniversalIdentifiers(
    {
      metadataName: 'viewTab',
      foreignKeyValues: { viewId },
      flatEntityMaps: { flatViewMaps },
    },
  );

  return {
    id: viewTabId,
    viewUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewTabInput.universalIdentifier ?? v4(),
    type: createViewTabInput.type,
    fieldValue: createViewTabInput.fieldValue ?? null,
    name: createViewTabInput.name ?? null,
    isVisible: createViewTabInput.isVisible ?? true,
    position: createViewTabInput.position ?? 0,
    viewFilterUniversalIdentifiers: [],
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
