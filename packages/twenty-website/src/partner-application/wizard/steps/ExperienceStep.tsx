'use client';

import { useLingui } from '@lingui/react';

import { ChipMultiSelect, Field, TextareaField, TextField } from '@/ui';

import { PARTNER_TWENTY_EXPERIENCE_OPTIONS } from '../../data/partner-twenty-experience-options';
import { PARTNER_APPLICATION_COPY } from '../../partner-application-copy';
import { type PartnerApplicationController } from '../../use-partner-application-state';

const FIELDS = PARTNER_APPLICATION_COPY.fields;

export function ExperienceStep({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  const { i18n } = useLingui();
  const { setField, state, toggleExperience } = controller;

  const experienceOptions = PARTNER_TWENTY_EXPERIENCE_OPTIONS.map((option) => ({
    label: i18n._(option.label),
    value: option.value,
  }));

  return (
    <>
      <Field
        hint={i18n._(FIELDS.twentyExperienceHint)}
        label={i18n._(FIELDS.twentyExperience)}
      >
        <ChipMultiSelect
          ariaLabel={i18n._(FIELDS.twentyExperience)}
          onToggle={toggleExperience}
          options={experienceOptions}
          values={state.twentyExperience}
        />
      </Field>
      <Field
        hint={i18n._(FIELDS.twentyExperienceNotesHint)}
        label={i18n._(FIELDS.twentyExperienceNotes)}
      >
        <TextareaField
          ariaLabel={i18n._(FIELDS.twentyExperienceNotes)}
          invalid={state.fieldErrors.twentyExperienceNotes !== undefined}
          name="twentyExperienceNotes"
          onValueChange={(value) => setField('twentyExperienceNotes', value)}
          placeholder={i18n._(FIELDS.twentyExperienceNotesPlaceholder)}
          value={state.twentyExperienceNotes}
        />
      </Field>
      <Field
        hint={i18n._(FIELDS.twentyExperienceProofLinkHint)}
        label={i18n._(FIELDS.twentyExperienceProofLink)}
      >
        <TextField
          ariaLabel={i18n._(FIELDS.twentyExperienceProofLink)}
          inputMode="url"
          invalid={state.fieldErrors.twentyExperienceProofLink !== undefined}
          name="twentyExperienceProofLink"
          onValueChange={(value) =>
            setField('twentyExperienceProofLink', value)
          }
          placeholder="https://"
          value={state.twentyExperienceProofLink}
        />
      </Field>
    </>
  );
}
