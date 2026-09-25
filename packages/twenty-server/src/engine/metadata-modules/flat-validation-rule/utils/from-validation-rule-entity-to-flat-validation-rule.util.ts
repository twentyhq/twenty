import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromValidationRuleEntityToFlatValidationRule = (
  args: FromEntityToFlatEntityArgs<'validationRule'>,
): FlatValidationRule => {
  const { entity: validationRuleEntity } = args;

  const validationRuleScalarEntity = fromEntityToScalarEntity({
    metadataName: 'validationRule',
    entity: validationRuleEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'validationRule',
      ...args,
    });

  return {
    ...validationRuleScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
