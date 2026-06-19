import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  type PaletteToken,
  radius,
  SHADOW,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Heading } from '@/ui';

import { CaseStudyCardFooter } from './CaseStudyCardFooter';
import { CaseStudyCardKpis } from './CaseStudyCardKpis';
import { CaseStudyCardThumbnail } from './CaseStudyCardThumbnail';
import { type CaseStudyCatalogEntry } from '@/case-studies';

const CardLink = styled(LocalizedLink)`
  background-color: ${color('white')};
  border: 1px solid ${color('black-10')};
  border-radius: ${radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  transition:
    border-color 0.25s ${EASING.standard},
    box-shadow 0.25s ${EASING.standard},
    transform 0.25s ${EASING.standard};
  will-change: transform;

  &[data-variant='large'] {
    grid-column: 1 / -1;
  }

  ${mediaUp('md')} {
    &[data-variant='large'] {
      flex-direction: row;
    }
  }

  &:hover {
    border-color: ${color('black-20')};
    box-shadow: ${SHADOW.card};
    transform: translateY(-2px);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  ${mediaUp('md')} {
    &[data-variant='large'] {
      padding: ${spacing(10)} ${spacing(6)} ${spacing(5)};
    }
  }
`;

const CardBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${spacing(5)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(3)};
  }

  ${mediaUp('md')} {
    &[data-variant='large'] {
      padding: 0;

      & > * + * {
        margin-top: ${spacing(5)};
      }

      & > *:last-child {
        margin-top: auto;
      }
    }
  }
`;

const IndustryLabel = styled.span`
  color: ${color('black-60')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Quote = styled.blockquote`
  ${typeRampDeclarations('bodyMd')}
  border-left: 2px solid ${color('blue')};
  color: ${color('black-60')};
  font-family: ${fontFamily('serif')};
  font-style: italic;
  font-weight: ${FONT_WEIGHT.regular};
  padding-left: ${spacing(4)};
`;

const summaryClampClassName = css`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
`;

export type CaseStudyCardProps = {
  accent: PaletteToken;
  entry: CaseStudyCatalogEntry;
  variant: 'default' | 'large';
};

export function CaseStudyCard({ accent, entry, variant }: CaseStudyCardProps) {
  const i18n = getServerI18n();
  const isLarge = variant === 'large';
  const hasQuote = isLarge && entry.quote;
  const badge = isLarge
    ? `${i18n._(msg`Case`)} · ${entry.readingTime}`
    : undefined;

  return (
    <CardLink data-variant={variant} href={`/customers/${entry.slug}`}>
      <CaseStudyCardThumbnail
        accent={accent}
        badge={badge}
        clientIcon={entry.clientIcon}
        coverImageSrc={entry.coverImageSrc}
        variant={variant}
      />

      <ContentWrapper data-variant={variant}>
        <CardBody data-variant={variant}>
          <IndustryLabel>{i18n._(entry.industry)}</IndustryLabel>
          <Heading
            as="h3"
            size={isLarge ? 'sm' : 'xs'}
            weight="light"
            wrap="normal"
          >
            {i18n._(entry.title)}
          </Heading>
          {hasQuote && entry.quote ? (
            <Quote>&ldquo;{i18n._(entry.quote.text)}&rdquo;</Quote>
          ) : !isLarge ? (
            <Body as="p" className={summaryClampClassName} muted size="sm">
              {i18n._(entry.summary)}
            </Body>
          ) : null}
          {isLarge && entry.kpis.length > 0 ? (
            <CaseStudyCardKpis kpis={entry.kpis} variant="large" />
          ) : null}
        </CardBody>

        {!isLarge && entry.kpis.length > 0 ? (
          <CaseStudyCardKpis kpis={entry.kpis} variant="default" />
        ) : null}

        <CaseStudyCardFooter
          author={entry.author}
          authorAvatarSrc={entry.authorAvatarSrc}
          authorRole={entry.authorRole}
          quote={entry.quote}
          variant={variant}
        />
      </ContentWrapper>
    </CardLink>
  );
}
