'use client';

import { ButtonShape } from '@/design-system/components/Button/ButtonShape';
import { Body, Heading, HeadingPart } from '@/design-system/components';
import { ArrowRightIcon } from '@/icons';
import { INFORMATIVE_ICONS } from '@/icons/informative';
import { LocalizedLink } from '@/lib/i18n';
import { usePartnerApplicationModal } from '@/sections/PartnerApplication';
import { WebGlMount } from '@/lib/visual-runtime';
import type { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards/types';
import { THREE_CARDS_VISUALS } from '@/sections/ThreeCards/visuals';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { ThreeCardsCardShape } from './CardShape';

const CARD_OUTLINE_COLOR = theme.colors.primary.border[20];
const CARD_DIVIDER_COLOR = theme.colors.primary.border[40];
const BENEFIT_SEPARATOR_COLOR = theme.colors.primary.border[10];
const PARTNER_ACTION_ICON_BUTTON_SIZE = 40;
const PARTNER_ACTION_ICON_SIZE = 18;
const BENEFIT_ICON_STROKE_WIDTH = 1.5;

const IllustrationCardContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  padding: ${theme.spacing(4)};
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(2)};
  isolation: isolate;
  min-width: 0;
  min-height: 0;
  height: 100%;
`;

const CardRule = styled.div`
  height: 0;
  border-top: 1px dotted ${CARD_DIVIDER_COLOR};
  width: 100%;
`;

const CardEmbed = styled.div`
  width: 100%;
  height: 240px;
  border: none;
  display: block;
  overflow: hidden;
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(2)};
`;

const CardFooter = styled.footer`
  align-items: center;
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  margin-top: auto;
`;

const FooterTrailingAction = styled.div`
  justify-self: end;
`;

const AttributionPipe = styled.span`
  display: block;
  width: 0;
  height: 21px;
  border-left: 1px solid ${CARD_DIVIDER_COLOR};
`;

const CardBodyCell = styled.div`
  align-self: start;
  min-width: 0;
`;

const CardLowerSection = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  min-width: 0;
`;

const BenefitList = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BenefitItem = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(2.5)};
  display: flex;
  padding: ${theme.spacing(2.5)} 0;
  width: 100%;

  &:not(:first-child) {
    border-top: 1px solid ${BENEFIT_SEPARATOR_COLOR};
  }
`;

const BenefitIconSlot = styled.span`
  color: ${theme.colors.highlight[100]};
  display: inline-flex;
  flex-shrink: 0;
`;

const benefitLabelClassName = css`
  display: block;
  overflow-wrap: anywhere;
  --color-text-muted: ${theme.colors.primary.text[80]};
`;

const simpleCardBodyClassName = css`
  && {
    --color-text-muted: ${theme.colors.primary.text[80]};
  }
`;

const PartnerActionRow = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(3)};
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
`;

const PartnerActionButton = styled.button`
  align-items: center;
  appearance: none;
  background: transparent;
  border: none;
  color: ${theme.colors.primary.text[80]};
  cursor: pointer;
  display: inline-flex;
  flex: 1;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  justify-content: flex-end;
  letter-spacing: 0.04em;
  line-height: ${theme.lineHeight(4)};
  margin: 0;
  min-height: ${PARTNER_ACTION_ICON_BUTTON_SIZE}px;
  padding: 0;
  text-align: right;
  text-transform: uppercase;
  transition: color 0.2s ease;

  &:is(:hover, :focus-visible),
  ${PartnerActionRow}:hover &,
  ${PartnerActionRow}:focus-within & {
    color: ${theme.colors.primary.text[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

const PartnerActionIconButton = styled.button`
  align-items: center;
  appearance: none;
  background: transparent;
  border: none;
  color: ${theme.colors.primary.text[80]};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  height: ${PARTNER_ACTION_ICON_BUTTON_SIZE}px;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  position: relative;
  transition:
    color 0.2s ease,
    transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: ${PARTNER_ACTION_ICON_BUTTON_SIZE}px;

  &:is(:hover, :focus-visible),
  ${PartnerActionRow}:hover &,
  ${PartnerActionRow}:focus-within & {
    color: ${theme.colors.primary.text[100]};
  }

  &:is(:hover, :focus-visible) [data-slot='partner-action-icon-hover-fill'],
  ${PartnerActionRow}:hover & [data-slot='partner-action-icon-hover-fill'],
  ${PartnerActionRow}:focus-within
    &
    [data-slot='partner-action-icon-hover-fill'] {
    transform: translateX(0);
  }

  &:hover,
  ${PartnerActionRow}:hover &,
  ${PartnerActionRow}:focus-within & {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const PartnerActionIconLink = styled(LocalizedLink)`
  align-items: center;
  appearance: none;
  background: transparent;
  border: none;
  color: ${theme.colors.primary.text[80]};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  height: ${PARTNER_ACTION_ICON_BUTTON_SIZE}px;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  position: relative;
  transition:
    color 0.2s ease,
    transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: ${PARTNER_ACTION_ICON_BUTTON_SIZE}px;
  text-decoration: none;

  &:is(:hover, :focus-visible),
  ${PartnerActionRow}:hover &,
  ${PartnerActionRow}:focus-within & {
    color: ${theme.colors.primary.text[100]};
  }

  &:is(:hover, :focus-visible) [data-slot='partner-action-icon-hover-fill'],
  ${PartnerActionRow}:hover & [data-slot='partner-action-icon-hover-fill'],
  ${PartnerActionRow}:focus-within
    &
    [data-slot='partner-action-icon-hover-fill'] {
    transform: translateX(0);
  }

  &:hover,
  ${PartnerActionRow}:hover &,
  ${PartnerActionRow}:focus-within & {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const PartnerActionIconHoverFill = styled.span`
  inset: 0;
  opacity: 0.05;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  transform: translateX(calc(-100% - ${theme.spacing(4)}));
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
`;

const PartnerActionIconGlyph = styled.span`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: relative;
  z-index: 1;
`;

function PartnerActionIconLinkButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <PartnerActionIconLink aria-label={label} href={href}>
      <ButtonShape
        fillColor="none"
        height={PARTNER_ACTION_ICON_BUTTON_SIZE}
        strokeColor={CARD_OUTLINE_COLOR}
      />
      <PartnerActionIconHoverFill data-slot="partner-action-icon-hover-fill">
        <ButtonShape
          fillColor={theme.colors.primary.text[100]}
          height={PARTNER_ACTION_ICON_BUTTON_SIZE}
          strokeColor="none"
        />
      </PartnerActionIconHoverFill>
      <PartnerActionIconGlyph>
        <ArrowRightIcon
          size={PARTNER_ACTION_ICON_SIZE}
          strokeColor="currentColor"
        />
      </PartnerActionIconGlyph>
    </PartnerActionIconLink>
  );
}

type IllustrationCardProps = {
  illustrationCard: ThreeCardsIllustrationCardType;
  variant?: 'shaped' | 'simple';
};

function PartnerProgramAction({
  label,
  programId,
}: {
  label: MessageDescriptor;
  programId: 'technology' | 'content' | 'solutions';
}) {
  const { i18n } = useLingui();
  const { openPartnerApplicationModal } = usePartnerApplicationModal();
  const translatedLabel = i18n._(label);

  const openModal = () => {
    openPartnerApplicationModal(programId);
  };

  return (
    <PartnerActionRow>
      <PartnerActionButton type="button" onClick={openModal}>
        {translatedLabel}
      </PartnerActionButton>
      <PartnerActionIconButton
        aria-label={translatedLabel}
        type="button"
        onClick={openModal}
      >
        <ButtonShape
          fillColor="none"
          height={PARTNER_ACTION_ICON_BUTTON_SIZE}
          strokeColor={CARD_OUTLINE_COLOR}
        />
        <PartnerActionIconHoverFill data-slot="partner-action-icon-hover-fill">
          <ButtonShape
            fillColor={theme.colors.primary.text[100]}
            height={PARTNER_ACTION_ICON_BUTTON_SIZE}
            strokeColor="none"
          />
        </PartnerActionIconHoverFill>
        <PartnerActionIconGlyph>
          <ArrowRightIcon
            size={PARTNER_ACTION_ICON_SIZE}
            strokeColor="currentColor"
          />
        </PartnerActionIconGlyph>
      </PartnerActionIconButton>
    </PartnerActionRow>
  );
}

export function IllustrationCard({
  illustrationCard,
  variant = 'shaped',
}: IllustrationCardProps) {
  const { i18n } = useLingui();
  const Visual = THREE_CARDS_VISUALS[illustrationCard.illustration];

  return (
    <IllustrationCardContainer>
      {variant === 'shaped' && (
        <ThreeCardsCardShape
          fillColor={theme.colors.primary.background[100]}
          strokeColor={CARD_OUTLINE_COLOR}
        />
      )}
      <Heading as="h3" size="xs" weight="medium">
        <HeadingPart fontFamily="sans">
          {i18n._(illustrationCard.heading)}
        </HeadingPart>
      </Heading>
      <CardRule />
      <CardEmbed>
        <WebGlMount>
          <Visual />
        </WebGlMount>
      </CardEmbed>
      <CardRule />
      <CardLowerSection>
        <CardBodyCell>
          <Body
            className={
              variant === 'simple' ? simpleCardBodyClassName : undefined
            }
            size="sm"
            weight="regular"
          >
            {i18n._(illustrationCard.body)}
          </Body>
        </CardBodyCell>

        {variant === 'simple' && illustrationCard.benefits?.length ? (
          <BenefitList>
            {illustrationCard.benefits.map((benefit, benefitIndex) => {
              const BenefitIcon = INFORMATIVE_ICONS[benefit.icon ?? 'check'];

              return (
                <BenefitItem key={benefitIndex}>
                  <BenefitIconSlot aria-hidden>
                    <BenefitIcon
                      color="currentColor"
                      size={16}
                      strokeWidth={BENEFIT_ICON_STROKE_WIDTH}
                    />
                  </BenefitIconSlot>
                  <Body
                    as="span"
                    className={benefitLabelClassName}
                    size="sm"
                    weight="regular"
                  >
                    {i18n._(benefit.text)}
                  </Body>
                </BenefitItem>
              );
            })}
          </BenefitList>
        ) : null}

        {variant === 'simple' &&
        illustrationCard.action?.kind === 'partnerApplication' ? (
          <PartnerProgramAction
            label={illustrationCard.action.label}
            programId={illustrationCard.action.programId}
          />
        ) : null}

        {illustrationCard.attribution && (
          <CardFooter>
            <Body size="xs" weight="medium">
              {i18n._(illustrationCard.attribution.role)}
            </Body>
            <AttributionPipe aria-hidden />
            <Body size="xs" weight="regular">
              {i18n._(illustrationCard.attribution.company)}
            </Body>
            {illustrationCard.caseStudySlug !== undefined ? (
              <FooterTrailingAction>
                <PartnerActionIconLinkButton
                  href={`/customers/${illustrationCard.caseStudySlug}`}
                  label="Read case study"
                />
              </FooterTrailingAction>
            ) : null}
          </CardFooter>
        )}
      </CardLowerSection>
    </IllustrationCardContainer>
  );
}
