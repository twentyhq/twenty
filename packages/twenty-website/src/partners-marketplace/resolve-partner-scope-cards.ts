import { PARTNER_SCOPE_OPTIONS } from '@/partner-application/data/partner-scope-options';

import { SCOPE_PRIORITY } from './partner-scope-priority';
import { type PartnerScope } from './partner-scopes';

export function resolvePartnerScopeCards(scopes: readonly PartnerScope[]) {
  const selected = new Set(scopes);

  return SCOPE_PRIORITY.flatMap((value) => {
    if (!selected.has(value)) {
      return [];
    }

    const option = PARTNER_SCOPE_OPTIONS.find(
      (scopeOption) => scopeOption.value === value,
    );

    return option ? [option] : [];
  });
}
