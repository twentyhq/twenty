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
          invalid={state.fieldErrors.hourlyRate !== undefined}
          name="hourlyRate"
          onValueChange={(value) => setField('hourlyRate', value)}
          placeholder={i18n._(FIELDS.hourlyRatePlaceholder)}
          prefix="$"
          value={state.hourlyRate}
        />
      </Field>
      <Field label={i18n._(FIELDS.projectBudgetMin)}>
        <NumberField
          ariaLabel={i18n._(FIELDS.projectBudgetMin)}
          invalid={state.fieldErrors.projectBudgetMin !== undefined}
          name="projectBudgetMin"
          onValueChange={(value) => setField('projectBudgetMin', value)}
          placeholder={i18n._(FIELDS.projectBudgetMinPlaceholder)}
          prefix="$"
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
