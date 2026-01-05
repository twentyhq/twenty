import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';

export const fromFlatSkillToSkillDto = (flatSkill: FlatSkill): SkillDTO => ({
  id: flatSkill.id,
  standardId: flatSkill.standardId,
  name: flatSkill.name,
  label: flatSkill.label,
  icon: flatSkill.icon ?? undefined,
  description: flatSkill.description ?? undefined,
  content: flatSkill.content,
  isCustom: flatSkill.isCustom,
  isActive: flatSkill.isActive,
  workspaceId: flatSkill.workspaceId,
  applicationId: flatSkill.applicationId ?? undefined,
  createdAt: new Date(flatSkill.createdAt),
  updatedAt: new Date(flatSkill.updatedAt),
});
