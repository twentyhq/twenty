import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_SKILL_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-skill/constants/flat-skill-editable-properties.constant';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';
import { type UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';
import {
  SkillException,
  SkillExceptionCode,
} from 'src/engine/metadata-modules/skill/skill.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateSkillInputToFlatSkillToUpdateOrThrow = ({
  flatSkillMaps,
  updateSkillInput,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatSkillMaps: FlatEntityMaps<FlatSkill>;
  updateSkillInput: UpdateSkillInput;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): FlatSkill => {
  const existingFlatSkill = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: updateSkillInput.id,
    flatEntityMaps: flatSkillMaps,
  });

  if (!isDefined(existingFlatSkill)) {
    throw new SkillException(
      'Skill not found',
      SkillExceptionCode.SKILL_NOT_FOUND,
    );
  }

  const shouldOverride = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatSkill.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: false,
  });

  if (
    !shouldOverride &&
    existingFlatSkill.applicationUniversalIdentifier !==
      workspaceCustomApplicationUniversalIdentifier
  ) {
    throw new SkillException(
      'Cannot update standard skill',
      SkillExceptionCode.SKILL_IS_STANDARD,
    );
  }

  const { id: _id, name, isActive, ...otherUpdates } = updateSkillInput;
  // GraphQL accepts an explicit null for any optional input, but isActive is never null
  const updates = {
    ...otherUpdates,
    ...(isDefined(isActive) ? { isActive } : {}),
  };

  if (shouldOverride && isDefined(name) && name !== existingFlatSkill.name) {
    throw new SkillException(
      'Cannot rename a skill owned by another application',
      SkillExceptionCode.INVALID_SKILL_INPUT,
      {
        userFriendlyMessage: msg`A skill installed by an application cannot be renamed.`,
      },
    );
  }

  const { overrides, updatedEditableProperties } =
    sanitizeOverridableEntityInput({
      metadataName: 'skill',
      existingFlatEntity: existingFlatSkill,
      updatedEditableProperties: shouldOverride
        ? updates
        : { ...updates, name },
      shouldOverride,
      callerApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

  return {
    ...mergeUpdateInExistingRecord({
      existing: existingFlatSkill,
      properties: [...FLAT_SKILL_EDITABLE_PROPERTIES],
      update: updatedEditableProperties,
    }),
    overrides,
    updatedAt: new Date().toISOString(),
  };
};
