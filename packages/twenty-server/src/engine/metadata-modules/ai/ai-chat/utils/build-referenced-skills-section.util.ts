import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { LOAD_SKILL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

export const buildReferencedSkillsSection = (
  referencedSkills: FlatSkill[],
): string => {
  if (referencedSkills.length === 0) {
    return '';
  }

  const skillSections = referencedSkills
    .map(
      (skill) => `### ${skill.label} (\`${skill.name}\`)

${tipTapDocumentToMarkdown(skill.content)}`,
    )
    .join('\n\n');

  return `
## Referenced Skills (already loaded)

The user explicitly referenced these skills with [[skill:...]] in their messages. Their full instructions are below, so follow them directly: do NOT call \`${LOAD_SKILL_TOOL_NAME}\` for them.

${skillSections}`;
};
