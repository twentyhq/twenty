import { LOAD_SKILL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

export const buildSkillCatalogSection = (skillCatalog: FlatSkill[]): string => {
  if (skillCatalog.length === 0) {
    return '';
  }

  const skillsList = skillCatalog
    .map((skill) => `- \`${skill.name}\`: ${skill.description ?? skill.label}`)
    .join('\n');

  return `
## Available Skills

Skills provide detailed expertise for specialized tasks. Load a skill before attempting complex operations.
To load a skill, call \`${LOAD_SKILL_TOOL_NAME}\` with the skill name(s).

${skillsList}`;
};
