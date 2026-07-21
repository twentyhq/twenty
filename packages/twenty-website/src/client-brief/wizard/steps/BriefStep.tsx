'use client';

import { useLingui } from '@lingui/react';

import { Field, TextareaField } from '@/ui';

import { CLIENT_BRIEF_COPY } from '../../client-brief-copy';
import { type ClientBriefController } from '../../use-client-brief-state';

const FIELDS = CLIENT_BRIEF_COPY.fields;

export function BriefStep({
  controller,
}: {
  controller: ClientBriefController;
}) {
  const { i18n } = useLingui();
  const { setField, state } = controller;

  return (
    <>
      <Field label={i18n._(FIELDS.need)}>
        <TextareaField
          ariaLabel={i18n._(FIELDS.need)}
          invalid={state.fieldErrors.need !== undefined}
          name="need"
          onValueChange={(value) => setField('need', value)}
          placeholder={i18n._(FIELDS.needPlaceholder)}
          value={state.need}
        />
      </Field>
      <Field label={i18n._(FIELDS.requirements)}>
        <TextareaField
          ariaLabel={i18n._(FIELDS.requirements)}
          name="requirements"
          onValueChange={(value) => setField('requirements', value)}
          placeholder={i18n._(FIELDS.requirementsPlaceholder)}
          value={state.requirements}
        />
      </Field>
    </>
  );
}
