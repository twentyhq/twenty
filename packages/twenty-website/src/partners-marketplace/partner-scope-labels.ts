import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type PartnerScope } from './partner-scopes';

// Mirrors the Partner.partnerScope ("Categories") option labels in the
// twenty-partners CRM.
export const PARTNER_SCOPE_LABELS: Record<PartnerScope, MessageDescriptor> = {
  ADVISORY: msg`Advisory & Discovery`,
  SOLUTIONING: msg`Solutioning`,
  DEVELOPMENT: msg`Custom Development`,
  HOSTING: msg`Hosting & Infrastructure`,
  SUPPORT: msg`Training & Adoption`,
};
