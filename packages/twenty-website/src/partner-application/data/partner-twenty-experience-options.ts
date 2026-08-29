import { msg } from '@lingui/core/macro';

import { defineFieldOptions } from './define-field-options';

export const PARTNER_TWENTY_EXPERIENCE_OPTIONS = defineFieldOptions([
  { value: 'CUSTOM_APPS', label: msg`Custom apps` },
  { value: 'DATA_MODELS', label: msg`Data models` },
  { value: 'WORKFLOWS', label: msg`Workflows` },
  { value: 'FRONT_COMPONENTS', label: msg`Front components` },
]);

export type PartnerTwentyExperienceValue =
  (typeof PARTNER_TWENTY_EXPERIENCE_OPTIONS)[number]['value'];
