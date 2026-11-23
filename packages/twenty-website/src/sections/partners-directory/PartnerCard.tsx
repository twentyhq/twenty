'use client';

import { css } from '@linaria/core';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { richTextExcerpt } from '@/partners-marketplace/rich-text-excerpt';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body } from '@/ui';

import { describePartner } from './describe-partner';
import { partnerBaseRegion } from './partner-base-region';
import { PartnerMark } from './PartnerMark';

// The case-study cards' hover (case-study-catalog/CaseStudyCard).
const Card = styled.article`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition:
    border-color ${DURATION.sm} ${EASING.standard},
    box-shadow ${DURATION.sm} ${EASING.standard},
    transform ${DURATION.sm} ${EASING.standard};

  &:is(:hover, :focus-within) {
    border-color: ${semanticColor.lineStrong};
    box-shadow: ${SHADOW.card};
    transform: translateY(-2px);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// The partner's region on the hero globe, rendered by the same halftone
// engine (public/images/partners/regions, one still per region).
const Cover = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  height: 160px;
  position: relative;
`;

const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${spacing(4)};
  min-width: 0;
  padding: ${spacing(6)};
`;

const Logo = styled.div`
  align-self: flex-start;
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

// The case-study cards' mono label.
const Regions = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

// The home cards' heading (three-cards): headingXs, sans, medium.
const Name = styled.h3`
  ${typeRampDeclarations('headingXs')}
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

// The whole card is the profile link's hit area.
const NameLink = styled(LocalizedLink)`
  color: inherit;
  text-decoration: none;

  &::after {
    content: '';
    inset: 0;
    position: absolute;
  }

  &:focus-visible::after {
    border-radius: ${radius(2)};
    outline: 1px solid ${color('blue')};
    outline-offset: -2px;
  }
`;

const pitchClampClassName = css`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

// Pinned to the bottom so the rules line up across a row.
const Facts = styled.div`
  align-items: baseline;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  ${typeRampDeclarations('bodyXs')}
  font-family: ${fontFamily('sans')};
  gap: ${spacing(4)};
  justify-content: space-between;
  margin-top: auto;
  padding-top: ${spacing(4)};
`;

const Price = styled.span`
  color: ${semanticColor.ink};
  flex-shrink: 0;
  font-weight: ${FONT_WEIGHT.medium};
`;

const Languages = styled.span`
  color: ${semanticColor.inkMuted};
  min-width: 0;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type PartnerCardProps = {
  partner: MarketplacePartner;
};

export function PartnerCard({ partner }: PartnerCardProps) {
  const { i18n } = useLingui();
  const headingId = `partners-cell-${partner.slug}`;
  const { regionLine, languageNames, languageValue, price } = describePartner(
    partner,
    i18n,
  );

  return (
    <Card
      aria-labelledby={headingId}
      data-partners-cell=""
      id={`partner-${partner.slug}`}
    >
      <Cover aria-hidden>
        <NextImage
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          src={`/images/partners/regions/${partnerBaseRegion(partner).toLowerCase()}.webp`}
          style={{ objectFit: 'cover' }}
        />
      </Cover>
      <Content>
        <Logo>
          <PartnerMark
            markUrl={partner.profilePictureUrl}
            name={partner.name}
            sizePx={40}
          />
        </Logo>
        <Text>
          {regionLine.length > 0 && <Regions>{regionLine}</Regions>}
          <Name id={headingId}>
            <NameLink href={`/partners/profile/${partner.slug}`}>
              {partner.name}
            </NameLink>
          </Name>
          <Body className={pitchClampClassName} muted size="sm">
            {richTextExcerpt(partner.description)}
          </Body>
        </Text>
        <Facts>
          <Price>{price ?? '–'}</Price>
          <Languages title={languageNames.join(', ')}>
            {languageValue}
          </Languages>
        </Facts>
      </Content>
    </Card>
  );
}
