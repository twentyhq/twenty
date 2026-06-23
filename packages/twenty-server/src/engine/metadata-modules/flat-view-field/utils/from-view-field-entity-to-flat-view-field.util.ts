import { isDefined } from 'twenty-shared/utils';

import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromViewFieldOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-overrides-to-universal-overrides.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewFieldEntityToFlatViewField = (
  args: FromEntityToFlatEntityArgs<'viewField'>,
): FlatViewField => {
  const { entity: viewFieldEntity, viewFieldGroupIdToUniversalIdentifierMap } =
    args;

  const viewFieldEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'viewField',
    entity: viewFieldEntity,
  });

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
