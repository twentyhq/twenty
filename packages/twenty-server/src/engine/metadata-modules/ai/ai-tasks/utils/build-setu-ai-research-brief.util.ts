import {
  type SetuAiResearchBrief,
  type SetuAiResearchEvidence,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type SetuAiResearchCrmContext } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-research-crm-context.type';
import { type SetuAiResearchModelOutput } from 'src/engine/metadata-modules/ai/ai-tasks/types/setu-ai-research-run.type';

const MAX_SECTIONS = 8;
const MAX_LIST_ITEMS = 8;
const MAX_TEXT_LENGTH = 4_000;

const clip = (text: string, maxLength = MAX_TEXT_LENGTH) =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);

    parsed.hash = '';

    return parsed.href.replace(/\/$/, '');
  } catch {
    return url;
  }
};

// Evidence must resolve to something this run actually retrieved. Anything
// else, invented or merely plausible, is dropped and counted, so the brief
// never shows a source nobody checked.
export const buildSetuAiResearchBrief = ({
  output,
  crmContext,
  citedUrls,
}: {
  output: SetuAiResearchModelOutput;
  crmContext: SetuAiResearchCrmContext | null;
  citedUrls: { url: string; title: string | null }[];
}): SetuAiResearchBrief => {
  const allowedEvidence = new Map<string, SetuAiResearchEvidence>();

  if (isDefined(crmContext)) {
    for (const source of [
      crmContext.company,
      ...crmContext.people,
      ...crmContext.opportunities,
      ...crmContext.notes,
      ...crmContext.tasks,
    ]) {
      allowedEvidence.set(source.sourceId, {
        id: source.sourceId,
        kind: 'record',
        label: source.label,
        objectNameSingular: source.objectNameSingular,
        recordId: source.recordId,
      });
    }
  }

  const webEvidenceByUrl = new Map<string, SetuAiResearchEvidence>();

  for (const { url, title } of citedUrls) {
    const normalizedUrl = normalizeUrl(url);

    if (!/^https?:\/\//.test(normalizedUrl)) {
      continue;
    }

    webEvidenceByUrl.set(normalizedUrl, {
      id: normalizedUrl,
      kind: 'web',
      label: clip(title ?? new URL(normalizedUrl).hostname, 200),
      url: normalizedUrl,
    });
  }

  const usedEvidence = new Map<string, SetuAiResearchEvidence>();
  let removedEvidenceCount = 0;

  const sections = output.sections.slice(0, MAX_SECTIONS).map((section) => {
    const evidenceIds: string[] = [];

    for (const evidenceId of section.evidenceIds) {
      const evidence =
        allowedEvidence.get(evidenceId) ??
        webEvidenceByUrl.get(normalizeUrl(evidenceId));

      if (!isDefined(evidence)) {
        removedEvidenceCount += 1;
        continue;
      }

      usedEvidence.set(evidence.id, evidence);

      if (!evidenceIds.includes(evidence.id)) {
        evidenceIds.push(evidence.id);
      }
    }

    return {
      heading: clip(section.heading, 200),
      body: clip(section.body),
      evidenceIds,
    };
  });

  return {
    summary: clip(output.summary, 1_000),
    sections,
    unknowns: output.unknowns
      .slice(0, MAX_LIST_ITEMS)
      .map((item) => clip(item, 500)),
    suggestedNextSteps: output.suggestedNextSteps
      .slice(0, MAX_LIST_ITEMS)
      .map((item) => clip(item, 500)),
    evidence: [...usedEvidence.values()],
    scope: webEvidenceByUrl.size > 0 ? 'crm_and_web' : 'crm_only',
    removedEvidenceCount,
    savedNoteId: null,
  };
};
