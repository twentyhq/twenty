import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { INBOX_OBJECT_NAMES_BY_LEGACY_NAME } from 'src/engine/metadata-modules/ai/ai-history/constants/inbox-object-names-by-legacy-name.constant';
import { LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME } from 'src/engine/metadata-modules/ai/ai-history/constants/legacy-inbox-object-names-by-legacy-name.constant';
import { type InboxObjectNamesByLegacyName } from 'src/engine/metadata-modules/ai/ai-history/types/inbox-object-names-by-legacy-name.type';

export const getInboxObjectNamesByLegacyName = (
  featureFlagsMap: Partial<
    Pick<FeatureFlagMap, FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED>
  >,
): InboxObjectNamesByLegacyName =>
  featureFlagsMap[FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]
    ? INBOX_OBJECT_NAMES_BY_LEGACY_NAME
    : LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME;
