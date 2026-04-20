import type { CaseStudyData } from '@/app/customers/_constants/types';
import { Container, Heading } from '@/design-system/components';
import { CLIENT_ICONS } from '@/icons';
import { CustomerCasesCover } from '@/illustrations/CaseStudyCatalog/CustomerCasesCover';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconArrowLeft, IconClock } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

const CATALOG_LOGO_WIDTHS: Record<string, number> = {
  'nine-dots': 72,
  'alternative-partners': 220,
  netzero: 180,
  'act-education': 110,
  w3villa: 150,
  'elevate-consulting': 160,
};

const HERO_LOGO_SCALE = 1.6;

const Section = styled.section`
  background-color: ${theme.colors.secondary.background[100]};
  color: ${theme.colors.secondary.text[100]};
  min-width: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(8)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(10)};
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(10)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(16)};
  }
`;

const BackLink = styled(Link)`
  align-items: center;
  color: ${theme.colors.secondary.text[80]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(1)};
  line-height: ${theme.lineHeight(5)};
  text-decoration: none;
  transition: color 0.2s ease;

  & svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    color: ${theme.colors.secondary.text[100]};
  }

  &:hover svg {
    transform: translateX(-2px);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    display: none;
  }
`;

const AuthorDivider = styled.span`
  background-color: ${theme.colors.secondary.border[40]};
  display: inline-block;
  height: 10px;
  width: 1px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: none;
  }
`;

const HeroContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  text-align: center;
`;

const MetaRow = styled.div`
  align-items: center;
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  justify-content: center;
`;

const Badge = styled.span`
  align-items: center;
  background-color: ${theme.colors.highlight[100]};
  border-radius: 50px;
  color: ${theme.colors.secondary.text[100]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(1)};
  line-height: ${theme.lineHeight(3.5)};
  padding-bottom: ${theme.spacing(1.25)};
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(3)};
  padding-top: ${theme.spacing(1.25)};
`;

const TitleWrap = styled.div`
  max-width: 900px;
  color: ${theme.colors.secondary.text[100]};
`;

const AuthorAvatar = styled.div`
  background-color: ${theme.colors.highlight[100]};
  border-radius: 50%;
  box-shadow:
    0 0 0 1px ${theme.colors.secondary.border[20]},
    0 10px 30px rgba(0, 0, 0, 0.35);
  height: 56px;
  margin-bottom: ${theme.spacing(-1)};
  margin-top: ${theme.spacing(2)};
  overflow: hidden;
  position: relative;
  width: 56px;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 64px;
    margin-bottom: ${theme.spacing(-2)};
    margin-top: ${theme.spacing(3)};
    width: 64px;
  }
`;

const AuthorAvatarInitials = styled.span`
  align-items: center;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5)};
  font-weight: ${theme.font.weight.medium};
  height: 100%;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 100%;
`;

const AuthorRow = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(3)};
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: ${theme.spacing(2)};
`;

const AuthorInfo = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(0.5)};
`;

const AuthorName = styled.p`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.medium};
  line-height: ${theme.lineHeight(5)};
  margin: 0;
`;

const AuthorRole = styled.p`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4.5)};
  margin: 0;
`;

const PartnerCover = styled.div`
  align-items: center;
  background-color: #000;
  display: flex;
  height: 320px;
  justify-content: center;
  margin: ${theme.spacing(10)} 0 0;
  overflow: hidden;
  position: relative;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 462px;
    margin: ${theme.spacing(14)} 0 0;
  }
`;

const PartnerCoverLayer = styled.div`
  inset: 0;
  position: absolute;
`;

const PartnerLogoLayer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  pointer-events: none;
  position: relative;
  width: 100%;
  z-index: 1;
`;

type HeroProps = {
  hero: CaseStudyData['hero'];
  dashColor?: string;
  hoverDashColor?: string;
};

export function Hero({ hero, dashColor, hoverDashColor }: HeroProps) {
  const ClientIcon = CLIENT_ICONS[hero.clientIcon];
  const authorInitials = hero.author
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const logoWidth =
    (CATALOG_LOGO_WIDTHS[hero.clientIcon] ?? 140) * HERO_LOGO_SCALE;

  return (
    <Section id="case-study-hero">
      <StyledContainer>
        <HeroContent>
          <MetaRow>
            <Badge>
              <IconClock size={16} stroke={1.5} />
              {hero.readingTime}
            </Badge>
          </MetaRow>

          <TitleWrap>
            <Heading as="h1" segments={hero.title} size="lg" weight="light" />
          </TitleWrap>

          <AuthorAvatar>
            {hero.authorAvatarSrc ? (
              <Image
                alt={hero.author}
                fill
                sizes="64px"
                src={hero.authorAvatarSrc}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <AuthorAvatarInitials>{authorInitials}</AuthorAvatarInitials>
            )}
          </AuthorAvatar>

          <AuthorRow>
            <BackLink href="/customers">
              <IconArrowLeft size={16} stroke={1.5} />
              Back
            </BackLink>
            <AuthorDivider aria-hidden />
            <AuthorInfo>
              <AuthorName>{hero.author}</AuthorName>
              {hero.authorRole ? (
                <AuthorRole>{hero.authorRole}</AuthorRole>
              ) : null}
            </AuthorInfo>
          </AuthorRow>
        </HeroContent>
      </StyledContainer>

      <PartnerCover>
        {hero.heroImageSrc && (
          <PartnerCoverLayer>
            <CustomerCasesCover
              dashColor={dashColor}
              hoverDashColor={hoverDashColor}
              imageUrl={hero.heroImageSrc}
              style={{ background: '#000' }}
            />
          </PartnerCoverLayer>
        )}
        {ClientIcon && (
          <PartnerLogoLayer>
            <ClientIcon fillColor="#FFFFFF" size={logoWidth} />
          </PartnerLogoLayer>
        )}
      </PartnerCover>
    </Section>
  );
}
