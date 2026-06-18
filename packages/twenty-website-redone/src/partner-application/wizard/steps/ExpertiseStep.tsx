'use client';

import { useLingui } from '@lingui/react';

import { CategoryCardSelect, Field, TagInput, TextareaField } from '@/ui';

import { PARTNER_SCOPE_OPTIONS } from '../../data/partner-scope-options';
import { PARTNER_SKILL_SUGGESTIONS } from '../../data/partner-skill-suggestions';
import { PARTNER_APPLICATION_COPY } from '../../partner-application-copy';
import { type PartnerApplicationController } from '../../use-partner-application-state';

const FIELDS = PARTNER_APPLICATION_COPY.fields;

export function ExpertiseStep({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  const { i18n } = useLingui();
  const { setField, setSkills, state, toggleScope } = controller;

  const scopeOptions = PARTNER_SCOPE_OPTIONS.map((option) => ({
    description: i18n._(option.description),
    examples: i18n._(option.examples),
    label: i18n._(option.label),
    value: option.value,
  }));

  return (
    <>
      <Field
        hint={i18n._(FIELDS.partnerScopeHint)}
        label={i18n._(FIELDS.partnerScope)}
      >
        <CategoryCardSelect
          ariaLabel={i18n._(FIELDS.partnerScope)}
          invalid={state.fieldErrors.partnerScope !== undefined}
          onToggle={toggleScope}
          options={scopeOptions}
          values={state.partnerScope}
        />
      </Field>
      <Field hint={i18n._(FIELDS.skillsHint)} label={i18n._(FIELDS.skills)}>
        <TagInput
          ariaLabel={i18n._(FIELDS.skills)}
          onValuesChange={setSkills}
          placeholder={i18n._(FIELDS.skillsPlaceholder)}
          removeLabel={(tag) =>
            i18n._(PARTNER_APPLICATION_COPY.removeSkill(tag))
          }
          suggestions={PARTNER_SKILL_SUGGESTIONS}
          values={state.skills}
        />
      </Field>
      <Field label={i18n._(FIELDS.applicationNotes)}>
        <TextareaField
          ariaLabel={i18n._(FIELDS.applicationNotes)}
          name="applicationNotes"
          onValueChange={(value) => setField('applicationNotes', value)}
          placeholder={i18n._(FIELDS.applicationNotesPlaceholder)}
          value={state.applicationNotes}
        />
      </Field>
    </>
  );
}
