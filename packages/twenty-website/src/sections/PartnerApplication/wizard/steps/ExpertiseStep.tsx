'use client';

import { Form } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import { PARTNER_APPLICATION_FIELD_COPY } from '@/sections/PartnerApplication/partner-application-modal-data';
import {
  PARTNER_DEPLOYMENT_OPTIONS,
  PARTNER_SCOPE_OPTIONS,
  PARTNER_TYPE_OF_TEAM_OPTIONS,
  type PartnerDeploymentValue,
  type PartnerScopeValue,
  type PartnerTypeOfTeam,
} from '@/sections/PartnerApplication/wizard/partner-fields.data';
import type { PartnerApplicationController } from '@/sections/PartnerApplication/wizard/use-partner-application-state';
import type { MessageDescriptor } from '@lingui/core';

const COPY = PARTNER_APPLICATION_FIELD_COPY;

type ExpertiseStepProps = {
  controller: PartnerApplicationController;
};

export function ExpertiseStep({ controller }: ExpertiseStepProps) {
  const { i18n } = useLingui();
  const {
    state,
    setField,
    toggleScope,
    toggleDeployment,
    setSkills,
  } = controller;

  const teamOptions = PARTNER_TYPE_OF_TEAM_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
  }));
  const scopeOptions = PARTNER_SCOPE_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
  }));
  const deploymentOptions = PARTNER_DEPLOYMENT_OPTIONS.map((option) => ({
    value: option.value,
    label: i18n._(option.label as MessageDescriptor),
  }));

  return (
    <>
      <Form.Field label={i18n._(COPY.typeOfTeam)}>
        <Form.Select<PartnerTypeOfTeam>
          value={state.typeOfTeam}
          onValueChange={(value) => setField('typeOfTeam', value)}
          placeholder={i18n._(COPY.typeOfTeamPlaceholder)}
          options={teamOptions}
          invalid={state.fieldErrors.typeOfTeam !== undefined}
          name="typeOfTeam"
          ariaLabel={i18n._(COPY.typeOfTeam)}
        />
      </Form.Field>
      <Form.Field
        label={i18n._(COPY.partnerScope)}
        hint={i18n._(COPY.partnerScopeHint)}
      >
        <Form.MultiSelect<PartnerScopeValue>
          values={state.partnerScope}
          onToggle={toggleScope}
          options={scopeOptions}
          invalid={state.fieldErrors.partnerScope !== undefined}
          ariaLabel={i18n._(COPY.partnerScope)}
        />
      </Form.Field>
      <Form.Field
        label={i18n._(COPY.skills)}
        hint={i18n._(COPY.skillsHint)}
      >
        <Form.TagInput
          values={state.skills}
          onValuesChange={setSkills}
          placeholder={i18n._(COPY.skillsPlaceholder)}
          ariaLabel={i18n._(COPY.skills)}
        />
      </Form.Field>
      <Form.Field label={i18n._(COPY.deployment)}>
        <Form.MultiSelect<PartnerDeploymentValue>
          values={state.deploymentExpertise}
          onToggle={toggleDeployment}
          options={deploymentOptions}
          invalid={state.fieldErrors.deploymentExpertise !== undefined}
          ariaLabel={i18n._(COPY.deployment)}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          autoComplete="off"
          name="workspaceUrl"
          placeholder={i18n._(COPY.workspaceUrl)}
          type="text"
          value={state.workspaceUrl}
          onChange={(event) => setField('workspaceUrl', event.target.value)}
          aria-invalid={state.fieldErrors.workspaceUrl ? true : undefined}
        />
      </Form.Field>
      <Form.Field>
        <Form.Textarea
          autoComplete="off"
          name="customerReferences"
          placeholder={i18n._(COPY.customerReferences)}
          value={state.customerReferences}
          onChange={(event) =>
            setField('customerReferences', event.target.value)
          }
        />
      </Form.Field>
    </>
  );
}
