import {
  INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
  type InboxObjectNamesByLegacyName,
  LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
} from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

export const getInboxObjectNamesByLegacyName = (
  featureFlagsMap: Partial<
    Pick<FeatureFlagMap, FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED>
  >,
): InboxObjectNamesByLegacyName =>
  featureFlagsMap[FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]
    ? INBOX_OBJECT_NAMES_BY_LEGACY_NAME
    : LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME;
