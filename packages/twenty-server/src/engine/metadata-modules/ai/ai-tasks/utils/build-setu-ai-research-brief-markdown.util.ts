import { type SetuAiResearchBrief } from 'twenty-shared/ai';

// The saved note carries the same content as the card, with numbered
// sources, so it still reads well outside the chat.
export const buildSetuAiResearchBriefMarkdown = (
  brief: SetuAiResearchBrief,
): string => {
  const evidenceNumberById = new Map(
    brief.evidence.map((evidence, index) => [evidence.id, index + 1]),
  );

  const sectionBlocks = brief.sections.map((section) => {
    const references = section.evidenceIds
      .map((evidenceId) => evidenceNumberById.get(evidenceId))
      .filter((number) => number !== undefined)
      .map((number) => `[${number}]`)
      .join(' ');

    return `## ${section.heading}\n\n${section.body}${references.length > 0 ? `\n\nSources: ${references}` : ''}`;
  });

  const listBlock = (heading: string, items: string[]) =>
    items.length > 0
      ? [`## ${heading}\n\n${items.map((item) => `- ${item}`).join('\n')}`]
      : [];

  const sourceLines = brief.evidence.map((evidence, index) =>
    evidence.kind === 'web'
      ? `${index + 1}. [${evidence.label}](${evidence.url})`
      : `${index + 1}. ${evidence.label} (CRM ${evidence.objectNameSingular})`,
  );

  return [
    brief.summary,
    ...sectionBlocks,
    ...listBlock('Unknowns', brief.unknowns),
    ...listBlock('Suggested next steps', brief.suggestedNextSteps),
    ...(sourceLines.length > 0
      ? [`## Sources\n\n${sourceLines.join('\n')}`]
      : []),
    brief.scope === 'crm_only'
      ? '_Scope: CRM records only. No web sources were used._'
      : '_Scope: CRM records and cited web pages._',
  ].join('\n\n');
};
