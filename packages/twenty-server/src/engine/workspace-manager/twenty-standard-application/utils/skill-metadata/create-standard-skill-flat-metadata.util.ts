import { v4 } from 'uuid';

import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { STANDARD_SKILL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-skill.constant';
import { type AllStandardSkillName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-skill-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardSkillContext = {
  skillName: AllStandardSkillName;
  name: string;
  label: string;
  icon: string | null;
  description: string | null;
  content: string;
  isCustom: boolean;
};

export type CreateStandardSkillArgs = StandardBuilderArgs<'skill'> & {
  context: CreateStandardSkillContext;
};

export const createStandardSkillFlatMetadata = ({
  context: { skillName, name, label, icon, description, content, isCustom },
  workspaceId,
  twentyStandardApplicationId,
  now,
}: CreateStandardSkillArgs): FlatSkill => {
  const universalIdentifier = STANDARD_SKILL[skillName].universalIdentifier;

  return {
    id: v4(),
    universalIdentifier,
    standardId: universalIdentifier,
    name,
    label,
    icon,
    description,
    content,
    isCustom,
    isActive: true,
    workspaceId,
    applicationId: twentyStandardApplicationId,
    createdAt: now,
    updatedAt: now,
  };
};
