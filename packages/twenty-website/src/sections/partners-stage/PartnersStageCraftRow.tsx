'use client';

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
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { cssVariableStyle } from '@/ui/css-variable-style';

import { describePartnersStagePartner } from './describe-partners-stage-partner';
import { PartnersStageMark } from './PartnersStageMark';

const Row = styled(LocalizedLink)`
  align-items: center;
  animation: partners-stage-craft-row-in ${DURATION.xl} ${EASING.standard}
    backwards;
  animation-delay: calc(var(--partners-stage-row-index) * 40ms);
  color: inherit;
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: auto minmax(0, 1fr);
  isolation: isolate;
  overflow: hidden;
  padding: ${spacing(4)} ${spacing(3)};
  position: relative;
  text-decoration: none;

  ${mediaUp('md')} {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: ${spacing(6)};
  }

  &::before {
    background-color: ${color('white-5')};
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-101%);
    transition: transform ${DURATION.md} ${EASING.standard};
    z-index: -1;
  }

  &:is(:hover, :focus-visible)::before {
    transform: translateX(0);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: -2px;
  }

  @keyframes partners-stage-craft-row-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;

    &::before {
      transition: none;
    }
  }
`;

const Logo = styled.span`
  display: inline-flex;
  transition: transform ${DURATION.md} ${EASING.spring};

  ${Row}:is(:hover, :focus-visible) & {
    transform: scale(1.06);
  }

  ${Row}:active & {
    transform: scale(0.97);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Text = styled.span`
  display: block;
  min-width: 0;
`;

const Name = styled.span`
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 22px;
`;

const Pitch = styled.span`
  color: ${semanticColor.inkMuted};
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Price over languages at the right; under the text on a phone.
const Facts = styled.span`
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(3)};
  grid-column: 2;
  line-height: 20px;
  min-width: 0;

  ${mediaUp('md')} {
    align-items: flex-end;
    flex-direction: column;
    gap: 0;
    grid-column: auto;
    max-width: 240px;
    text-align: right;
  }
`;

const Price = styled.span`
  color: ${semanticColor.ink};
  flex-shrink: 0;
  font-weight: ${FONT_WEIGHT.medium};
`;

const Languages = styled.span`
  color: ${semanticColor.inkMuted};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type PartnersStageCraftRowProps = {
  index: number;
  partner: MarketplacePartner;
};

export function PartnersStageCraftRow({
  index,
  partner,
}: PartnersStageCraftRowProps) {
  const { i18n } = useLingui();
  const { languageNames, languageValue, price } = describePartnersStagePartner(
    partner,
    i18n,
  );

  return (
    <Row
      href={`/partners/profile/${partner.slug}`}
      style={cssVariableStyle({
        '--partners-stage-row-index': Math.min(index, 12),
      })}
    >
      <Logo>
        <PartnersStageMark
          markUrl={partner.profilePictureUrl}
          name={partner.name}
          sizePx={40}
          tone="dark"
        />
      </Logo>
      <Text>
        <Name>{partner.name}</Name>
        <Pitch>{richTextExcerpt(partner.description)}</Pitch>
      </Text>
      <Facts>
        <Price>{price ?? '–'}</Price>
        <Languages title={languageNames.join(', ')}>{languageValue}</Languages>
      </Facts>
    </Row>
  );
}
