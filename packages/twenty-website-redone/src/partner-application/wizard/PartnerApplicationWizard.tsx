'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type FormEvent, useCallback, useEffect } from 'react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Button, Heading, StepIndicator } from '@/ui';

import { buildPartnerApplicationRequestBody } from '../build-partner-application-request-body';
import { PARTNER_APPLICATION_STEP_IDS } from '../data/partner-application-step-ids';
import { getCurrentStepId } from '../get-current-step-id';
import { PARTNER_APPLICATION_COPY } from '../partner-application-copy';
import {
  type PartnerApplicationController,
  usePartnerApplicationState,
} from '../use-partner-application-state';
import { validatePartnerApplicationStep } from '../validate-partner-application-step';
import { PartnerApplicationSuccess } from './PartnerApplicationSuccess';
import { CommercialsStep } from './steps/CommercialsStep';
import { ExpertiseStep } from './steps/ExpertiseStep';
import { IdentityStep } from './steps/IdentityStep';
import { ProfileStep } from './steps/ProfileStep';

const COPY = PARTNER_APPLICATION_COPY;
const STEPS = PARTNER_APPLICATION_STEP_IDS;

const WizardRoot = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const IntroGroup = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const HeaderStrip = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const HeaderLabel = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  text-transform: uppercase;
`;

const FieldsStack = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const SecondaryButton = styled.button`
  background: none;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  height: ${spacing(10)};
  padding: 0 ${spacing(4)};
  text-transform: uppercase;
`;

const FooterControls = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ErrorBanner = styled.p`
  color: ${color('error')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
`;

function StepRenderer({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  switch (getCurrentStepId(controller.state)) {
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

export function PartnerApplicationWizard({
  onSubmitted,
  onSuccess,
  resetSignal,
}: {
  onSubmitted?: () => void;
  onSuccess: () => void;
  resetSignal: number;
}) {
  const { i18n } = useLingui();
  const controller = usePartnerApplicationState();
  const {
    goBack,
    goNext,
    reset,
    setSubmitError,
    setSubmitted,
    setSubmitting,
    state,
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
    ? COPY.validation.invalidEmail
    : errorValues.includes('invalid_url')
      ? COPY.validation.invalidUrl
      : errorValues.includes('invalid_amount')
        ? COPY.validation.invalidAmount
        : COPY.validation.incompleteForm;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isLastStep) {
        goNext();
        return;
      }
      if (state.isSubmitting) return;

      if (Object.keys(validatePartnerApplicationStep(state)).length > 0) {
        goNext();
        return;
      }

      const payload = buildPartnerApplicationRequestBody(state);
      setSubmitError(null);
      setSubmitting(true);
      try {
        const response = await fetch('/api/partner-application', {
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
        if (!response.ok) {
          setSubmitError(i18n._(COPY.validation.submitFailed));
          return;
        }
        setSubmitted();
        onSubmitted?.();
      } catch {
        setSubmitError(i18n._(COPY.validation.submitFailed));
      } finally {
        setSubmitting(false);
      }
    },
    [
      goNext,
      i18n,
      isLastStep,
      onSubmitted,
      setSubmitError,
      setSubmitted,
      setSubmitting,
      state,
    ],
  );

  if (state.isSubmitted) {
    return (
      <PartnerApplicationSuccess
        company={state.company}
        email={state.email}
        name={state.name}
        onDismiss={onSuccess}
      />
    );
  }

  const stepLabel = `${i18n._(
    COPY.stepProgressLabel(stepIndex + 1, STEPS.length),
  )} · ${i18n._(COPY.stepHeaders[stepId])}`;

  return (
    <WizardRoot>
      <TitleBlock>
        {stepIndex === 0 ? (
          <IntroGroup>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(COPY.title)}
            </Heading>
            <Body muted size="md">
              {i18n._(COPY.subtitle)}
            </Body>
          </IntroGroup>
        ) : null}
        <HeaderStrip>
          <HeaderLabel>{stepLabel}</HeaderLabel>
          <StepIndicator activeStepIndex={stepIndex} stepCount={STEPS.length} />
        </HeaderStrip>
      </TitleBlock>

      <form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <FieldsStack>
          <StepRenderer controller={controller} />
          <Footer>
            {state.submitError !== null ? (
              <ErrorBanner role="alert">{state.submitError}</ErrorBanner>
            ) : null}
            {hasFieldErrors ? (
              <ErrorBanner role="alert">
                {i18n._(fieldErrorMessage)}
              </ErrorBanner>
            ) : null}
            <FooterControls>
              {stepIndex > 0 ? (
                <SecondaryButton onClick={goBack} type="button">
                  {i18n._(COPY.back)}
                </SecondaryButton>
              ) : (
                <span />
              )}
              <Button
                disabled={state.isSubmitting}
                label={
                  isLastStep
                    ? state.isSubmitting
                      ? i18n._(COPY.submitInFlight)
                      : i18n._(COPY.submit)
                    : i18n._(COPY.next)
                }
                type="submit"
                variant="filled"
              />
            </FooterControls>
          </Footer>
        </FieldsStack>
      </form>
    </WizardRoot>
  );
}
