import {
  type IndustryCategoryPage,
  type IndustryObject,
  type IndustryPageDefinition,
  type IndustryQuestion,
  type ResolvedIndustryPage,
} from './industry-page-types';
import { INDUSTRY_COPY_LIMITS } from './industry-copy-limits';

const mergeObjects = (
  inherited: readonly IndustryObject[],
  added: readonly IndustryObject[],
): IndustryObject[] => {
  const addedIds = new Set(added.map((object) => object.id));
  return [...inherited.filter((object) => !addedIds.has(object.id)), ...added];
};

const mergeQuestions = (
  own: readonly IndustryQuestion[],
  inherited: readonly IndustryQuestion[],
): IndustryQuestion[] =>
  [...own, ...inherited].slice(0, INDUSTRY_COPY_LIMITS.questionCount.max);

export const resolveIndustryPage = (
  definition: IndustryPageDefinition,
  pagesBySlug: ReadonlyMap<string, IndustryPageDefinition>,
): ResolvedIndustryPage => {
  if (definition.kind === 'category') {
    const { kind: _kind, ...page } = definition;
    return page;
  }

  const parent = pagesBySlug.get(definition.parentSlug);
  if (parent?.kind !== 'category') {
    throw new Error(
      `Industry page "${definition.slug}" needs a category parent, got "${definition.parentSlug}"`,
    );
  }

  const { kind: _parentKind, ...inherited }: IndustryCategoryPage = parent;

  return {
    ...inherited,
    slug: definition.slug,
    status: definition.status,
    name: definition.name,
    meta: definition.meta,
    hero: definition.hero,
    preview: definition.preview,
    pains: definition.pains ?? inherited.pains,
    dataModel: {
      ...inherited.dataModel,
      objects: mergeObjects(
        inherited.dataModel.objects,
        definition.addedObjects,
      ),
    },
    workflows: { ...inherited.workflows, items: definition.workflows },
    customScreen: definition.customScreen ?? inherited.customScreen,
    questions: mergeQuestions(definition.questions, inherited.questions),
    proof: definition.proof ?? inherited.proof,
    parent: { slug: parent.slug, name: parent.name },
  };
};
