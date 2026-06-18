'use client';

import { Form } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import { PARTNER_APPLICATION_FIELD_COPY } from '@/sections/PartnerApplication/partner-application-modal-data';
import {
  PARTNER_COUNTRY_OPTIONS,
  PARTNER_LANGUAGE_OPTIONS,
  PARTNER_TYPE_OF_TEAM_OPTIONS,
  type PartnerCountryValue,
  type PartnerLanguageValue,
  type PartnerTypeOfTeam,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import type { PartnerApplicationController } from '@/sections/PartnerApplication/wizard/use-partner-application-state';
import type { MessageDescriptor } from '@lingui/core';

const COPY = PARTNER_APPLICATION_FIELD_COPY;

type ProfileStepProps = {
  controller: PartnerApplicationController;
};

export function ProfileStep({ controller }: ProfileStepProps) {
  const { i18n } = useLingui();
  const { state, setField, toggleLanguage } = controller;

  const countryOptions: ReadonlyArray<{
    value: PartnerCountryValue;
    label: string;
  }> = PARTNER_COUNTRY_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
  }));

  const languageOptions = PARTNER_LANGUAGE_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
  }));

  const teamOptions = PARTNER_TYPE_OF_TEAM_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
  }));

  return (
    <>
      <Form.Field label={i18n._(COPY.typeOfTeam)}>
        <Form.Select<PartnerTypeOfTeam>
          value={state.typeOfTeam}
          onValueChange={(value) => setField('typeOfTeam', value)}
          placeholder={i18n._(COPY.typeOfTeamPlaceholder)}
          options={teamOptions}
          invalid={state.fieldErrors.typeOfTeam !== undefined}
          name="typeOfTeam"
          ariaLabel={i18n._(COPY.typeOfTeam)}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          name="linkedin"
          placeholder={i18n._(COPY.linkedin)}
          type="text"
          value={state.linkedin}
          onChange={(event) => setField('linkedin', event.target.value)}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          name="city"
          placeholder={i18n._(COPY.city)}
          type="text"
          value={state.city}
          onChange={(event) => setField('city', event.target.value)}
          aria-invalid={state.fieldErrors.city ? true : undefined}
        />
      </Form.Field>
      <Form.Field>
        <Form.Select<PartnerCountryValue>
          value={state.country}
          onValueChange={(value) => setField('country', value)}
          placeholder={i18n._(COPY.countryPlaceholder)}
          options={countryOptions}
          invalid={state.fieldErrors.country !== undefined}
          name="country"
          ariaLabel={i18n._(COPY.country)}
          searchable
          searchPlaceholder={i18n._(COPY.countrySearchPlaceholder)}
          searchEmptyLabel={i18n._(COPY.countrySearchEmpty)}
        />
      </Form.Field>
      <Form.Field label={i18n._(COPY.languages)}>
        <Form.MultiSelect<PartnerLanguageValue>
          values={state.languages}
          onToggle={toggleLanguage}
          options={languageOptions}
          ariaLabel={i18n._(COPY.languages)}
        />
      </Form.Field>
    </>
  );
}
