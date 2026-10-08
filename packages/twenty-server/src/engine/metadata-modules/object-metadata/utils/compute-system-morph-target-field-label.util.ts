import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

// Morph siblings render as one column labelled by the dedup survivor, so a shared label must apply to every sibling
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
  (isDefined(morphId) ? SHARED_LABEL_BY_MORPH_ID[morphId] : undefined) ??
  capitalize(targetObjectNameSingular);
