import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';
import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';

export const fromCreateSkillInputToUniversalFlatSkillToCreate = ({
  createSkillInput,
  flatApplication,
}: {
  createSkillInput: CreateSkillInput;
  flatApplication: FlatApplication;
}): UniversalFlatSkill & { id: string } => {
  const now = new Date().toISOString();

  const { name, label, icon, description } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createSkillInput,
      ['name', 'label', 'icon', 'description'],
    );

  // Content is markdown - only trim, don't collapse whitespace (preserve newlines)
  const content = createSkillInput.content.trim();

  const id = createSkillInput.id ?? v4();

  return {
    id,
    universalIdentifier: v4(),
    name,
    label,
    icon: icon ?? null,
    description: description ?? null,
    content,
    isCustom: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
