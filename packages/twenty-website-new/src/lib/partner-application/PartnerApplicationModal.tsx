'use client';

import { Body, Form, Heading, Modal } from '@/design-system/components';
import {
  BUTTON_HEIGHTS_PX,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { ButtonShape } from '@/design-system/components/Button/ButtonShape';
import {
  PARTNER_APPLICATION_MODAL_COPY,
  PARTNER_PROGRAM_OPTIONS,
  type PartnerProgramId,
} from '@/lib/partner-application/partner-application-modal-data';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const partnerPanelClass = css`
  --modal-panel-width: min(360px, 100%);

  @media (min-width: ${theme.breakpoints.md}px) {
    --modal-panel-width: min(902px, 100%);
  }
`;

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

const Segments = styled.div`
  display: none;
  gap: ${theme.spacing(4)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
  }
`;

const SegmentButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${theme.colors.secondary.border[10]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  display: flex;
  flex: 1 1 0;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  height: clamp(40px, 5.5vh, 56px);
  justify-content: center;
  line-height: ${theme.lineHeight(3.5)};
  min-width: 0;
  padding-left: ${theme.spacing(2)};
  padding-right: ${theme.spacing(2)};

  &[data-active='true'] {
    background: ${theme.colors.primary.background[100]};
    color: ${theme.colors.primary.text[100]};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

const MobileProgramField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: none;
  }
`;

const DropdownRoot = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownTrigger = styled.button`
  align-items: center;
  background: ${theme.colors.secondary.background[100]};
  border: 1px solid ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  height: clamp(40px, 5.5vh, 56px);
  justify-content: space-between;
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(1)};
  width: 100%;

  &:focus-visible {
    outline: 2px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

const DropdownTriggerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DropdownLabel = styled.span`
  color: ${theme.colors.secondary.text[40]};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4)};
  text-align: left;
`;

const DropdownValue = styled.span`
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
  text-align: left;
`;

const DropdownIconContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 48px;
  justify-content: center;
  width: 48px;
`;

const DropdownPanel = styled.div`
  background: ${theme.colors.secondary.background[100]};
  border: 1px solid ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(2)};
  box-shadow: 0 0 16px 0 rgba(15, 15, 15, 0.25);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  left: 0;
  margin-top: ${theme.spacing(2)};
  overflow: hidden;
  padding: ${theme.spacing(1)};
  position: absolute;
  right: 0;
  z-index: 1;
`;

const DropdownOption = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${theme.radius(1)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
  padding-bottom: ${theme.spacing(3)};
  padding-left: ${theme.spacing(2)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(3)};
  text-align: left;
  width: 100%;

  &[data-selected='true'] {
    background: rgba(74, 56, 245, 0.3);
  }

  &:hover {
    background: rgba(74, 56, 245, 0.15);
  }

  &[data-selected='true']:hover {
    background: rgba(74, 56, 245, 0.3);
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.highlight[100]};
    outline-offset: -2px;
  }
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: row;
    gap: ${theme.spacing(6)};
  }
`;

const SubmitError = styled.p`
  color: #ff9a9a;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(3.5)};
  margin: 0;
`;

const SubmitButton = styled.button`
  ${buttonBaseStyles}
  position: relative;
  width: 100%;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const SubmitLabel = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  position: relative;
  text-transform: uppercase;
  z-index: 1;
`;

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
`;

type PartnerApplicationModalProps = {
  open: boolean;
  onClose: () => void;
  initialProgramId?: PartnerProgramId;
};

export function PartnerApplicationModal({
  open,
  onClose,
  initialProgramId = 'technology',
}: PartnerApplicationModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [programId, setProgramId] =
    useState<PartnerProgramId>(initialProgramId);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setProgramId(initialProgramId);
    }
  }, [open, initialProgramId]);

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      return;
    }

    formRef.current?.reset();
    setProgramId('technology');
    setDropdownOpen(false);
    setSubmitError(null);
    setIsSubmitting(false);
  }, [open]);

  const handleDropdownBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
        setDropdownOpen(false);
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const formData = new FormData(event.currentTarget);

      const nameValue = formData.get('name');
      const emailValue = formData.get('email');
      const companyValue = formData.get('company');
      const websiteValue = formData.get('website');
      const messageValue = formData.get('message');
      const opportunitiesValue = formData.get('opportunities');

      const name = typeof nameValue === 'string' ? nameValue.trim() : '';
      const email = typeof emailValue === 'string' ? emailValue.trim() : '';
      const company =
        typeof companyValue === 'string' ? companyValue.trim() : '';
      const website =
        typeof websiteValue === 'string' ? websiteValue.trim() : '';
      const message =
        typeof messageValue === 'string' ? messageValue.trim() : '';
      const opportunities =
        typeof opportunitiesValue === 'string' ? opportunitiesValue.trim() : '';

      const validationCopy = PARTNER_APPLICATION_MODAL_COPY.validation;
      const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      setSubmitError(null);

      if (!name || !email || !company || !website || !message) {
        setSubmitError(validationCopy.incompleteForm);
        return;
      }

      if (!emailLooksValid) {
        setSubmitError(validationCopy.invalidEmail);
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch('/api/partner-application', {
          body: JSON.stringify({
            email,
            name,
            company,
            website,
            message,
            programId,
            ...(opportunities !== '' && { opportunities }),
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        if (!response.ok) {
          setSubmitError(validationCopy.submitFailed);
          return;
        }

        onClose();
      } catch {
        setSubmitError(validationCopy.submitFailed);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onClose, programId],
  );

  const copy = PARTNER_APPLICATION_MODAL_COPY;

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      className={partnerPanelClass}
    >
      <TitleBlock>
        <Modal.Title
          render={
            <TitleHeadingWrapper>
              <Heading
                as="h2"
                segments={[
                  {
                    fontFamily: 'serif',
                    text: copy.titleSerif,
                    fontWeight: 'light',
                  },
                  {
                    fontFamily: 'sans',
                    text: copy.titleSans,
                    fontWeight: 'light',
                    newLine: true,
                  },
                ]}
                size="lg"
                weight="light"
              />
            </TitleHeadingWrapper>
          }
        />
        <Modal.Description
          render={
            <SubtitleStack>
              <Body body={{ text: copy.subtitleLine1 }} size="md" />
              <Body body={{ text: copy.subtitleLine2 }} size="md" />
            </SubtitleStack>
          }
        />
      </TitleBlock>

      <form ref={formRef} autoComplete="off" noValidate onSubmit={handleSubmit}>
        <FormFields>
          <Segments role="radiogroup" aria-label={copy.selectLabel}>
            {PARTNER_PROGRAM_OPTIONS.map((option) => (
              <SegmentButton
                key={option.id}
                aria-checked={programId === option.id}
                data-active={programId === option.id}
                role="radio"
                type="button"
                onClick={() => {
                  setProgramId(option.id);
                }}
              >
                {option.label}
              </SegmentButton>
            ))}
          </Segments>

          <MobileProgramField>
            <DropdownRoot ref={dropdownRef} onBlur={handleDropdownBlur}>
              <DropdownTrigger
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                aria-label={copy.selectLabel}
                type="button"
                onClick={() => {
                  setDropdownOpen((previous) => !previous);
                }}
              >
                <DropdownTriggerContent>
                  <DropdownLabel>{copy.selectLabel}</DropdownLabel>
                  <DropdownValue>
                    {
                      PARTNER_PROGRAM_OPTIONS.find(
                        (option) => option.id === programId,
                      )?.label
                    }
                  </DropdownValue>
                </DropdownTriggerContent>
                <DropdownIconContainer aria-hidden>
                  <IconChevronDown size={20} stroke={1.5} />
                </DropdownIconContainer>
              </DropdownTrigger>

              {dropdownOpen && (
                <DropdownPanel role="listbox" aria-label={copy.selectLabel}>
                  {PARTNER_PROGRAM_OPTIONS.map((option) => (
                    <DropdownOption
                      key={option.id}
                      aria-selected={programId === option.id}
                      data-selected={programId === option.id}
                      role="option"
                      type="button"
                      onClick={() => {
                        setProgramId(option.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </DropdownOption>
                  ))}
                </DropdownPanel>
              )}
            </DropdownRoot>
          </MobileProgramField>

          <Form.Field>
            <Form.Input
              aria-required="true"
              autoComplete="off"
              name="name"
              placeholder={copy.fields.name}
              type="text"
            />
          </Form.Field>

          <FieldRow>
            <Form.Field>
              <Form.Input
                aria-required="true"
                autoComplete="off"
                inputMode="email"
                name="email"
                placeholder={copy.fields.email}
                type="text"
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                aria-required="true"
                autoComplete="off"
                name="company"
                placeholder={copy.fields.company}
                type="text"
              />
            </Form.Field>
          </FieldRow>

          <Form.Field>
            <Form.Input
              aria-required="true"
              autoComplete="off"
              name="website"
              placeholder={copy.fields.website}
              type="text"
            />
          </Form.Field>

          <Form.Field>
            <Form.Input
              autoComplete="off"
              name="opportunities"
              placeholder={copy.fields.opportunities}
              type="text"
            />
          </Form.Field>

          <Form.Field>
            <Form.Textarea
              aria-required="true"
              autoComplete="off"
              name="message"
              placeholder={`${copy.fields.messageLabel}\n\n${copy.fields.messageHint}`}
            />
          </Form.Field>

          <Modal.Footer>
            {submitError ? (
              <SubmitError role="alert">{submitError}</SubmitError>
            ) : null}
            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              <ButtonShape
                fillColor={theme.colors.primary.background[100]}
                height={BUTTON_HEIGHTS_PX.regular}
                strokeColor="none"
              />
              <SubmitLabel>
                {isSubmitting ? copy.submitInFlight : copy.submit}
              </SubmitLabel>
            </SubmitButton>
          </Modal.Footer>
        </FormFields>
      </form>
    </Modal.Root>
  );
}
