import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromSharingRuleEntityToFlatSharingRule = (
  args: FromEntityToFlatEntityArgs<'sharingRule'>,
): FlatSharingRule => {
  const { entity: sharingRuleEntity } = args;

  const sharingRuleScalarEntity = fromEntityToScalarEntity({
    metadataName: 'sharingRule',
    entity: sharingRuleEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'sharingRule',
      ...args,
    });

  return {
    ...sharingRuleScalarEntity,
    ...relationUniversalIdentifiers,
    rowLevelPermissionPredicateIds:
      sharingRuleEntity.rowLevelPermissionPredicates.map(({ id }) => id),
    rowLevelPermissionPredicateGroupIds:
      sharingRuleEntity.rowLevelPermissionPredicateGroups.map(({ id }) => id),
    rowLevelPermissionPredicateUniversalIdentifiers:
      sharingRuleEntity.rowLevelPermissionPredicates.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    rowLevelPermissionPredicateGroupUniversalIdentifiers:
      sharingRuleEntity.rowLevelPermissionPredicateGroups.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
  };
};
