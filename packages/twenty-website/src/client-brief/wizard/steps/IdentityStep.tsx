'use client';

import { useLingui } from '@lingui/react';

import { Field, TextField } from '@/ui';

import { CLIENT_BRIEF_COPY } from '../../client-brief-copy';
import { type ClientBriefController } from '../../use-client-brief-state';

const FIELDS = CLIENT_BRIEF_COPY.fields;

export function IdentityStep({
  controller,
}: {
  controller: ClientBriefController;
}) {
  const { i18n } = useLingui();
  const { setField, state } = controller;

  return (
    <>
      <Field label={i18n._(FIELDS.firstName)}>
        <TextField
          ariaLabel={i18n._(FIELDS.firstName)}
          invalid={state.fieldErrors.firstName !== undefined}
          name="firstName"
          onValueChange={(value) => setField('firstName', value)}
          placeholder={i18n._(FIELDS.firstName)}
          value={state.firstName}
        />
      </Field>
      <Field label={i18n._(FIELDS.lastName)}>
        <TextField
          ariaLabel={i18n._(FIELDS.lastName)}
          name="lastName"
          onValueChange={(value) => setField('lastName', value)}
          placeholder={i18n._(FIELDS.lastName)}
          value={state.lastName}
        />
      </Field>
      <Field label={i18n._(FIELDS.email)}>
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
      <Field label={i18n._(FIELDS.companyName)}>
        <TextField
          ariaLabel={i18n._(FIELDS.companyName)}
          invalid={state.fieldErrors.companyName !== undefined}
          name="companyName"
          onValueChange={(value) => setField('companyName', value)}
          placeholder={i18n._(FIELDS.companyName)}
          value={state.companyName}
        />
      </Field>
    </>
  );
}
