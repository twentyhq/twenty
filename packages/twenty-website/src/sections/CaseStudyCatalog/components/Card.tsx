import type { CaseStudyCatalogEntry } from '@/lib/customers';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { LocalizedLink } from '@/lib/i18n';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { CSSProperties } from 'react';

import { CardFooter } from './CardFooter';
import { CardKpisDefault, CardKpisLarge } from './CardKpis';
import { CardThumbnail } from './CardThumbnail';

type CardVariant = 'default' | 'large';

type CaseStudyCardStyle = CSSProperties & {
  '--case-study-card-index': number;
};

const CardLink = styled(LocalizedLink)`
  @keyframes caseStudyCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: caseStudyCardEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--case-study-card-index) * 90ms + 180ms);
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
  will-change: transform;

  &[data-card-variant='large'] {
    grid-column: 1 / -1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-card-variant='large'] {
      flex-direction: row;
    }
  }

  &:hover {
    border-color: ${theme.colors.primary.border[20]};
    box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ContentWrapper = styled.div<{ variant: 'default' | 'large' }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${({ variant }) =>
      variant === 'large'
        ? `${theme.spacing(10)} ${theme.spacing(6)} ${theme.spacing(5)}`
        : '0'};
  }
`;

const CardBody = styled.div<{ variant: 'default' | 'large' }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  padding-bottom: ${theme.spacing(5)};
  padding-left: ${theme.spacing(6)};
  padding-right: ${theme.spacing(6)};
  padding-top: ${theme.spacing(5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${({ variant }) =>
      variant === 'large' ? theme.spacing(5) : theme.spacing(3)};
    padding: ${({ variant }) => (variant === 'large' ? '0' : '')};
    padding-bottom: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(5)};
    padding-left: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(6)};
    padding-right: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(6)};
    padding-top: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(5)};
  }
`;

const Title = styled.h3<{ variant: 'default' | 'large' }>`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(7.5)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${({ variant }) =>
      variant === 'large' ? theme.font.size(8) : theme.font.size(6.5)};
    line-height: ${({ variant }) =>
      variant === 'large' ? theme.lineHeight(9.5) : theme.lineHeight(8)};
  }
`;

const Quote = styled.blockquote`
  border-left: 2px solid ${theme.colors.highlight[100]};
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(4)};
  font-style: italic;
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(6)};
  margin: 0;
  padding-left: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(4.5)};
    line-height: ${theme.lineHeight(6.5)};
  }
`;

const Summary = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${theme.colors.primary.text[60]};
  display: -webkit-box;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
  margin: 0;
  overflow: hidden;
`;

const IndustryLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(4)};
  text-transform: uppercase;
`;

type CardProps = {
  dashColor?: string;
  entry: CaseStudyCatalogEntry;
  hoverDashColor?: string;
  index?: number;
  variant?: CardVariant;
};

export function Card({
  dashColor,
  entry,
  hoverDashColor,
  index = 0,
  variant = 'default',
}: CardProps) {
  const i18n = getServerI18n();
  const isLarge = variant === 'large';
  const hasQuote = isLarge && entry.quote;
  const kpiCount = entry.kpis.length;
  const cardStyle: CaseStudyCardStyle = {
    '--case-study-card-index': index,
  };

  return (
    <CardLink data-card-variant={variant} href={entry.href} style={cardStyle}>
      <CardThumbnail
        clientIcon={entry.hero.clientIcon}
        coverImageSrc={entry.catalogCard.coverImageSrc}
        dashColor={dashColor}
        hoverDashColor={hoverDashColor}
        readingTime={entry.hero.readingTime}
        variant={variant}
      />

      <ContentWrapper variant={variant}>
        <CardBody variant={variant}>
          <IndustryLabel>{i18n._(entry.industry)}</IndustryLabel>
          <Title variant={variant}>{i18n._(entry.hero.title)}</Title>
          {hasQuote && entry.quote ? (
            <Quote>&ldquo;{i18n._(entry.quote.text)}&rdquo;</Quote>
          ) : !isLarge ? (
            <Summary>{i18n._(entry.catalogCard.summary)}</Summary>
          ) : null}
          {isLarge && kpiCount > 0 ? (
            <CardKpisLarge kpis={entry.kpis} variant="large" />
          ) : null}
        </CardBody>

        {!isLarge && kpiCount > 0 ? (
          <CardKpisDefault kpis={entry.kpis} variant="default" />
        ) : null}

        <CardFooter
          author={entry.hero.author}
          authorAvatarSrc={entry.hero.authorAvatarSrc}
          authorRole={entry.authorRole}
          quote={entry.quote}
          variant={variant}
        />
      </ContentWrapper>
    </CardLink>
  );
}
