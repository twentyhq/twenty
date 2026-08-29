'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  color,
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

import { CaseStudyModal } from './CaseStudyModal';
import { CaseStudyVisual } from './CaseStudyVisual';
import { CaseStudyVisualHover } from './CaseStudyVisualHover';
import { CaseStudyPlaceholder } from './CaseStudyPlaceholder';
import { isSafeHttpUrl } from './is-safe-http-url';
import { type PartnerCaseStudy } from './marketplace-partner';
import { ProfileSectionTitle } from './ProfileSectionTitle';
import { richTextExcerpt } from './rich-text-excerpt';

const Section = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const CasesList = styled.div`
  display: grid;
  gap: ${spacing(3.5)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const CaseCard = styled.button`
  animation: caseCardEnter 0.55s ${EASING.standard} both;
  appearance: none;
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0;
  text-align: left;
  transition:
    border-color 0.22s ${EASING.standard},
    box-shadow 0.22s ${EASING.standard},
    transform 0.22s ${EASING.standard};
  width: 100%;

  &:nth-child(1) {
    animation-delay: 0ms;
  }

  &:nth-child(2) {
    animation-delay: 70ms;
  }

  &:nth-child(3) {
    animation-delay: 140ms;
  }

  &:nth-child(4) {
    animation-delay: 210ms;
  }

  @keyframes caseCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 14px, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  &[data-layout='featured'] {
    ${mediaUp('md')} {
      align-items: stretch;
      flex-direction: row;
      grid-column: 1 / -1;
    }
  }

  &[data-layout='featured'] ${CaseStudyVisualHover} {
    ${mediaUp('md')} {
      align-self: stretch;
      flex-shrink: 0;
      max-width: 46%;
      width: 46%;
    }
  }

  &[data-layout='featured'] [data-size='card'],
  &[data-layout='featured'] ${CaseStudyVisualHover} > div {
    ${mediaUp('md')} {
      aspect-ratio: auto;
      height: 100%;
      min-height: ${spacing(52)};
    }
  }

  &:hover {
    border-color: ${color('blue')}44;
    box-shadow:
      0 16px 40px ${color('black-10')},
      0 0 0 1px ${color('blue')}18;
    transform: translateY(-3px);
  }

  &:focus-visible {
    outline: 2px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    animation: none;
    transition: none;

    &:hover {
      box-shadow: none;
      transform: none;
    }
  }
`;

const CaseBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing(2)};
  min-width: 0;
  padding: ${spacing(4.5)} ${spacing(5)};
`;

const CaseClient = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.625)};
  letter-spacing: 0.12em;
  line-height: 1.2;
  text-transform: uppercase;
`;

const CaseTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.25;
`;

const CaseTeaser = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.5;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

const CaseActionSlot = styled.div`
  align-items: flex-end;
  display: flex;
  flex-shrink: 0;
  margin-top: ${spacing(2.5)};
  min-height: ${spacing(8.5)};
`;

const CaseAction = styled.span`
  background: transparent;
  border-radius: ${radius(1)};
  color: ${color('blue')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.625)};
  letter-spacing: 0.14em;
  line-height: 1;
  opacity: 0;
  padding: ${spacing(2)} ${spacing(3)};
  text-transform: uppercase;
  transition:
    background-color 0.22s ${EASING.standard},
    opacity 0.22s ${EASING.standard};

  ${CaseCard}:hover &,
  ${CaseCard}:focus-visible & {
    background: ${color('blue')}14;
    opacity: 1;
  }

  ${REDUCED_MOTION} {
    background: ${color('blue')}14;
    opacity: 1;
    transition: none;
  }
`;

function caseLayout(index: number, total: number): 'compact' | 'featured' {
  return index === 0 && total > 1 ? 'featured' : 'compact';
}

export function PartnerSelectedWork({
  portfolio,
}: {
  portfolio: readonly PartnerCaseStudy[];
}) {
  const { i18n } = useLingui();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (portfolio.length === 0) {
    return null;
  }

  return (
    <Section aria-labelledby="partner-case-studies-heading">
      <ProfileSectionTitle id="partner-case-studies-heading">
        {i18n._(msg`Case studies`)}
      </ProfileSectionTitle>
      <CasesList>
        {/* oxlint-disable eslint-plugin-react(no-array-index-key) -- portfolio lacks stable ids */}
        {portfolio.map((caseStudy, index) => {
          const imageUrl =
            caseStudy.imageUrl !== null && isSafeHttpUrl(caseStudy.imageUrl)
              ? caseStudy.imageUrl
              : null;
          const layout = caseLayout(index, portfolio.length);

          return (
            <CaseCard
              key={`${index}-${caseStudy.client}-${caseStudy.title}`}
              aria-label={i18n._(msg`Open case study: ${caseStudy.title}`)}
              data-layout={layout}
              onClick={() => setOpenIndex(index)}
              type="button"
            >
              <CaseStudyVisualHover data-layout={layout}>
                {imageUrl !== null ? (
                  <CaseStudyVisual
                    alt={caseStudy.title}
                    imageUrl={imageUrl}
                    size="card"
                  />
                ) : (
                  <CaseStudyPlaceholder client={caseStudy.client} />
                )}
              </CaseStudyVisualHover>
              <CaseBody>
                <CaseClient>{caseStudy.client}</CaseClient>
                <CaseTitle>{caseStudy.title}</CaseTitle>
                <CaseTeaser>{richTextExcerpt(caseStudy.body)}</CaseTeaser>
                <CaseActionSlot>
                  <CaseAction>{i18n._(msg`Read case study`)}</CaseAction>
                </CaseActionSlot>
              </CaseBody>
            </CaseCard>
          );
        })}
        {/* oxlint-enable eslint-plugin-react(no-array-index-key) */}
      </CasesList>
      <CaseStudyModal
        cases={portfolio}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
      />
    </Section>
  );
}
