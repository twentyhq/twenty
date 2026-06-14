'use client';

import { Form } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import { PARTNER_APPLICATION_FIELD_COPY } from '@/sections/PartnerApplication/partner-application-modal-data';
import type { PartnerApplicationController } from '@/sections/PartnerApplication/wizard/use-partner-application-state';

const COPY = PARTNER_APPLICATION_FIELD_COPY;

type CommercialsStepProps = {
  controller: PartnerApplicationController;
};

export function CommercialsStep({ controller }: CommercialsStepProps) {
  const { state, setField } = controller;
  const { i18n } = useLingui();

  return (
    <>
      <Form.Field label={i18n._(COPY.hourlyRate)}>
        <Form.Currency
          value={state.hourlyRate}
          onValueChange={(value) => setField('hourlyRate', value)}
          placeholder={i18n._(COPY.hourlyRatePlaceholder)}
          name="hourlyRate"
          ariaLabel={i18n._(COPY.hourlyRate)}
        />
      </Form.Field>
      <Form.Field label={i18n._(COPY.projectBudgetMin)}>
        <Form.Currency
          value={state.projectBudgetMin}
          onValueChange={(value) => setField('projectBudgetMin', value)}
          placeholder={i18n._(COPY.projectBudgetMinPlaceholder)}
          name="projectBudgetMin"
          ariaLabel={i18n._(COPY.projectBudgetMin)}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          name="calendarLink"
          placeholder={i18n._(COPY.calendarLink)}
          type="text"
          value={state.calendarLink}
          onChange={(event) => setField('calendarLink', event.target.value)}
          aria-invalid={state.fieldErrors.calendarLink ? true : undefined}
        />
      </Form.Field>
    </>
  );
}
