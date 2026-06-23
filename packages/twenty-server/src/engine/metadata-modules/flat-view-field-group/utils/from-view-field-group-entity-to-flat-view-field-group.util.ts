import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewFieldGroupEntityToFlatViewFieldGroup = (
  args: FromEntityToFlatEntityArgs<'viewFieldGroup'>,
): FlatViewFieldGroup => {
  const { entity: viewFieldGroupEntity } = args;

  const viewFieldGroupEntityWithoutRelations = pickScalarPropertiesFromEntity({
    metadataName: 'viewFieldGroup',
    entity: viewFieldGroupEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewFieldGroup',
      ...args,
    });

  return {
    ...viewFieldGroupEntityWithoutRelations,
    createdAt: viewFieldGroupEntity.createdAt.toISOString(),
    updatedAt: viewFieldGroupEntity.updatedAt.toISOString(),
    deletedAt: viewFieldGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewFieldGroupEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
    viewFieldIds:
      viewFieldGroupEntity.viewFields?.map((viewField) => viewField.id) ?? [],
    viewFieldUniversalIdentifiers:
      viewFieldGroupEntity.viewFields?.map(
        (viewField) => viewField.universalIdentifier,
      ) ?? [],
  };
};
