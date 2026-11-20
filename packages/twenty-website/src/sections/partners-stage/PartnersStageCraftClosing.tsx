import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { CustomerCasesCover } from '@/case-studies';
import { ArrowRight } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
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
import { SectionShell, Signoff } from '@/ui';

import { CONTAINER_COLUMN } from '@/ui/container-column';

// The site's Signoff for the clients' closing call
// to action, over the footer's dashed logo as on /apps. Under it, one way out
// for agencies and freelancers: a /customers wide card to the integrator
// program, the whole card the link.
const Column = styled.div`
  padding-bottom: ${spacing(20)};
  ${CONTAINER_COLUMN}

  ${mediaUp('md')} {
    padding-bottom: ${spacing(30)};
  }
`;

// The /customers wide card: text on one side, a halftone cover on the other
// (the partners' hero photo, in the brand blue). The whole card is the link.
const OfferCard = styled(LocalizedLink)`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column-reverse;
  isolation: isolate;
  overflow: hidden;
  position: relative;
  text-decoration: none;

  ${mediaUp('md')} {
    flex-direction: row;
    min-height: 320px;
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

  ${REDUCED_MOTION} {
    &::before {
      transition: none;
    }
  }
`;

const OfferText = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
  padding: ${spacing(8)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    flex-basis: 50%;
    padding: ${spacing(12)} ${spacing(10)};
  }
`;

const OfferTitle = styled.span`
  color: ${semanticColor.ink};
  display: block;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(7)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.02em;
  line-height: 1.2;
  max-width: 460px;

  ${mediaUp('md')} {
    font-size: ${fontSize(8)};
  }
`;

const OfferLink = styled.span`
  align-items: center;
  color: ${semanticColor.ink};
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(3)};
  letter-spacing: 0.08em;
  text-transform: uppercase;

  & > svg {
    transition: transform ${DURATION.xs} ${EASING.standard};
  }

  ${OfferCard}:is(:hover, :focus-visible) & > svg {
    transform: translateX(3px);
  }

  ${REDUCED_MOTION} {
    & > svg {
      transition: none;
    }
  }
`;

const OfferCover = styled.div`
  background-color: ${color('black')};
  border-bottom: 1px solid ${semanticColor.line};
  flex: none;
  height: 200px;
  position: relative;

  ${mediaUp('md')} {
    flex: 1 1 50%;
    border-bottom: none;
    border-left: 1px solid ${semanticColor.line};
    height: auto;
  }
`;

type PartnersStageCraftClosingProps = {
  action: ReactNode;
  // The footer's dashed logo, passed in by the page (sections don't import
  // each other).
  backdrop?: ReactNode;
};

export function PartnersStageCraftClosing({
  action,
  backdrop,
}: PartnersStageCraftClosingProps) {
  const i18n = getServerI18n();

  return (
    <>
      <Signoff
        backdrop={backdrop}
        body={i18n._(
          msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
        )}
        heading={i18n._(msg`Didn't find the *right partner*?`)}
        scheme="dark"
      >
        {action}
      </Signoff>
      <SectionShell flushInline rhythm="flush" scheme="dark">
        <Column>
          <OfferCard href="/partners/integrators">
            <OfferText>
              <OfferTitle>
                {i18n._(
                  msg`Agencies and freelancers who implement Twenty can join as integrators.`,
                )}
              </OfferTitle>
              <OfferLink>
                {i18n._(msg`Learn more about the integrator program`)}
                <ArrowRight />
              </OfferLink>
            </OfferText>
            <OfferCover aria-hidden>
              <CustomerCasesCover
                accent="blue"
                imageUrl="/images/partners/hero/partners-hero.webp"
              />
            </OfferCover>
          </OfferCard>
        </Column>
      </SectionShell>
    </>
  );
}
