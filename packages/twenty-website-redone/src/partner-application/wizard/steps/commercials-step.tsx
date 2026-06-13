'use client';

import { useLingui } from '@lingui/react';

import { Field, NumberField, TextField } from '@/ui';

import { PARTNER_APPLICATION_COPY } from '../../partner-application-copy';
import { type PartnerApplicationController } from '../../use-partner-application-state';

const FIELDS = PARTNER_APPLICATION_COPY.fields;

export function CommercialsStep({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  const { i18n } = useLingui();
  const { setField, state } = controller;

  return (
    <>
      <Field label={i18n._(FIELDS.hourlyRate)}>
        <NumberField
          ariaLabel={i18n._(FIELDS.hourlyRate)}
          name="hourlyRate"
          onValueChange={(value) => setField('hourlyRate', value)}
          placeholder={i18n._(FIELDS.hourlyRatePlaceholder)}
          value={state.hourlyRate}
        />
      </Field>
      <Field label={i18n._(FIELDS.projectBudgetMin)}>
        <NumberField
          ariaLabel={i18n._(FIELDS.projectBudgetMin)}
          name="projectBudgetMin"
          onValueChange={(value) => setField('projectBudgetMin', value)}
          placeholder={i18n._(FIELDS.projectBudgetMinPlaceholder)}
          value={state.projectBudgetMin}
        />
      </Field>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.calendarLink)}
          inputMode="url"
          invalid={state.fieldErrors.calendarLink !== undefined}
          name="calendarLink"
          onValueChange={(value) => setField('calendarLink', value)}
          placeholder={i18n._(FIELDS.calendarLink)}
          value={state.calendarLink}
        />
      </Field>
    </>
  );
}
