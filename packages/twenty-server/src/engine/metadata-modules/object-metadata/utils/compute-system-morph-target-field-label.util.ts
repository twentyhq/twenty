import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { capitalize } from 'twenty-shared/utils';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

// Morph siblings render as one column labelled by whichever sibling survives
// dedup, so a group with a shared label must keep it for every sibling,
// including the ones added or renamed along with a custom object.
const SHARED_LABEL_BY_MORPH_ID: Record<string, string> = {
  [STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId]: i18nLabel(
    msg({ message: `Attached to`, context: 'fieldMetadata.label' }),
  ),
};

export const computeSystemMorphTargetFieldLabel = ({
  morphId,
  targetObjectNameSingular,
}: {
  morphId: string | null | undefined;
  targetObjectNameSingular: string;
}): string =>
  (morphId ? SHARED_LABEL_BY_MORPH_ID[morphId] : undefined) ??
  capitalize(targetObjectNameSingular);
