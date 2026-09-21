import { type CrowdinContext } from '../types/crowdin-context.type';
import { crowdinRequest } from './crowdin-request.util';

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
