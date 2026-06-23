import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromFrontComponentEntityToFlatFrontComponent = (
  args: FromEntityToFlatEntityArgs<'frontComponent'>,
): FlatFrontComponent => {
  const { entity: frontComponentEntity } = args;

  const frontComponentEntityWithoutRelations = fromEntityToScalarEntity({
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
    ...relationUniversalIdentifiers,
  };
};
