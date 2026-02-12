import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';
import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';

export type FromCreateViewFieldGroupInputToFlatViewFieldGroupToCreateArgs = {
  createViewFieldGroupInput: CreateViewFieldGroupInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatViewMaps'>;

export const fromCreateViewFieldGroupInputToFlatViewFieldGroupToCreate = ({
  createViewFieldGroupInput: rawCreateViewFieldGroupInput,
  flatApplication,
  flatViewMaps,
}: FromCreateViewFieldGroupInputToFlatViewFieldGroupToCreateArgs): UniversalFlatViewFieldGroup & {
  id: string;
} => {
  const { viewId, ...createViewFieldGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFieldGroupInput,
      ['id', 'name', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewFieldGroupId = createViewFieldGroupInput.id ?? v4();

  const { viewUniversalIdentifier } = resolveEntityRelationUniversalIdentifiers(
    {
      metadataName: 'viewFieldGroup',
      foreignKeyValues: { viewId },
      flatEntityMaps: { flatViewMaps },
    },
  );

  return {
    id: viewFieldGroupId,
    name: createViewFieldGroupInput.name,
    viewUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewFieldGroupInput.universalIdentifier ?? v4(),
    position: createViewFieldGroupInput.position ?? 0,
    isVisible: createViewFieldGroupInput.isVisible ?? true,
    viewFieldUniversalIdentifiers: [],
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
