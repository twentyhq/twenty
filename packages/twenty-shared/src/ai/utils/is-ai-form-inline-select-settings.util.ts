import { type AiFormInlineSelectSettings } from '@/ai/types/AiFormInlineSelectSettings';
import { getAiFormInlineSelectSettingsErrors } from '@/ai/utils/get-ai-form-inline-select-settings-errors.util';

export const isAiFormInlineSelectSettings = (
  settings: unknown,
): settings is AiFormInlineSelectSettings =>
  getAiFormInlineSelectSettingsErrors(settings).length === 0;
