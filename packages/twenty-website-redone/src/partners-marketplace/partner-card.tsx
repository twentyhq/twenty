'use client';

import { IconBrandLinkedin } from '@tabler/icons-react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { LocalizedLink } from '@/platform/i18n/localized-link';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';
import { Button, ExternalLink } from '@/ui';

import { isSafeHttpUrl } from './is-safe-http-url';
import { type MarketplacePartner } from './marketplace-partner';
import { PartnerAvatar } from './partner-avatar';
import { PartnerChipRow } from './partner-chip-row';
import { PartnerMoneyRow } from './partner-money-row';
import { PARTNER_SCOPE_LABELS } from './partner-scope-labels';
import { SERVED_GEO_LABELS } from './served-geo-labels';
import { SPOKEN_LANGUAGE_LABELS } from './spoken-language-labels';

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

  animation: partnerCardEnter 700ms ${EASING.standard} both;
  animation-delay: calc(var(--partner-card-index) * 90ms + 180ms);
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};
  isolation: isolate;
  padding: ${spacing(6)};
  position: relative;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
  will-change: transform;

  &:hover {
    border-color: ${semanticColor.lineStrong};
    box-shadow: ${SHADOW.card};
    transform: translateY(-2px);
  }

  ${REDUCED_MOTION} {
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
  gap: ${spacing(4)};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const NameRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
`;

const PartnerName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(6)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.02em;
  line-height: ${fontSize(7)};
  margin: 0;
`;

// The card's whole-surface link uses the "stretched link" pattern: an inline
// <a> on the name with an absolutely-positioned ::after that covers the
// entire <article>. Other anchors inside the card (LinkedIn icon, View
// profile) sit above this overlay via z-index, so each stays an independent
// click target without illegal nested <a> elements.
const NameLink = styled(LocalizedLink)`
  color: inherit;
  text-decoration: none;

  &::after {
    border-radius: ${radius(2)};
    content: '';
    inset: 0;
    position: absolute;
    z-index: 0;
  }

  &:focus-visible::after {
    outline: 2px solid ${semanticColor.ink};
    outline-offset: 4px;
  }
`;

const LinkedinIconLink = styled(ExternalLink)`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  position: relative;
  transition: color 0.2s ease;
  z-index: 1;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

const CountryEyebrow = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
  text-transform: uppercase;
`;

const Introduction = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: ${fontSize(5.5)};
  margin: 0;
  overflow: hidden;
`;

const Divider = styled.hr`
  background-color: ${semanticColor.line};
  border: 0;
  height: 1px;
  margin: 0;
  width: 100%;
`;

const ChipRows = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// The price row pins to the card bottom (margin-top: auto), so the button —
// its plain trailing sibling — sits right under it with the same gap on every
// card, regardless of how many lines the chip rows took. The flexible space
// lands above the price (between the chips and the price), not between the
// price and the button.
const MoneyRowPin = styled.div`
  margin-top: auto;
`;

const CtaWrapper = styled.div`
  display: flex;
  position: relative;
  z-index: 1;
`;

type PartnerCardProps = {
  partner: MarketplacePartner;
  index: number;
};

export function PartnerCard({ partner, index }: PartnerCardProps) {
  const { i18n } = useLingui();
  const headingId = `partner-card-heading-${partner.slug}`;
  const style: PartnerCardStyle = { '--partner-card-index': index };
  // Unprefixed; LocalizedLink (the name link) and the Button add the locale.
  const profileHref = `/partners/profile/${partner.slug}`;

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
              <NameLink href={profileHref}>{partner.name}</NameLink>
            </PartnerName>
            {linkedinSafe && (
              <LinkedinIconLink
                href={partner.linkedinUrl}
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

      <MoneyRowPin>
        <PartnerMoneyRow
          hourlyRateUsd={partner.hourlyRateUsd}
          projectBudgetMinUsd={partner.projectBudgetMinUsd}
        />
      </MoneyRowPin>

      <CtaWrapper>
        <Button
          href={profileHref}
          label={i18n._(msg`View profile`)}
          variant="filled"
        />
      </CtaWrapper>
    </CardArticle>
  );
}
