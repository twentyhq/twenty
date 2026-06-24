import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewFieldGroupEntityToFlatViewFieldGroup = (
  args: FromEntityToFlatEntityArgs<'viewFieldGroup'>,
): FlatViewFieldGroup => {
  const { entity: viewFieldGroupEntity } = args;

  const viewFieldGroupScalarEntity = fromEntityToScalarEntity({
    metadataName: 'viewFieldGroup',
    entity: viewFieldGroupEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewFieldGroup',
      ...args,
    });

  return {
    ...viewFieldGroupScalarEntity,
    ...relationUniversalIdentifiers,
    viewFieldIds:
      viewFieldGroupEntity.viewFields?.map((viewField) => viewField.id) ?? [],
    viewFieldUniversalIdentifiers:
      viewFieldGroupEntity.viewFields?.map(
        (viewField) => viewField.universalIdentifier,
      ) ?? [],
  };
};
