import { type CrowdinContext } from '../types/crowdin-context.type';
import { crowdinRequest } from './crowdin-request.util';

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
