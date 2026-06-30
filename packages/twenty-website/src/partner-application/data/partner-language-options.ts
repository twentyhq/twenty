import { msg } from '@lingui/core/macro';

import { defineFieldOptions } from './define-field-options';

export const PARTNER_LANGUAGE_OPTIONS = defineFieldOptions([
  { value: 'ENGLISH', label: msg`English` },
  { value: 'FRENCH', label: msg`French` },
  { value: 'GERMAN', label: msg`German` },
  { value: 'SPANISH', label: msg`Spanish` },
  { value: 'PORTUGUESE', label: msg`Portuguese` },
  { value: 'ITALIAN', label: msg`Italian` },
  { value: 'DUTCH', label: msg`Dutch` },
  { value: 'ARABIC', label: msg`Arabic` },
  { value: 'CHINESE', label: msg`Chinese` },
  { value: 'JAPANESE', label: msg`Japanese` },
  { value: 'RUSSIAN', label: msg`Russian` },
  { value: 'HINDI', label: msg`Hindi` },
]);

export type PartnerLanguageValue =
  (typeof PARTNER_LANGUAGE_OPTIONS)[number]['value'];
