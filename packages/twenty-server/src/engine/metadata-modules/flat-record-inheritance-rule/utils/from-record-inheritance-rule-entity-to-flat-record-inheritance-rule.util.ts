/* @license Enterprise */

import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatRecordInheritanceRule } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromRecordInheritanceRuleEntityToFlatRecordInheritanceRule = (
  args: FromEntityToFlatEntityArgs<'recordInheritanceRule'>,
): FlatRecordInheritanceRule => {
  const { entity: recordInheritanceRuleEntity } = args;

  const recordInheritanceRuleScalarEntity = fromEntityToScalarEntity({
    metadataName: 'recordInheritanceRule',
    entity: recordInheritanceRuleEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'recordInheritanceRule',
      ...args,
    });

  return {
    ...recordInheritanceRuleScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
