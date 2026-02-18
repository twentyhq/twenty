import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromSkillEntityToFlatSkill = ({
  entity: skillEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'skill'>): FlatSkill => {
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
    applicationUniversalIdentifier,
  };
};
