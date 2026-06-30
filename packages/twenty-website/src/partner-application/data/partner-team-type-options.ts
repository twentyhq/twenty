import { msg } from '@lingui/core/macro';

import { defineFieldOptions } from './define-field-options';

export const PARTNER_TEAM_TYPE_OPTIONS = defineFieldOptions([
  { value: 'SOLO', label: msg`Solo` },
  { value: 'AGENCY', label: msg`Agency` },
]);

export type PartnerTeamTypeValue =
  (typeof PARTNER_TEAM_TYPE_OPTIONS)[number]['value'];
