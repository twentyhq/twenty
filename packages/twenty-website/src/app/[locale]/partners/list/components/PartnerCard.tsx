'use client';

import { IconBrandLinkedin } from '@tabler/icons-react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextLink from 'next/link';
import type { CSSProperties } from 'react';

import type { MarketplacePartner } from '@/lib/partners-api';
import { PartnerAvatar } from './PartnerAvatar';
import { PartnerChipRow } from './PartnerChipRow';
import { PartnerMoneyRow } from './PartnerMoneyRow';
import {
  PARTNER_SCOPE_LABELS,
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
  isolation: isolate;
  padding: ${theme.spacing(6)};
  position: relative;
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

const NameRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(2)};
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

// The card's whole-surface link uses the "stretched link" pattern: an inline
// <a> on the name with an absolutely-positioned ::after that covers the
// entire <article>. Other anchors inside the card (LinkedIn icon, Book-a-call)
// sit above this overlay via z-index, so each remains an independent click
// target without illegal nested <a> elements.
const NameLink = styled(NextLink)`
  color: inherit;
  text-decoration: none;

  &::after {
    border-radius: ${theme.radius(2)};
    content: '';
    inset: 0;
    position: absolute;
    z-index: 0;
  }

  &:focus-visible::after {
    outline: 2px solid ${theme.colors.primary.text[100]};
    outline-offset: 4px;
  }
`;

const LinkedinIconLink = styled.a`
  align-items: center;
  color: ${theme.colors.primary.text[60]};
  display: inline-flex;
  position: relative;
  transition: color 0.2s ease;
  z-index: 1;

  &:hover {
    color: ${theme.colors.primary.text[100]};
  }
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
  position: relative;
  z-index: 1;
`;

// Internal, same-tab navigation to the partner profile. Mirrors NameLink's
// explicit locale-prefixed href (rather than LocalizedLink's context lookup)
// so the card stays self-contained and testable with just the lingui provider.
const ProfileCtaLink = styled(NextLink)`
  ${buttonBaseStyles}
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
  locale: string;
};

export function PartnerCard({ partner, index, locale }: PartnerCardProps) {
  const { i18n } = useLingui();
  const headingId = `partner-card-heading-${partner.slug}`;
  const style: PartnerCardStyle = { '--partner-card-index': index };

  const firstGeo = partner.region[0];
  const countryLine = firstGeo
    ? i18n._(SERVED_GEO_LABELS[firstGeo]).toUpperCase()
    : '';

  const linkedinSafe = isSafeHttpUrl(partner.linkedinUrl);

  return (
    <CardArticle aria-labelledby={headingId} style={style}>
      <CardHeader>
        <PartnerAvatar
          name={partner.name}
          slug={partner.slug}
          profilePictureUrl={partner.profilePictureUrl}
        />
        <HeaderText>
          <NameRow>
            <PartnerName id={headingId}>
              <NameLink href={`/${locale}/partners/profile/${partner.slug}`}>
                {partner.name}
              </NameLink>
            </PartnerName>
            {linkedinSafe && (
              <LinkedinIconLink
                href={partner.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={i18n._(msg`View ${partner.name} on LinkedIn`)}
              >
                <IconBrandLinkedin size={16} aria-hidden="true" />
              </LinkedinIconLink>
            )}
          </NameRow>
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
          label={msg`Categories`}
          values={partner.partnerScope}
          valueLabels={PARTNER_SCOPE_LABELS}
        />
      </ChipRows>

      <PartnerMoneyRow
        hourlyRateUsd={partner.hourlyRateUsd}
        projectBudgetMinUsd={partner.projectBudgetMinUsd}
      />

      <CtaWrapper>
        <ProfileCtaLink
          data-color="secondary"
          data-size="regular"
          data-variant="contained"
          href={`/${locale}/partners/profile/${partner.slug}`}
        >
          <BaseButton
            color="secondary"
            label={i18n._(msg`View profile`)}
            variant="contained"
          />
        </ProfileCtaLink>
      </CtaWrapper>
    </CardArticle>
  );
}
