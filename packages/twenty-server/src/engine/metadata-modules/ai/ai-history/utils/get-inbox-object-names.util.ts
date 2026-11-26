import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { INBOX_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/inbox-object-names.constant';
import { LEGACY_INBOX_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/legacy-inbox-object-names.constant';
import { type InboxObjectNames } from 'src/engine/metadata-modules/ai/ai-history/types/inbox-object-names.type';

export const getInboxObjectNames = (
  featureFlagsMap: Partial<FeatureFlagMap>,
): InboxObjectNames =>
  featureFlagsMap[FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]
    ? INBOX_OBJECT_NAMES
    : LEGACY_INBOX_OBJECT_NAMES;
