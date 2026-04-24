import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { ViewSortDirection } from 'twenty-shared/types';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';

export const fromCreateViewSortInputToFlatViewSortToCreate = ({
  createViewSortInput: rawCreateViewSortInput,
  flatApplication,
  flatFieldMetadataMaps,
  flatViewMaps,
}: {
  createViewSortInput: CreateViewSortInput;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatFieldMetadataMaps'
>): UniversalFlatViewSort & {
  id: string;
} => {
  const { viewId, fieldMetadataId, ...createViewSortInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewSortInput,
      ['fieldMetadataId', 'id', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewSortId = createViewSortInput.id ?? v4();

  const { fieldMetadataUniversalIdentifier, viewUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      metadataName: 'viewSort',
      foreignKeyValues: {
        fieldMetadataId,
        viewId,
      },
      flatEntityMaps: {
        flatFieldMetadataMaps,
        flatViewMaps,
      },
    });

  return {
    id: viewSortId,
    fieldMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewSortInput.universalIdentifier ?? v4(),
    direction: createViewSortInput.direction ?? ViewSortDirection.ASC,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
