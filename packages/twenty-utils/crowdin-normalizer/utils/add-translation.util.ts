import { type CrowdinContext } from '../types/crowdin-context.type';
import { crowdinRequest } from './crowdin-request.util';
import { isTranslationAlreadyPresentError } from './is-translation-already-present-error.util';

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
    if (!isTranslationAlreadyPresentError(error)) throw error;
  }
}
