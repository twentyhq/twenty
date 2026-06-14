'use client';

import { Form } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import { PARTNER_APPLICATION_FIELD_COPY } from '@/sections/PartnerApplication/partner-application-modal-data';
import {
  PARTNER_SCOPE_OPTIONS,
  PARTNER_SKILL_SUGGESTIONS,
  type PartnerScopeValue,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import { CategoryCardSelect } from '@/sections/PartnerApplication/wizard/steps/CategoryCardSelect';
import type { PartnerApplicationController } from '@/sections/PartnerApplication/wizard/use-partner-application-state';
import type { MessageDescriptor } from '@lingui/core';

const COPY = PARTNER_APPLICATION_FIELD_COPY;

type ExpertiseStepProps = {
  controller: PartnerApplicationController;
};

export function ExpertiseStep({ controller }: ExpertiseStepProps) {
  const { i18n } = useLingui();
  const { state, setField, toggleScope, setSkills } = controller;

  const categoryOptions = PARTNER_SCOPE_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
    description: i18n._(option.description as MessageDescriptor),
    examples: i18n._(option.examples as MessageDescriptor),
  }));

  return (
    <>
      <Form.Field
        label={i18n._(COPY.partnerScope)}
        hint={i18n._(COPY.partnerScopeHint)}
      >
        <CategoryCardSelect<PartnerScopeValue>
          options={categoryOptions}
          values={state.partnerScope}
          onToggle={toggleScope}
          invalid={state.fieldErrors.partnerScope !== undefined}
          ariaLabel={i18n._(COPY.partnerScope)}
        />
      </Form.Field>
      <Form.Field label={i18n._(COPY.skills)} hint={i18n._(COPY.skillsHint)}>
        <Form.TagInput
          values={state.skills}
          onValuesChange={setSkills}
          placeholder={i18n._(COPY.skillsPlaceholder)}
          ariaLabel={i18n._(COPY.skills)}
          suggestions={PARTNER_SKILL_SUGGESTIONS}
        />
      </Form.Field>
      <Form.Field label={i18n._(COPY.applicationNotes)}>
        <Form.Textarea
          autoComplete="off"
          name="applicationNotes"
          placeholder={i18n._(COPY.applicationNotesPlaceholder)}
          value={state.applicationNotes}
          onChange={(event) => setField('applicationNotes', event.target.value)}
        />
      </Form.Field>
    </>
  );
}
