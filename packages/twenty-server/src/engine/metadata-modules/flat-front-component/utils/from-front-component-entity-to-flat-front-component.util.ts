import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromFrontComponentEntityToFlatFrontComponent = (
  args: FromEntityToFlatEntityArgs<'frontComponent'>,
): FlatFrontComponent => {
  const { entity: frontComponentEntity } = args;

  const frontComponentEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'frontComponent',
    entity: frontComponentEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'frontComponent',
      ...args,
    });

  return {
    ...frontComponentEntityWithoutRelations,
    createdAt: frontComponentEntity.createdAt.toISOString(),
    updatedAt: frontComponentEntity.updatedAt.toISOString(),
    universalIdentifier:
      frontComponentEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
