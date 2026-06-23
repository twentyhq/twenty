import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromSkillEntityToFlatSkill = (
  args: FromEntityToFlatEntityArgs<'skill'>,
): FlatSkill => {
  const { entity: skillEntity } = args;

  const skillEntityWithoutRelations = removePropertiesFromRecord(
    skillEntity,
    getMetadataEntityRelationProperties('skill'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'skill',
      ...args,
    });

  return {
    ...skillEntityWithoutRelations,
    createdAt: skillEntity.createdAt.toISOString(),
    updatedAt: skillEntity.updatedAt.toISOString(),
    universalIdentifier: skillEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
