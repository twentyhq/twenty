import { type MessageDescriptor } from '@lingui/core';

import { PARTNER_SCOPE_OPTIONS } from './data/partner-scope-options';
import { type PartnerScope } from './partner-scopes';

export const PARTNER_SCOPE_LABELS = Object.fromEntries(
  PARTNER_SCOPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<PartnerScope, MessageDescriptor>;
