'use client';

import { Form } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import { PARTNER_APPLICATION_FIELD_COPY } from '@/sections/PartnerApplication/partner-application-modal-data';
import {
  PARTNER_COUNTRY_OPTIONS,
  PARTNER_LANGUAGE_OPTIONS,
  type PartnerCountryValue,
  type PartnerLanguageValue,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import type { PartnerApplicationController } from '@/sections/PartnerApplication/wizard/use-partner-application-state';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { MessageDescriptor } from '@lingui/core';

const COPY = PARTNER_APPLICATION_FIELD_COPY;

const InlineToggleLabel = styled.label`
  align-items: center;
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(2)};
  margin-top: ${theme.spacing(2)};
`;

const InlineCheckbox = styled.input`
  accent-color: ${theme.colors.highlight[100]};
  cursor: pointer;
  height: 16px;
  width: 16px;
`;

type ProfileStepProps = {
  controller: PartnerApplicationController;
};

export function ProfileStep({ controller }: ProfileStepProps) {
  const { i18n } = useLingui();
  const { state, setField, toggleLanguage, toggleLanguagesOther } = controller;

  const countryOptions: ReadonlyArray<{
    value: PartnerCountryValue | 'OTHER';
    label: string;
  }> = [
    ...PARTNER_COUNTRY_OPTIONS.map((option) => ({
      value: option.value,
      label: i18n._(option.label as MessageDescriptor),
    })),
    { value: 'OTHER' as const, label: i18n._(COPY.optionOther) },
  ];

  const languageOptions = PARTNER_LANGUAGE_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
  }));

  return (
    <>
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
        />
      </Form.Field>
      <Form.Field label={i18n._(COPY.country)}>
        <Form.Select<PartnerCountryValue | 'OTHER'>
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
      {state.country === 'OTHER' ? (
        <Form.Field>
          <Form.Input
            autoComplete="off"
            name="countryOther"
            placeholder={i18n._(COPY.countryOther)}
            type="text"
            value={state.countryOther}
            onChange={(event) =>
              setField('countryOther', event.target.value)
            }
            aria-invalid={state.fieldErrors.countryOther ? true : undefined}
          />
        </Form.Field>
      ) : null}
      <Form.Field label={i18n._(COPY.languages)}>
        <Form.MultiSelect<PartnerLanguageValue>
          values={state.languages}
          onToggle={toggleLanguage}
          options={languageOptions}
          ariaLabel={i18n._(COPY.languages)}
        />
        <InlineToggleLabel>
          <InlineCheckbox
            type="checkbox"
            checked={state.languagesOtherSelected}
            onChange={toggleLanguagesOther}
          />
          {i18n._(COPY.languagesOtherToggle)}
        </InlineToggleLabel>
      </Form.Field>
      {state.languagesOtherSelected ? (
        <Form.Field>
          <Form.Input
            autoComplete="off"
            name="languagesOther"
            placeholder={i18n._(COPY.languagesOther)}
            type="text"
            value={state.languagesOther}
            onChange={(event) =>
              setField('languagesOther', event.target.value)
            }
            aria-invalid={
              state.fieldErrors.languagesOther ? true : undefined
            }
          />
        </Form.Field>
      ) : null}
    </>
  );
}
