import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { type EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';

type FromSkillEntityToFlatSkillArgs = {
  skillEntity: SkillEntity;
} & EntityManyToOneIdByUniversalIdentifierMaps<'skill'>;

export const fromSkillEntityToFlatSkill = ({
  skillEntity,
  applicationIdToUniversalIdentifierMap,
}: FromSkillEntityToFlatSkillArgs): FlatSkill => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(skillEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${skillEntity.applicationId} not found for skill ${skillEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    createdAt: skillEntity.createdAt.toISOString(),
    updatedAt: skillEntity.updatedAt.toISOString(),
    id: skillEntity.id,
    standardId: skillEntity.standardId,
    name: skillEntity.name,
    label: skillEntity.label,
    icon: skillEntity.icon,
    description: skillEntity.description,
    content: skillEntity.content,
    workspaceId: skillEntity.workspaceId,
    isCustom: skillEntity.isCustom,
    isActive: skillEntity.isActive,
    universalIdentifier: skillEntity.universalIdentifier,
    applicationId: skillEntity.applicationId,
    __universal: {
      universalIdentifier: skillEntity.universalIdentifier,
      applicationUniversalIdentifier,
    },
  };
};
