'use client';

import { Body, Heading, HeadingPart, Modal } from '@/design-system/components';
import {
  BUTTON_HEIGHTS_PX,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { ButtonShape } from '@/design-system/components/Button/ButtonShape';
import {
  PARTNER_APPLICATION_MODAL_COPY,
  PARTNER_APPLICATION_STEP_HEADER_LABELS,
} from '@/sections/PartnerApplication/partner-application-modal-data';
import { PARTNER_APPLICATION_STEP_IDS } from '@/sections/PartnerApplication/wizard/partner-fields.data';
import { StepIndicator } from '@/sections/PartnerApplication/wizard/StepIndicator';
import { IdentityStep } from '@/sections/PartnerApplication/wizard/steps/IdentityStep';
import { ProfileStep } from '@/sections/PartnerApplication/wizard/steps/ProfileStep';
import { ExpertiseStep } from '@/sections/PartnerApplication/wizard/steps/ExpertiseStep';
import { CommercialsStep } from '@/sections/PartnerApplication/wizard/steps/CommercialsStep';
import { PartnerApplicationSuccess } from '@/sections/PartnerApplication/wizard/PartnerApplicationSuccess';
import {
  buildPartnerApplicationRequestBody,
  getCurrentStepId,
  usePartnerApplicationState,
  type PartnerApplicationController,
} from '@/sections/PartnerApplication/wizard/use-partner-application-state';
import { theme } from '@/theme';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useCallback, useEffect } from 'react';

const STEPS = PARTNER_APPLICATION_STEP_IDS;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vh, 24px);
`;

const TitleHeadingWrapper = styled.div`
  color: ${theme.colors.secondary.text[100]};
`;

const SubtitleStack = styled.div`
  color: ${theme.colors.secondary.text[60]};
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const HeaderStrip = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  margin-top: ${theme.spacing(2)};
`;

const HeaderLabel = styled.span`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  text-transform: uppercase;
`;

const FieldsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
`;

const FooterControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  width: 100%;
`;

const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  height: ${BUTTON_HEIGHTS_PX.regular}px;
  padding: 0 ${theme.spacing(4)};
  text-transform: uppercase;
`;

const PrimaryButton = styled.button`
  ${buttonBaseStyles}
  position: relative;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const PrimaryLabel = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  position: relative;
  text-transform: uppercase;
  z-index: 1;
`;

const SubmitError = styled.p`
  color: #ff9a9a;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  margin: 0;
`;

const FieldErrorBanner = styled.p`
  color: #ff9a9a;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  margin: 0;
`;

function StepRenderer({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  const stepId = getCurrentStepId(controller.state);
  switch (stepId) {
    case 'identity':
      return <IdentityStep controller={controller} />;
    case 'profile':
      return <ProfileStep controller={controller} />;
    case 'expertise':
      return <ExpertiseStep controller={controller} />;
    case 'commercials':
      return <CommercialsStep controller={controller} />;
  }
}

type DialogPrimitive = React.ComponentType<{ render?: React.ReactElement }>;

type WizardSlots = {
  Title?: DialogPrimitive;
  Description?: DialogPrimitive;
};

type WizardProps = {
  resetSignal: number;
  onSuccess: () => void;
  onSubmitted?: () => void;
  slots?: WizardSlots;
};

export function PartnerApplicationWizard({
  resetSignal,
  onSuccess,
  onSubmitted,
  slots,
}: WizardProps) {
  const { i18n } = useLingui();
  const {
    Title = Modal.Title as DialogPrimitive,
    Description = Modal.Description as DialogPrimitive,
  } = slots ?? {};
  const controller = usePartnerApplicationState();
  const {
    state,
    goNext,
    goBack,
    setSubmitting,
    setSubmitError,
    setSubmitted,
    reset,
  } = controller;

  useEffect(() => {
    reset();
  }, [resetSignal, reset]);

  const stepId = getCurrentStepId(state);
  const stepIndex = state.stepIndex;
  const isLastStep = stepIndex === STEPS.length - 1;
  const errorValues = Object.values(state.fieldErrors);
  const hasFieldErrors = errorValues.length > 0;
  const fieldErrorMessage = errorValues.includes('invalid_email')
    ? PARTNER_APPLICATION_MODAL_COPY.validation.invalidEmail
    : errorValues.includes('invalid_url')
      ? PARTNER_APPLICATION_MODAL_COPY.validation.invalidUrl
      : PARTNER_APPLICATION_MODAL_COPY.validation.incompleteForm;

  const stepLabelNode = (
    <>
      {i18n._(
        PARTNER_APPLICATION_MODAL_COPY.stepProgressLabel(
          stepIndex + 1,
          STEPS.length,
        ),
      )}{' '}
      · {i18n._(PARTNER_APPLICATION_STEP_HEADER_LABELS[stepId])}
    </>
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isLastStep) {
        goNext();
        return;
      }
      if (state.isSubmitting) return;

      const payload = buildPartnerApplicationRequestBody(state);

      setSubmitError(null);
      setSubmitting(true);
      try {
        const response = await fetch('/api/partner-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          setSubmitError(
            i18n._(PARTNER_APPLICATION_MODAL_COPY.validation.submitFailed),
          );
          return;
        }
        setSubmitted();
        onSubmitted?.();
      } catch {
        setSubmitError(
          i18n._(PARTNER_APPLICATION_MODAL_COPY.validation.submitFailed),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      isLastStep,
      goNext,
      state,
      setSubmitError,
      setSubmitting,
      setSubmitted,
      onSubmitted,
      i18n,
    ],
  );

  if (state.isSubmitted) {
    return (
      <PartnerApplicationSuccess
        Title={Title}
        Description={Description}
        titleSerif={i18n._(PARTNER_APPLICATION_MODAL_COPY.successTitleSerif)}
        titleSans={i18n._(PARTNER_APPLICATION_MODAL_COPY.successTitleSans)}
        subtitle={i18n._(PARTNER_APPLICATION_MODAL_COPY.bookIntroSubtitle)}
        bookLaterLabel={i18n._(PARTNER_APPLICATION_MODAL_COPY.bookLater)}
        name={state.name}
        email={state.email}
        company={state.company}
        onDismiss={onSuccess}
      />
    );
  }

  return (
    <>
      <TitleBlock>
        {stepIndex === 0 ? (
          <>
            <Title
              render={
                <TitleHeadingWrapper>
                  <Heading as="h2" size="lg" weight="light">
                    <HeadingPart fontFamily="serif" fontWeight="light">
                      {i18n._(PARTNER_APPLICATION_MODAL_COPY.titleSerif)}
                    </HeadingPart>
                    <br />
                    <HeadingPart fontFamily="sans" fontWeight="light">
                      {i18n._(PARTNER_APPLICATION_MODAL_COPY.titleSans)}
                    </HeadingPart>
                  </Heading>
                </TitleHeadingWrapper>
              }
            />
            <Description
              render={
                <SubtitleStack>
                  <Body size="md">
                    {i18n._(PARTNER_APPLICATION_MODAL_COPY.subtitleLine1)}
                  </Body>
                  <Body size="md">
                    {i18n._(PARTNER_APPLICATION_MODAL_COPY.subtitleLine2)}
                  </Body>
                </SubtitleStack>
              }
            />
          </>
        ) : null}
        <HeaderStrip>
          {stepIndex === 0 ? (
            <HeaderLabel>{stepLabelNode}</HeaderLabel>
          ) : (
            <Title render={<HeaderLabel>{stepLabelNode}</HeaderLabel>} />
          )}
          <StepIndicator stepCount={STEPS.length} activeStepIndex={stepIndex} />
        </HeaderStrip>
      </TitleBlock>

      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <FieldsStack>
          <StepRenderer controller={controller} />

          <Modal.Footer>
            {state.submitError ? (
              <SubmitError role="alert">{state.submitError}</SubmitError>
            ) : null}
            {hasFieldErrors ? (
              <FieldErrorBanner role="alert">
                {i18n._(fieldErrorMessage)}
              </FieldErrorBanner>
            ) : null}
            <FooterControls>
              {stepIndex > 0 ? (
                <SecondaryButton type="button" onClick={goBack}>
                  {i18n._(PARTNER_APPLICATION_MODAL_COPY.back)}
                </SecondaryButton>
              ) : (
                <span />
              )}
              <PrimaryButton
                type="submit"
                disabled={state.isSubmitting}
                aria-busy={state.isSubmitting}
              >
                <ButtonShape
                  fillColor={theme.colors.primary.background[100]}
                  height={BUTTON_HEIGHTS_PX.regular}
                  strokeColor="none"
                />
                <PrimaryLabel>
                  {isLastStep
                    ? state.isSubmitting
                      ? i18n._(PARTNER_APPLICATION_MODAL_COPY.submitInFlight)
                      : i18n._(PARTNER_APPLICATION_MODAL_COPY.submit)
                    : i18n._(PARTNER_APPLICATION_MODAL_COPY.next)}
                </PrimaryLabel>
              </PrimaryButton>
            </FooterControls>
          </Modal.Footer>
        </FieldsStack>
      </form>
    </>
  );
}

export const partnerWizardPanelClass = css`
  --modal-panel-width: min(360px, 100%);

  @media (min-width: ${theme.breakpoints.md}px) {
    --modal-panel-width: min(720px, 100%);
  }
`;
