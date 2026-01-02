import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';

export const fromCreateSkillInputToFlatSkillToCreate = ({
  createSkillInput,
  workspaceId,
  applicationId,
}: {
  createSkillInput: CreateSkillInput;
  workspaceId: string;
  applicationId: string;
}): FlatSkill => {
  const now = new Date().toISOString();

  const { name, label, icon, description } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createSkillInput,
      ['name', 'label', 'icon', 'description'],
    );

  // Content is markdown - only trim, don't collapse whitespace (preserve newlines)
  const content = createSkillInput.content.trim();

  const id = v4();

  return {
    id,
    standardId: null,
    name,
    label,
    icon: icon ?? null,
    description: description ?? null,
    content,
    isCustom: true,
    isActive: true,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    universalIdentifier: id,
    applicationId,
  };
};
