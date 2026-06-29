'use client';

import { useLingui } from '@lingui/react';

import { Field, Select, TextField } from '@/ui';

import { CLIENT_BRIEF_COPY } from '../../client-brief-copy';
import { HOSTING_TYPE_OPTIONS } from '../../data/hosting-type-options';
import { type ClientBriefController } from '../../use-client-brief-state';

const FIELDS = CLIENT_BRIEF_COPY.fields;

export function ContextStep({
  controller,
}: {
  controller: ClientBriefController;
}) {
  const { i18n } = useLingui();
  const { setField, state } = controller;

  const hostingOptions = HOSTING_TYPE_OPTIONS.map((option) => ({
    label: i18n._(CLIENT_BRIEF_COPY.hostingOptions[option.labelKey]),
    value: option.value,
  }));

  return (
    <>
      <Field label={i18n._(FIELDS.hostingType)}>
        <Select
          ariaLabel={i18n._(FIELDS.hostingType)}
          onValueChange={(value) => setField('hostingType', value)}
          options={hostingOptions}
          placeholder={i18n._(FIELDS.hostingTypePlaceholder)}
          scheme="dark"
          value={state.hostingType}
        />
      </Field>
      <Field label={i18n._(FIELDS.country)}>
        <TextField
          ariaLabel={i18n._(FIELDS.country)}
          name="country"
          onValueChange={(value) => setField('country', value)}
          placeholder={i18n._(FIELDS.countryPlaceholder)}
          value={state.country}
        />
      </Field>
      <Field label={i18n._(FIELDS.languages)}>
        <TextField
          ariaLabel={i18n._(FIELDS.languages)}
          name="languages"
          onValueChange={(value) => setField('languages', value)}
          placeholder={i18n._(FIELDS.languagesPlaceholder)}
          value={state.languages}
        />
      </Field>
      <Field label={i18n._(FIELDS.seatCount)}>
        <TextField
          ariaLabel={i18n._(FIELDS.seatCount)}
          name="seatCount"
          onValueChange={(value) => setField('seatCount', value)}
          placeholder={i18n._(FIELDS.seatCountPlaceholder)}
          value={state.seatCount}
        />
      </Field>
      <Field label={i18n._(FIELDS.timeline)}>
        <TextField
          ariaLabel={i18n._(FIELDS.timeline)}
          name="timeline"
          onValueChange={(value) => setField('timeline', value)}
          placeholder={i18n._(FIELDS.timelinePlaceholder)}
          value={state.timeline}
        />
      </Field>
      <Field label={i18n._(FIELDS.budgetRange)}>
        <TextField
          ariaLabel={i18n._(FIELDS.budgetRange)}
          name="budgetRange"
          onValueChange={(value) => setField('budgetRange', value)}
          placeholder={i18n._(FIELDS.budgetRangePlaceholder)}
          value={state.budgetRange}
        />
      </Field>
    </>
  );
}
