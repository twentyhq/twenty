'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { LinkButton } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties } from 'react';

import type { MarketplacePartner } from '@/lib/partners-api';
import { PartnerAvatar } from './PartnerAvatar';
import { PartnerChipRow } from './PartnerChipRow';
import {
  DEPLOYMENT_EXPERTISE_LABELS,
  SERVED_GEO_LABELS,
  SPOKEN_LANGUAGE_LABELS,
} from './chip-labels';

type PartnerCardStyle = CSSProperties & {
  '--partner-card-index': number;
};

const CardArticle = styled.article`
  @keyframes partnerCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: partnerCardEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--partner-card-index) * 90ms + 180ms);
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(5)};
  padding: ${theme.spacing(6)};
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
  will-change: transform;

  &:hover {
    border-color: ${theme.colors.primary.border[20]};
    box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(4)};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  min-width: 0;
`;

const PartnerName = styled.h3`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.02em;
  line-height: ${theme.lineHeight(7)};
  margin: 0;
`;

const CountryEyebrow = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(4)};
  text-transform: uppercase;
`;

const Introduction = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${theme.colors.primary.text[60]};
  display: -webkit-box;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: ${theme.lineHeight(5.5)};
  margin: 0;
  overflow: hidden;
`;

const Divider = styled.hr`
  background-color: ${theme.colors.primary.border[10]};
  border: 0;
  height: 1px;
  margin: 0;
  width: 100%;
`;

const ChipRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
`;

const CtaWrapper = styled.div`
  display: flex;
  margin-top: auto;
`;

const isSafeHttpUrl = (raw: string) => {
  try {
    return ['https:', 'http:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
};

type PartnerCardProps = {
  partner: MarketplacePartner;
  index: number;
};

export function PartnerCard({ partner, index }: PartnerCardProps) {
  const { i18n } = useLingui();
  const headingId = `partner-card-heading-${partner.slug}`;
  const style: PartnerCardStyle = { '--partner-card-index': index };

  const firstGeo = partner.region[0];
  const countryLine = firstGeo
    ? i18n._(SERVED_GEO_LABELS[firstGeo]).toUpperCase()
    : '';

  return (
    <CardArticle aria-labelledby={headingId} style={style}>
      <CardHeader>
        <PartnerAvatar name={partner.name} slug={partner.slug} />
        <HeaderText>
          <PartnerName id={headingId}>{partner.name}</PartnerName>
          <CountryEyebrow>{countryLine}</CountryEyebrow>
        </HeaderText>
      </CardHeader>

      <Introduction>{partner.introduction}</Introduction>

      <Divider aria-hidden="true" />

      <ChipRows>
        <PartnerChipRow
          label={msg`Regions`}
          values={partner.region}
          valueLabels={SERVED_GEO_LABELS}
        />
        <PartnerChipRow
          label={msg`Languages`}
          values={partner.languagesSpoken}
          valueLabels={SPOKEN_LANGUAGE_LABELS}
        />
        <PartnerChipRow
          label={msg`Deploys`}
          values={partner.deploymentExpertise}
          valueLabels={DEPLOYMENT_EXPERTISE_LABELS}
        />
      </ChipRows>

      {isSafeHttpUrl(partner.calendarLink) && (
        <CtaWrapper>
          <LinkButton
            color="secondary"
            href={partner.calendarLink}
            label={i18n._(msg`Book a call`)}
            variant="contained"
          />
        </CtaWrapper>
      )}
    </CardArticle>
  );
}
