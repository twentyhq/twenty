/**
 * Thin Crowdin API v2 client for the translation maintenance scripts.
 *
 * Token: https://twenty.crowdin.com/u/settings#api-key
 */

const CROWDIN_BASE_URL = 'https://twenty.api.crowdin.com/api/v2';
// Crowdin caps the URL length rather than the id count; 50 keeps every request short.
const MAX_STRING_IDS_PER_REQUEST = 50;
const PAGE_SIZE = 500;

export type CrowdinContext = {
  token: string;
  projectId: number;
};

export type CrowdinTranslation = {
  stringId: number;
  translationId: number;
  text: string;
};

export function getCrowdinTokenOrThrow(): string {
  const token = process.env.CROWDIN_PERSONAL_TOKEN;

  if (!token) {
    throw new Error(
      'CROWDIN_PERSONAL_TOKEN environment variable not set. Get your token from: https://twenty.crowdin.com/u/settings#api-key',
    );
  }

  return token;
}

async function crowdinRequest<T>(
  { token }: CrowdinContext,
  endpoint: string,
  options: RequestInit = {},
): Promise<T | null> {
  const response = await fetch(`${CROWDIN_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await response.text();

  if (!response.ok) {
    if (response.status === 404) return null;

    throw new Error(`Crowdin API error: ${response.status} ${body}`);
  }

  if (!body) return null;

  return JSON.parse(body) as T;
}

export async function fetchTargetLanguageIds(
  context: CrowdinContext,
): Promise<string[]> {
  type ProjectResponse = { data: { targetLanguageIds: string[] } };

  const response = await crowdinRequest<ProjectResponse>(
    context,
    `/projects/${context.projectId}`,
  );

  return response?.data.targetLanguageIds ?? [];
}

async function fetchAllPages<TItem>(
  context: CrowdinContext,
  buildEndpoint: (pagination: string) => string,
): Promise<TItem[]> {
  const items: TItem[] = [];
  let offset = 0;

  while (true) {
    type PagedResponse = { data: Array<{ data: TItem }> };

    const response = await crowdinRequest<PagedResponse>(
      context,
      buildEndpoint(`limit=${PAGE_SIZE}&offset=${offset}`),
    );

    if (!response || response.data.length === 0) break;

    items.push(...response.data.map((item) => item.data));

    if (response.data.length < PAGE_SIZE) break;

    offset += PAGE_SIZE;
  }

  return items;
}

// Plural strings carry their variants in an object instead of `text`; no rule
// targets them today, so they are skipped rather than half-read.
export async function fetchSourceStringsById(
  context: CrowdinContext,
): Promise<Map<number, string>> {
  type SourceString = { id: number; text: string | Record<string, string> };

  const sourceStrings = await fetchAllPages<SourceString>(
    context,
    (pagination) => `/projects/${context.projectId}/strings?${pagination}`,
  );

  return new Map(
    sourceStrings
      .filter(
        (sourceString): sourceString is { id: number; text: string } =>
          typeof sourceString.text === 'string',
      )
      .map((sourceString) => [sourceString.id, sourceString.text]),
  );
}

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

// Returns the translation that Crowdin actually exports for each string. The
// per-string endpoint would also return older suggestions, and re-adding one of
// those would promote it over the current translation.
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

  // Plural translations carry their variants in an object instead of `text`.
  return translations.filter(
    (translation): translation is CrowdinTranslation =>
      typeof translation.text === 'string',
  );
}

export async function deleteTranslation(
  context: CrowdinContext,
  { translationId }: { translationId: number },
): Promise<void> {
  await crowdinRequest(
    context,
    `/projects/${context.projectId}/translations/${translationId}`,
    { method: 'DELETE' },
  );
}

export async function addTranslation(
  context: CrowdinContext,
  {
    stringId,
    languageId,
    text,
  }: { stringId: number; languageId: string; text: string },
): Promise<void> {
  try {
    await crowdinRequest(
      context,
      `/projects/${context.projectId}/translations`,
      {
        method: 'POST',
        body: JSON.stringify({ stringId, languageId, text }),
      },
    );
  } catch (error) {
    // Crowdin rejects an addition identical to an existing translation, which
    // means the corrected text is already there - the repair is a no-op.
    if (!/identical/i.test(`${error}`)) throw error;
  }
}
