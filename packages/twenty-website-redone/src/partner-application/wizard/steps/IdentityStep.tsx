'use client';

import { useLingui } from '@lingui/react';

import { Field, TextField } from '@/ui';

import { PARTNER_APPLICATION_COPY } from '../../partner-application-copy';
import { type PartnerApplicationController } from '../../use-partner-application-state';

const FIELDS = PARTNER_APPLICATION_COPY.fields;

export function IdentityStep({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  const { i18n } = useLingui();
  const { setField, state } = controller;

  return (
    <>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.name)}
          invalid={state.fieldErrors.name !== undefined}
          name="name"
          onValueChange={(value) => setField('name', value)}
          placeholder={i18n._(FIELDS.name)}
          value={state.name}
        />
      </Field>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.email)}
          inputMode="email"
          invalid={state.fieldErrors.email !== undefined}
          name="email"
          onValueChange={(value) => setField('email', value)}
          placeholder={i18n._(FIELDS.email)}
          value={state.email}
        />
      </Field>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.company)}
          invalid={state.fieldErrors.company !== undefined}
          name="company"
          onValueChange={(value) => setField('company', value)}
          placeholder={i18n._(FIELDS.company)}
          value={state.company}
        />
      </Field>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.website)}
          inputMode="url"
          invalid={state.fieldErrors.website !== undefined}
          name="website"
          onValueChange={(value) => setField('website', value)}
          placeholder={i18n._(FIELDS.website)}
          value={state.website}
        />
      </Field>
    </>
  );
}
