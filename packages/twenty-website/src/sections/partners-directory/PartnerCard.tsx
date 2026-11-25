'use client';

import { css } from '@linaria/core';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { richTextExcerpt } from '@/partners-marketplace/rich-text-excerpt';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body } from '@/ui';

import { describePartner } from './describe-partner';
import { PartnerMark } from './PartnerMark';
import { RegionMapPoint } from './RegionMapPoint';

// The case-study cards' white card on a muted section, and their hover
// (case-study-catalog/CaseStudyCard).
const Card = styled.article`
  background-color: ${color('white')};
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

// The partner's region: a still of the profile's globe in the region's card
// view (region-card-view.data.ts), in the region's colour, with the
// partner's place on it.
const Cover = styled.div`
  background-color: ${color('black')};
  border-bottom: 1px solid ${semanticColor.line};
  height: 160px;
  overflow: hidden;
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

// Half of the 40px logo sits on the band, as on the app cards. A white ring,
// the mark's own radius, keeps a dark logo apart from the dark map.
const Logo = styled.div`
  align-self: flex-start;
  border-radius: ${radius(1.5)};
  box-shadow: 0 0 0 ${spacing(1)} ${color('white')};
  display: flex;
  margin-top: calc(-1 * (${spacing(6)} + ${spacing(5)}));
  position: relative;
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
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
  const { languageNames, languageValue, price } = describePartner(
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
        <RegionMapPoint partner={partner} />
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
