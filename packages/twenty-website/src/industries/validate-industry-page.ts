import { type MessageDescriptor } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { INDUSTRY_BANNED_PHRASES } from './industry-banned-phrases';
import { INDUSTRY_COPY_LIMITS } from './industry-copy-limits';
import { type ResolvedIndustryPage } from './industry-page-types';
import { INDUSTRY_STANDARD_OBJECT_LABELS } from './industry-standard-object-labels';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;
const PLACEHOLDER_PATTERN = /\[[^\]]*\]/;

type CollectedCopy = { path: string; text: string };

const isMessageDescriptor = (value: unknown): value is MessageDescriptor =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { id?: unknown }).id === 'string' &&
  Object.keys(value).every((key) =>
    ['id', 'message', 'values', 'comment'].includes(key),
  );

// The compiled macro may strip `message` in production builds; tests see
// the source text as the id.
const readText = (descriptor: MessageDescriptor): string =>
  descriptor.message ?? descriptor.id;

const collectCopy = (value: unknown, path: string): CollectedCopy[] => {
  if (isMessageDescriptor(value)) {
    return [{ path, text: readText(value) }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectCopy(item, `${path}[${index}]`),
    );
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      collectCopy(child, path === '' ? key : `${path}.${key}`),
    );
  }
  return [];
};

const countWords = (sentence: string): number =>
  sentence.split(/\s+/).filter((word) => word.length > 0).length;

const validateCopy = (page: ResolvedIndustryPage): string[] => {
  const problems: string[] = [];

  for (const { path, text } of collectCopy(page, '')) {
    const lowered = text.toLowerCase();
    for (const phrase of INDUSTRY_BANNED_PHRASES) {
      if (lowered.includes(phrase)) {
        problems.push(`${path}: uses "${phrase}"`);
      }
    }
    if (text.includes('!')) {
      problems.push(`${path}: exclamation mark`);
    }
    if (EMOJI_PATTERN.test(text)) {
      problems.push(`${path}: emoji`);
    }
    if (page.status === 'live' && PLACEHOLDER_PATTERN.test(text)) {
      problems.push(`${path}: unresolved [placeholder] on a live page`);
    }
    for (const sentence of text.split(/(?<=[.?])\s+/)) {
      if (countWords(sentence) > INDUSTRY_COPY_LIMITS.sentenceWords) {
        problems.push(
          `${path}: sentence over ${INDUSTRY_COPY_LIMITS.sentenceWords} words`,
        );
      }
    }
  }

  if (
    readText(page.hero.headline).length >
    INDUSTRY_COPY_LIMITS.heroHeadlineCharacters
  ) {
    problems.push('hero.headline: too long');
  }
  if (
    readText(page.hero.body).length > INDUSTRY_COPY_LIMITS.heroBodyCharacters
  ) {
    problems.push('hero.body: too long');
  }

  return problems;
};

const validateStructure = (
  page: ResolvedIndustryPage,
  caseStudySlugs: ReadonlySet<string>,
): string[] => {
  const problems: string[] = [];
  const objectIds = new Set<string>([
    ...Object.keys(INDUSTRY_STANDARD_OBJECT_LABELS),
    ...page.dataModel.objects.map((object) => object.id),
  ]);
  const requireObject = (objectId: string, path: string) => {
    if (!objectIds.has(objectId)) {
      problems.push(`${path}: unknown object "${objectId}"`);
    }
  };

  if (!SLUG_PATTERN.test(page.slug)) {
    problems.push(`slug: "${page.slug}" is not kebab-case`);
  }

  requireObject(page.preview.tableObjectId, 'preview.tableObjectId');

  page.dataModel.objects.forEach((object, objectIndex) => {
    object.fields.forEach((field, fieldIndex) => {
      if (isDefined(field.relatesTo)) {
        requireObject(
          field.relatesTo,
          `dataModel.objects[${objectIndex}].fields[${fieldIndex}]`,
        );
      }
    });
  });

  page.workflows.items.forEach((workflow, index) => {
    const { min, max } = INDUSTRY_COPY_LIMITS.workflowSteps;
    if (workflow.steps.length < min || workflow.steps.length > max) {
      problems.push(`workflows.items[${index}]: needs ${min} to ${max} steps`);
    }
    if (workflow.steps[0]?.kind !== 'trigger') {
      problems.push(`workflows.items[${index}]: must start with a trigger`);
    }
  });

  const { min: minAgents, max: maxAgents } = INDUSTRY_COPY_LIMITS.agentCount;
  if (
    page.agents.items.length < minAgents ||
    page.agents.items.length > maxAgents
  ) {
    problems.push(`agents.items: needs ${minAgents} to ${maxAgents} agents`);
  }
  page.agents.items.forEach((agent, index) => {
    if (agent.writes.length === 0) {
      problems.push(
        `agents.items[${index}]: an agent must write at least one object`,
      );
    }
    [...agent.reads, ...agent.writes].forEach((objectId) =>
      requireObject(objectId, `agents.items[${index}]`),
    );
  });

  requireObject(page.customScreen.placedOn, 'customScreen.placedOn');

  const { preview: screenPreview } = page.customScreen;
  screenPreview.rows.forEach((row, index) => {
    if (row.cells.length !== screenPreview.columns.length) {
      problems.push(
        `customScreen.preview.rows[${index}]: ${row.cells.length} cells for ${screenPreview.columns.length} columns`,
      );
    }
  });
  page.preview.rows.forEach((row, index) => {
    for (const column of page.preview.columns) {
      if (!isDefined(row.cells[column.id])) {
        problems.push(
          `preview.rows[${index}]: no cell for column "${column.id}"`,
        );
      }
    }
  });

  const roleIds = page.access.roles.map((role) => role.id);
  page.access.rules.forEach((rule, index) => {
    requireObject(rule.objectId, `access.rules[${index}]`);
    for (const roleId of roleIds) {
      if (!isDefined(rule.accessByRoleId[roleId])) {
        problems.push(`access.rules[${index}]: no entry for role "${roleId}"`);
      }
    }
  });

  page.switching.mappings.forEach((mapping, index) =>
    requireObject(mapping.objectId, `switching.mappings[${index}]`),
  );

  if (
    page.proof.kind === 'caseStudy' &&
    !caseStudySlugs.has(page.proof.caseStudySlug)
  ) {
    problems.push(`proof: unknown case study "${page.proof.caseStudySlug}"`);
  }

  page.pains.forEach((pain, index) => {
    if (pain.answeredBy === 'proof' && page.proof.kind === 'none') {
      problems.push(
        `pains[${index}]: answered by a proof section that is empty`,
      );
    }
  });

  const { min: minQuestions, max: maxQuestions } =
    INDUSTRY_COPY_LIMITS.questionCount;
  if (
    page.questions.length < minQuestions ||
    page.questions.length > maxQuestions
  ) {
    problems.push(`questions: needs ${minQuestions} to ${maxQuestions}`);
  }

  return problems;
};

export const validateIndustryPage = (
  page: ResolvedIndustryPage,
  caseStudySlugs: ReadonlySet<string>,
): string[] => [
  ...validateStructure(page, caseStudySlugs),
  ...validateCopy(page),
];
