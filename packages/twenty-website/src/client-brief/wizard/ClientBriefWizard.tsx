'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type FormEvent, useCallback } from 'react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Button, Heading, StepIndicator } from '@/ui';

import { buildClientBriefRequestBody } from '../build-client-brief-request-body';
import { CLIENT_BRIEF_COPY } from '../client-brief-copy';
import { CLIENT_BRIEF_STEP_IDS } from '../data/client-brief-step-ids';
import { getCurrentStepId } from '../get-current-step-id';
import {
  type ClientBriefController,
  useClientBriefState,
} from '../use-client-brief-state';
import { validateClientBriefStep } from '../validate-client-brief-step';
import { ClientBriefSuccess } from './ClientBriefSuccess';
import { BriefStep } from './steps/BriefStep';
import { ContextStep } from './steps/ContextStep';
import { IdentityStep } from './steps/IdentityStep';

const COPY = CLIENT_BRIEF_COPY;
const STEPS = CLIENT_BRIEF_STEP_IDS;

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
  gap: ${spacing(2)};
  justify-content: space-between;
  width: 100%;
`;

const FooterActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
`;

const ErrorBanner = styled.p`
  color: ${color('error')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
`;

function StepRenderer({ controller }: { controller: ClientBriefController }) {
  switch (getCurrentStepId(controller.state)) {
    case 'brief':
      return <BriefStep controller={controller} />;
    case 'context':
      return <ContextStep controller={controller} />;
    case 'identity':
      return <IdentityStep controller={controller} />;
  }
}

export function ClientBriefWizard() {
  const { i18n } = useLingui();
  const controller = useClientBriefState();
  const {
    goBack,
    goNext,
    setFieldErrors,
    setSubmitError,
    setSubmitted,
    setSubmitting,
    skipContext,
    state,
  } = controller;

  const stepId = getCurrentStepId(state);
  const stepIndex = state.stepIndex;
  const isLastStep = stepIndex === STEPS.length - 1;
  const isContextStep = stepId === 'context';
  const errorValues = Object.values(state.fieldErrors);
  const hasFieldErrors = errorValues.length > 0;
  const fieldErrorMessage = errorValues.includes('invalid_email')
    ? COPY.validation.invalidEmail
    : COPY.validation.incompleteForm;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isLastStep) {
        goNext();
        return;
      }
      if (state.isSubmitting) return;

      setSubmitError(null);

      const errors = validateClientBriefStep(state);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      const payload = buildClientBriefRequestBody(state);
      setSubmitting(true);
      try {
        const response = await fetch('/api/client-brief', {
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
        if (!response.ok) {
          setSubmitError(i18n._(COPY.validation.submitFailed));
          return;
        }
        setSubmitted();
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
      setFieldErrors,
      setSubmitError,
      setSubmitted,
      setSubmitting,
      state,
    ],
  );

  if (state.isSubmitted) {
    return <ClientBriefSuccess />;
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
              <FooterActions>
                {isContextStep ? (
                  <SecondaryButton onClick={skipContext} type="button">
                    {i18n._(COPY.skip)}
                  </SecondaryButton>
                ) : null}
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
              </FooterActions>
            </FooterControls>
          </Footer>
        </FieldsStack>
      </form>
    </WizardRoot>
  );
}
