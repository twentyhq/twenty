'use client';

import { useLingui } from '@lingui/react';

import {
  ChipMultiSelect,
  ChipSingleSelect,
  Combobox,
  type ComboboxItem,
  Field,
  TextField,
} from '@/ui';

import { PARTNER_COUNTRY_OPTIONS } from '../../data/partner-country-options';
import { PARTNER_LANGUAGE_OPTIONS } from '../../data/partner-language-options';
import { PARTNER_TEAM_TYPE_OPTIONS } from '../../data/partner-team-type-options';
import { PARTNER_APPLICATION_COPY } from '../../partner-application-copy';
import { type PartnerApplicationController } from '../../use-partner-application-state';

const FIELDS = PARTNER_APPLICATION_COPY.fields;

export function ProfileStep({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  const { i18n } = useLingui();
  const { setField, state, toggleLanguage } = controller;

  const teamOptions = PARTNER_TEAM_TYPE_OPTIONS.map((option) => ({
    label: i18n._(option.label),
    value: option.value,
  }));
  const languageOptions = PARTNER_LANGUAGE_OPTIONS.map((option) => ({
    label: i18n._(option.label),
    value: option.value,
  }));
  const countryItems: readonly ComboboxItem<
    (typeof PARTNER_COUNTRY_OPTIONS)[number]['value']
  >[] = PARTNER_COUNTRY_OPTIONS.map((option) => ({
    label: i18n._(option.label),
    value: option.value,
  }));

  return (
    <>
      <Field label={i18n._(FIELDS.typeOfTeam)}>
        <ChipSingleSelect
          ariaLabel={i18n._(FIELDS.typeOfTeam)}
          onSelect={(value) => setField('typeOfTeam', value)}
          options={teamOptions}
          value={state.typeOfTeam}
        />
      </Field>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.linkedin)}
          inputMode="url"
          name="linkedin"
          onValueChange={(value) => setField('linkedin', value)}
          placeholder={i18n._(FIELDS.linkedin)}
          value={state.linkedin}
        />
      </Field>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.city)}
          name="city"
          onValueChange={(value) => setField('city', value)}
          placeholder={i18n._(FIELDS.city)}
          value={state.city}
        />
      </Field>
      <Field>
        <Combobox
          ariaLabel={i18n._(FIELDS.country)}
          emptyLabel={i18n._(FIELDS.countrySearchEmpty)}
          invalid={state.fieldErrors.country !== undefined}
          items={countryItems}
          onValueChange={(value) => setField('country', value)}
          placeholder={i18n._(FIELDS.countryPlaceholder)}
          scheme="dark"
          searchPlaceholder={i18n._(FIELDS.countrySearchPlaceholder)}
          value={state.country}
        />
      </Field>
      <Field label={i18n._(FIELDS.languages)}>
        <ChipMultiSelect
          ariaLabel={i18n._(FIELDS.languages)}
          onToggle={toggleLanguage}
          options={languageOptions}
          values={state.languages}
        />
      </Field>
    </>
  );
}
