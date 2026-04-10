'use client';

import {
  PARTNER_APPLICATION_MODAL_COPY,
  PARTNER_PROGRAM_OPTIONS,
  type PartnerProgramId,
} from '@/app/partner/_constants/partner-application-modal';
import { buttonBaseStyles } from '@/design-system/components/Button/BaseButton';
import { ButtonShape } from '@/design-system/components/Button/ButtonShape';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PANEL_BG = '#0c0c0c';

const Overlay = styled.div`
  align-items: center;
  backdrop-filter: blur(4px);
  background: rgba(28, 28, 28, 0.8);
  box-sizing: border-box;
  display: flex;
  inset: 0;
  justify-content: center;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};
  position: fixed;
  z-index: 300;
`;

const Panel = styled.div`
  background: ${PANEL_BG};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
  max-height: 100%;
  max-width: 100%;
  overflow-y: auto;
  padding-bottom: clamp(16px, 4vh, 40px);
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: clamp(12px, 2vh, 16px);
  position: relative;
  width: min(360px, 100%);

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: clamp(16px, 4vh, 40px);
    padding-left: ${theme.spacing(6)};
    padding-right: ${theme.spacing(6)};
    padding-top: clamp(16px, 4vh, 40px);
    width: min(902px, 100%);
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vh, 24px);
`;

const Title = styled.h2`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: clamp(${theme.font.size(12)}, 8vw, ${theme.font.size(15)});
  font-weight: ${theme.font.weight.light};
  line-height: 1.12;
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: clamp(${theme.font.size(15)}, 4vw, ${theme.font.size(20)});
    line-height: 1.05;
  }
`;

const TitleAccent = styled.span`
  display: block;
  font-family: ${theme.font.family.sans};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.04em;
`;

const Subtitle = styled.div`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};

  & p {
    margin: 0;
  }
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${theme.colors.secondary.border[10]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  flex: 1 1 0;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(3.5)};
  min-width: 0;
  padding-bottom: ${theme.spacing(1.5)};
  padding-left: ${theme.spacing(2)};
  padding-right: ${theme.spacing(2)};
  padding-top: ${theme.spacing(1.5)};

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

const TextInput = styled.input`
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  height: clamp(40px, 5.5vh, 56px);
  line-height: ${theme.lineHeight(5.5)};
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(3)};
  padding-top: ${theme.spacing(1)};
  width: 100%;

  &::placeholder {
    color: ${theme.colors.secondary.text[40]};
  }

  &:focus-visible {
    border-color: ${theme.colors.highlight[100]};
    outline: none;
  }
`;

const TextArea = styled.textarea`
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
  min-height: clamp(80px, 18vh, 185px);
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(3)};
  padding-top: ${theme.spacing(1)};
  resize: vertical;
  width: 100%;

  &::placeholder {
    color: ${theme.colors.secondary.text[40]};
  }

  &:focus-visible {
    border-color: ${theme.colors.highlight[100]};
    outline: none;
  }
`;

const Footnote = styled.p`
  color: ${theme.colors.secondary.text[40]};
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

const FooterBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
`;

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
`;

type PartnerApplicationModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PartnerApplicationModal({
  open,
  onClose,
}: PartnerApplicationModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [programId, setProgramId] = useState<PartnerProgramId>('technology');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleOverlayPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    const frame = window.requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(
          'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [open, onClose]);

  const handleDropdownBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
        setDropdownOpen(false);
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    },
    [],
  );

  if (!open) {
    return null;
  }

  const copy = PARTNER_APPLICATION_MODAL_COPY;

  return createPortal(
    <Overlay onPointerDown={handleOverlayPointerDown}>
      <Panel
        ref={panelRef}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
      >
        <TitleBlock>
          <Title id={titleId}>
            {copy.titleSerif}
            <TitleAccent>{copy.titleSans}</TitleAccent>
          </Title>
          <Subtitle>
            <p>{copy.subtitleLine1}</p>
            <p>{copy.subtitleLine2}</p>
          </Subtitle>
        </TitleBlock>

        <form onSubmit={handleSubmit}>
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
                      {PARTNER_PROGRAM_OPTIONS.find(
                        (option) => option.id === programId,
                      )?.label}
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

            <TextInput
              autoComplete="name"
              name="name"
              placeholder={copy.fields.name}
              required
              type="text"
            />

            <FieldRow>
              <TextInput
                autoComplete="email"
                name="email"
                placeholder={copy.fields.email}
                required
                type="email"
              />
              <TextInput
                autoComplete="organization"
                name="company"
                placeholder={copy.fields.company}
                required
                type="text"
              />
            </FieldRow>

            <TextInput
              name="website"
              placeholder={copy.fields.website}
              required
              type="text"
            />

            <TextInput
              name="opportunities"
              placeholder={copy.fields.opportunities}
              type="text"
            />

            <TextArea
              name="message"
              placeholder={`${copy.fields.messageLabel}\n\n${copy.fields.messageHint}`}
              required
            />

            <FooterBlock>
              <Footnote>{copy.footnote}</Footnote>
              <SubmitButton type="submit">
                <ButtonShape
                  fillColor={theme.colors.primary.background[100]}
                  strokeColor="none"
                />
                <SubmitLabel>{copy.submit}</SubmitLabel>
              </SubmitButton>
            </FooterBlock>
          </FormFields>
        </form>
      </Panel>
    </Overlay>,
    document.body,
  );
}
