import { type CrowdinContext } from '../types/crowdin-context.type';
import { type CrowdinTranslation } from '../types/crowdin-translation.type';
import { fetchAllPages } from './fetch-all-pages.util';

const MAX_STRING_IDS_PER_REQUEST = 50;

function chunkStringIds(stringIds: number[]): number[][] {
  const batches: number[][] = [];

  for (
    let index = 0;
    index < stringIds.length;
    index += MAX_STRING_IDS_PER_REQUEST
  ) {
    batches.push(stringIds.slice(index, index + MAX_STRING_IDS_PER_REQUEST));
  }

  return batches;
}

export async function fetchLanguageTranslations(
  context: CrowdinContext,
  { languageId, stringIds }: { languageId: string; stringIds?: number[] },
): Promise<CrowdinTranslation[]> {
  const stringIdBatches = stringIds ? chunkStringIds(stringIds) : [undefined];

  const translations: Array<Partial<CrowdinTranslation>> = [];

  for (const batch of stringIdBatches) {
    const stringIdsFilter = batch ? `&stringIds=${batch.join(',')}` : '';

    translations.push(
      ...(await fetchAllPages<Partial<CrowdinTranslation>>(
        context,
        (pagination) =>
          `/projects/${context.projectId}/languages/${languageId}/translations?${pagination}${stringIdsFilter}`,
      )),
    );
  }

  return translations.filter(
    (translation): translation is CrowdinTranslation =>
      typeof translation.stringId === 'number' &&
      typeof translation.translationId === 'number' &&
      typeof translation.text === 'string',
  );
}
