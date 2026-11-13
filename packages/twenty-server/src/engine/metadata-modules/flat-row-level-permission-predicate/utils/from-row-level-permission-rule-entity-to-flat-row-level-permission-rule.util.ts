/* @license Enterprise */

import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRowLevelPermissionRuleEntityToFlatRowLevelPermissionRule = (
  args: FromEntityToFlatEntityArgs<'rowLevelPermissionRule'>,
): FlatRowLevelPermissionRule => {
  const { entity: rowLevelPermissionRuleEntity } = args;

  const rowLevelPermissionRuleScalarEntity = fromEntityToScalarEntity({
    metadataName: 'rowLevelPermissionRule',
    entity: rowLevelPermissionRuleEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'rowLevelPermissionRule',
      ...args,
    });

  return {
    ...rowLevelPermissionRuleScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
