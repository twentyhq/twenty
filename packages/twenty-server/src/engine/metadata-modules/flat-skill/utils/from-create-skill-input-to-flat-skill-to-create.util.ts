import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';

export const fromCreateSkillInputToFlatSkillToCreate = ({
  createSkillInput,
  workspaceId,
  flatApplication,
}: {
  createSkillInput: CreateSkillInput;
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatSkill => {
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
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
