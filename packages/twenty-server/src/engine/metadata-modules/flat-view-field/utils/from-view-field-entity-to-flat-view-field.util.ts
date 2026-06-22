import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromViewFieldOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-overrides-to-universal-overrides.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-cache/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewFieldEntityToFlatViewField = (
  args: FromEntityToFlatEntityArgs<'viewField'>,
): FlatViewField => {
  const { entity: viewFieldEntity, viewFieldGroupIdToUniversalIdentifierMap } =
    args;

  const viewFieldEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldEntity,
    getMetadataEntityRelationProperties('viewField'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewField',
      ...args,
    });

  const viewFieldGroupUniversalIdentifierById = Object.fromEntries(
    viewFieldGroupIdToUniversalIdentifierMap.entries(),
  );

  const universalOverrides = isDefined(viewFieldEntity.overrides)
    ? fromViewFieldOverridesToUniversalOverrides({
        overrides: viewFieldEntity.overrides,
        viewFieldGroupUniversalIdentifierById,
        shouldThrowOnMissingIdentifier: false,
      })
    : null;

  return {
    ...viewFieldEntityWithoutRelations,
    createdAt: viewFieldEntity.createdAt.toISOString(),
    updatedAt: viewFieldEntity.updatedAt.toISOString(),
    deletedAt: viewFieldEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewFieldEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
    universalOverrides,
  };
};
