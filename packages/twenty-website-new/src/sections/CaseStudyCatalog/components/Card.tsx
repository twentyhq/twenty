import type { CaseStudyCatalogEntry } from '@/lib/customers';
import { ArrowRightIcon, CLIENT_ICONS } from '@/icons';
import { LocalizedLink } from '@/lib/i18n';
import { CustomerCasesCover } from '@/sections/CaseStudyCatalog/visuals/CustomerCasesCover';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import Image from 'next/image';
import type { CSSProperties } from 'react';

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

const Thumbnail = styled.div<{ variant: 'default' | 'large' }>`
  align-items: center;
  background-color: #000;
  display: flex;
  flex-shrink: 0;
  height: 200px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: ${({ variant }) => (variant === 'large' ? 'auto' : '240px')};
    min-height: ${({ variant }) => (variant === 'large' ? '460px' : '0')};
    width: ${({ variant }) => (variant === 'large' ? '50%' : '100%')};
  }
`;

const CoverLayer = styled.div`
  inset: 0;
  position: absolute;
`;

const LogoLayer = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;
`;

const ThumbnailBadge = styled.span`
  bottom: ${theme.spacing(4)};
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  left: ${theme.spacing(6)};
  letter-spacing: 0.08em;
  position: absolute;
  text-transform: uppercase;
  z-index: 2;

  @media (min-width: ${theme.breakpoints.md}px) {
    bottom: ${theme.spacing(6)};
    left: ${theme.spacing(8)};
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

const TitleSans = styled.span`
  font-family: ${theme.font.family.sans};
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

const KpiRow = styled.div<{ count: number }>`
  border-top: 1px solid ${theme.colors.primary.border[10]};
  display: grid;
  grid-template-columns: repeat(
    ${({ count }) => (count > 2 ? 2 : count)},
    minmax(0, 1fr)
  );
  margin-top: ${theme.spacing(2)};

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: ${({ count }) => `repeat(${count}, minmax(0, 1fr))`};
    margin-top: auto;
  }
`;

const KpiCell = styled.div<{ index: number; count: number }>`
  border-left: 1px solid ${theme.colors.primary.border[10]};
  border-top: ${({ index, count }) =>
    count > 2 && index >= 2
      ? `1px solid ${theme.colors.primary.border[10]}`
      : 'none'};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1.5)};
  padding: ${theme.spacing(4)} ${theme.spacing(3)};

  &:nth-child(odd) {
    border-left: none;
    padding-left: 0;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    border-left: 1px solid ${theme.colors.primary.border[10]};
    border-top: none;
    padding: ${theme.spacing(5)} ${theme.spacing(4)};

    &:first-child {
      border-left: none;
      padding-left: 0;
    }

    &:nth-child(odd) {
      border-left: 1px solid ${theme.colors.primary.border[10]};
      padding-left: ${theme.spacing(4)};
    }

    &:first-child {
      border-left: none;
      padding-left: 0;
    }
  }
`;

const KpiValue = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(7)};

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(7)};
    line-height: ${theme.lineHeight(8)};
  }
`;

const KpiLabel = styled.span`
  color: ${theme.colors.primary.text[40]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(4)};
  text-transform: uppercase;
`;

const KpiChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
  margin-top: ${theme.spacing(1)};
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(6)};
  padding-right: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(5)};
  }
`;

const KpiChip = styled.span`
  align-items: center;
  background-color: ${theme.colors.primary.text[5]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: 999px;
  color: ${theme.colors.primary.text[60]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(2.5)};
  line-height: ${theme.lineHeight(4)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(3.5)};
  white-space: nowrap;
`;

const KpiChipValue = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: -0.01em;
`;

const KpiChipDivider = styled.span`
  background-color: ${theme.colors.primary.border[20]};
  flex-shrink: 0;
  height: 14px;
  width: 1px;
`;

const KpiChipLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Footer = styled.div<{ variant: 'default' | 'large' }>`
  align-items: center;
  border-top: 1px solid ${theme.colors.primary.border[10]};
  display: flex;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  margin-left: ${theme.spacing(6)};
  margin-right: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(5)};
  padding-top: ${theme.spacing(5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(6)};
    margin-right: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(6)};
    padding-bottom: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(5)};
    padding-top: ${({ variant }) =>
      variant === 'large' ? theme.spacing(6) : theme.spacing(5)};
  }
`;

const AuthorGroup = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${theme.spacing(3)};
  min-width: 0;
`;

const AuthorAvatar = styled.div`
  align-items: center;
  background-color: ${theme.colors.highlight[100]};
  border-radius: 50%;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  flex-shrink: 0;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const AuthorAvatarPhoto = styled.div`
  border-radius: 50%;
  flex-shrink: 0;
  height: 32px;
  overflow: hidden;
  position: relative;
  width: 32px;
`;

const AuthorText = styled.div`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AuthorRoleText = styled.span`
  color: ${theme.colors.primary.text[40]};
`;

const ReadIconButton = styled.span`
  align-items: center;
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.primary.text[80]};
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 40px;

  ${`a:hover &`} {
    transform: scale(1.08);
  }
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

const CATALOG_LOGO_WIDTHS: Record<
  CaseStudyCatalogEntry['hero']['clientIcon'],
  number
> = {
  'nine-dots': 72,
  'alternative-partners': 220,
  netzero: 180,
  'act-education': 110,
  w3villa: 150,
  'elevate-consulting': 160,
};

const LARGE_LOGO_SCALE = 1.4;

type CardProps = {
  entry: CaseStudyCatalogEntry;
  index?: number;
  renderText: (descriptor: MessageDescriptor) => string;
  variant?: CardVariant;
  dashColor?: string;
  hoverDashColor?: string;
};

export function Card({
  entry,
  index = 0,
  renderText,
  variant = 'default',
  dashColor,
  hoverDashColor,
}: CardProps) {
  const ClientIcon = CLIENT_ICONS[entry.hero.clientIcon];
  const baseLogoWidth = CATALOG_LOGO_WIDTHS[entry.hero.clientIcon] ?? 140;
  const logoWidth =
    variant === 'large' ? baseLogoWidth * LARGE_LOGO_SCALE : baseLogoWidth;
  const initials = entry.hero.author
    .split(' ')
    .map((word) => word[0])
    .join('');

  const coverImageSrc = entry.catalogCard.coverImageSrc;
  const isLarge = variant === 'large';
  const hasQuote = isLarge && entry.quote;
  const kpiCount = entry.kpis.length;
  const cardStyle: CaseStudyCardStyle = {
    '--case-study-card-index': index,
  };

  return (
    <CardLink data-card-variant={variant} href={entry.href} style={cardStyle}>
      <Thumbnail variant={variant}>
        {coverImageSrc ? (
          <CoverLayer>
            <CustomerCasesCover
              dashColor={dashColor}
              hoverDashColor={hoverDashColor}
              imageUrl={coverImageSrc}
            />
          </CoverLayer>
        ) : null}
        {ClientIcon ? (
          <LogoLayer>
            <ClientIcon fillColor="#FFFFFF" size={logoWidth} />
          </LogoLayer>
        ) : null}
        {isLarge ? (
          <ThumbnailBadge>Case · {entry.hero.readingTime}</ThumbnailBadge>
        ) : null}
      </Thumbnail>

      <ContentWrapper variant={variant}>
        <CardBody variant={variant}>
          <IndustryLabel>{renderText(entry.industry)}</IndustryLabel>
          <Title variant={variant}>
            {entry.hero.title.map((segment, segmentIndex) =>
              segment.fontFamily === 'sans' ? (
                <TitleSans key={segmentIndex}>
                  {renderText(segment.text)}
                </TitleSans>
              ) : (
                <span key={segmentIndex}>{renderText(segment.text)}</span>
              ),
            )}
          </Title>
          {hasQuote && entry.quote ? (
            <Quote>&ldquo;{renderText(entry.quote.text)}&rdquo;</Quote>
          ) : !isLarge ? (
            <Summary>{renderText(entry.catalogCard.summary)}</Summary>
          ) : null}
          {isLarge && kpiCount > 0 ? (
            <KpiRow count={kpiCount}>
              {entry.kpis.map((kpi, kpiIndex) => (
                <KpiCell count={kpiCount} index={kpiIndex} key={kpiIndex}>
                  <KpiValue>{renderText(kpi.value)}</KpiValue>
                  <KpiLabel>{renderText(kpi.label)}</KpiLabel>
                </KpiCell>
              ))}
            </KpiRow>
          ) : null}
        </CardBody>

        {!isLarge && kpiCount > 0 ? (
          <KpiChipRow>
            {entry.kpis.map((kpi, kpiIndex) => (
              <KpiChip key={kpiIndex}>
                <KpiChipValue>{renderText(kpi.value)}</KpiChipValue>
                <KpiChipDivider aria-hidden />
                <KpiChipLabel>{renderText(kpi.label)}</KpiChipLabel>
              </KpiChip>
            ))}
          </KpiChipRow>
        ) : null}

        <Footer variant={variant}>
          <AuthorGroup>
            {entry.hero.authorAvatarSrc ? (
              <AuthorAvatarPhoto>
                <Image
                  alt={entry.hero.author}
                  fill
                  sizes="32px"
                  src={entry.hero.authorAvatarSrc}
                  style={{ objectFit: 'cover' }}
                />
              </AuthorAvatarPhoto>
            ) : (
              <AuthorAvatar>{initials}</AuthorAvatar>
            )}
            {hasQuote && entry.quote ? (
              <AuthorText>
                {entry.quote.author}{' '}
                <AuthorRoleText>
                  · {renderText(entry.quote.role)}
                </AuthorRoleText>
              </AuthorText>
            ) : (
              <AuthorText>
                {entry.hero.author}{' '}
                <AuthorRoleText>
                  · {renderText(entry.authorRole)}
                </AuthorRoleText>
              </AuthorText>
            )}
          </AuthorGroup>
          <ReadIconButton aria-hidden>
            <ArrowRightIcon size={14} strokeColor="currentColor" />
          </ReadIconButton>
        </Footer>
      </ContentWrapper>
    </CardLink>
  );
}
