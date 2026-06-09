'use client';

import { Form } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import { PARTNER_APPLICATION_FIELD_COPY } from '@/sections/PartnerApplication/partner-application-modal-data';
import type { PartnerApplicationController } from '@/sections/PartnerApplication/wizard/use-partner-application-state';

const COPY = PARTNER_APPLICATION_FIELD_COPY;

type IdentityStepProps = {
  controller: PartnerApplicationController;
};

export function IdentityStep({ controller }: IdentityStepProps) {
  const { i18n } = useLingui();
  const { state, setField } = controller;

  return (
    <>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          name="name"
          placeholder={i18n._(COPY.name)}
          type="text"
          value={state.name}
          onChange={(event) => setField('name', event.target.value)}
          aria-invalid={state.fieldErrors.name ? true : undefined}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          inputMode="email"
          name="email"
          placeholder={i18n._(COPY.email)}
          type="text"
          value={state.email}
          onChange={(event) => setField('email', event.target.value)}
          aria-invalid={state.fieldErrors.email ? true : undefined}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          name="company"
          placeholder={i18n._(COPY.company)}
          type="text"
          value={state.company}
          onChange={(event) => setField('company', event.target.value)}
          aria-invalid={state.fieldErrors.company ? true : undefined}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          name="website"
          placeholder={i18n._(COPY.website)}
          type="text"
          value={state.website}
          onChange={(event) => setField('website', event.target.value)}
          aria-invalid={state.fieldErrors.website ? true : undefined}
        />
      </Form.Field>
    </>
  );
}
