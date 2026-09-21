import { type CrowdinContext } from '../types/crowdin-context.type';
import { fetchAllPages } from './fetch-all-pages.util';

export async function fetchSourceStringsById(
  context: CrowdinContext,
): Promise<Map<number, string>> {
  type SourceString = {
    id?: number;
    text?: string | Record<string, string>;
  };

  const sourceStrings = await fetchAllPages<SourceString>(
    context,
    (pagination) => `/projects/${context.projectId}/strings?${pagination}`,
  );

  return new Map(
    sourceStrings
      .filter(
        (sourceString): sourceString is { id: number; text: string } =>
          typeof sourceString.id === 'number' &&
          typeof sourceString.text === 'string',
      )
      .map((sourceString) => [sourceString.id, sourceString.text]),
  );
}
