import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Eyebrow, Heading, SectionIntro, SectionShell } from '@/ui';

import { CREATOR_AUDIENCES } from './creator-audiences.data';
import { CreatorReveal } from './CreatorReveal';

// The home's cursor-label colours, one per card, never one colour per page.
const TAG_COLORS = ['green', 'pink', 'yellow', 'green'] as const;

const Block = styled.div`
  border-top: 1px solid ${semanticColor.line};
  padding-top: ${spacing(10)};

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    padding-top: ${spacing(14)};

    & > * + * {
      margin-top: ${spacing(12)};
    }
  }
`;

const HeadingMeasure = styled.div`
  max-width: 640px;
`;

const Cards = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  padding: 0;

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

// The /apps card: a hairline frame, a flat fill sliding in from the left on
// hover, a staggered rise when the grid scrolls in.
const Card = styled.li`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  isolation: isolate;
  opacity: 0;
  overflow: hidden;
  padding: ${spacing(6)};
  position: relative;
  transform: translateY(12px);
  transition:
    opacity ${DURATION.xl} ${EASING.standard},
    transform ${DURATION.xl} ${EASING.standard};
  transition-delay: calc(var(--creator-card-index) * 80ms);

  & > * + * {
    margin-top: ${spacing(2)};
  }

  & > * + h3 {
    margin-top: ${spacing(8)};
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

  &:hover::before {
    transform: translateX(0);
  }

  [data-revealed] & {
    opacity: 1;
    transform: none;
  }

  ${REDUCED_MOTION} {
    opacity: 1;
    transform: none;
    transition: none;

    &::before {
      transition: none;
    }
  }
`;

const Tag = styled.span`
  border-radius: ${radius(1)};
  color: ${color('black')};
  display: inline-block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  line-height: 18px;
  padding: 0 ${spacing(1.5)};

  &[data-tone='green'] {
    background-color: ${color('green')};
  }

  &[data-tone='pink'] {
    background-color: ${color('pink')};
  }

  &[data-tone='yellow'] {
    background-color: ${color('yellow')};
  }
`;

const AudienceTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 24px;
`;

// PROTOTYPE who the program is for, as /apps cards.
export function CreatorAudiences() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <Block>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Who it's for`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="md" weight="light">
              {i18n._(msg`People that teams trust *to pick their tools*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <CreatorReveal>
          <Cards>
            {CREATOR_AUDIENCES.map((audience, index) => (
              <Card
                key={audience.model}
                style={{ '--creator-card-index': index } as CSSProperties}
              >
                <Tag aria-hidden data-tone={TAG_COLORS[index]}>
                  {String(index + 1).padStart(2, '0')}
                </Tag>
                <AudienceTitle>{i18n._(audience.title)}</AudienceTitle>
                <Body muted size="sm">
                  {i18n._(audience.body)}
                </Body>
              </Card>
            ))}
          </Cards>
        </CreatorReveal>
      </Block>
    </SectionShell>
  );
}
