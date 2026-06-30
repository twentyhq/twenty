import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';

// The workspace translation bench stores value-keyed overrides (keyed by the
// source string's message id) that win over shipped translations for any label.
export const resolveWorkspaceTranslationOverride = ({
  sourceValue,
  workspaceCatalog,
}: {
  sourceValue: string | null | undefined;
  workspaceCatalog: Record<string, string> | undefined;
}): string | undefined => {
  if (!isDefined(workspaceCatalog) || !isNonEmptyString(sourceValue)) {
    return undefined;
  }

  return workspaceCatalog[generateMessageId(sourceValue)];
};
