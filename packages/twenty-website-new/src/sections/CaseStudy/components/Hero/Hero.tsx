import type { CaseStudyData } from '@/app/case-studies/_constants/types';
import { Container, Heading } from '@/design-system/components';
import { CLIENT_ICONS } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconArrowLeft, IconClock } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

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
  padding-bottom: ${theme.spacing(10)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(18)};
    padding-bottom: ${theme.spacing(0)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(4)};
  }
`;

const BackLink = styled(Link)`
  align-items: center;
  color: ${theme.colors.secondary.text[80]};
  display: flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(1)};
  letter-spacing: 0.05em;
  line-height: ${theme.lineHeight(4)};
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.secondary.text[100]};
  }
`;

const HeroContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  text-align: center;
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
  padding-bottom: ${theme.spacing(0.5)};
  padding-left: ${theme.spacing(2)};
  padding-right: ${theme.spacing(2)};
  padding-top: ${theme.spacing(0.5)};
`;

const TitleWrap = styled.div`
  max-width: 900px;
  color: ${theme.colors.secondary.text[100]};
`;

const AuthorLine = styled.p`
  color: ${theme.colors.secondary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4)};
  margin: 0;
`;

const AuthorName = styled.span`
  font-weight: ${theme.font.weight.medium};
`;

const HeroVisual = styled.div`
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(8)};
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    flex-direction: row;
    height: 462px;
    justify-content: space-between;
    padding-left: ${theme.spacing(28)};
    padding-right: ${theme.spacing(14)};
  }
`;

const VisualContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  justify-content: center;
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    width: 350px;
  }
`;

const ImageContent = styled.div`
  border-radius: ${theme.radius(1)};
  height: 280px;
  overflow: hidden;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 406px;
    width: 714px;
  }
`;

const ClientLogoWrap = styled.div`
  max-width: 280px;
`;

const Separator = styled.span`
  color: ${theme.colors.secondary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(10)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(11.5)};
`;

const TwentyLogoWrap = styled.div`
  align-items: center;
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(2)};
  display: flex;
  height: 80px;
  justify-content: center;
  overflow: hidden;
  width: 80px;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 98px;
    width: 98px;
  }
`;

const TwentyLogo = styled.div`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.medium};
`;

const HeroImageOverlay = styled.div`
  background: linear-gradient(
    180deg,
    rgba(28, 28, 28, 0.3) 0%,
    rgba(28, 28, 28, 0.8) 100%
  );
  inset: 0;
  position: absolute;
`;

type HeroProps = {
  hero: CaseStudyData['hero'];
};

export function Hero({ hero }: HeroProps) {
  const ClientIcon = CLIENT_ICONS[hero.clientIcon];

  return (
    <Section id="case-study-hero">
      <StyledContainer>
        <BackLink href="/case-studies">
          <IconArrowLeft size={20} stroke={1.5} />
          Back to case studies
        </BackLink>

        <HeroContent>
          <Badge>
            <IconClock size={16} stroke={1.5} />
            {hero.readingTime}
          </Badge>

          <TitleWrap>
            <Heading as="h1" segments={hero.title} size="xl" weight="light" />
          </TitleWrap>

          <AuthorLine>
            Written by <AuthorName>{hero.author}</AuthorName>
          </AuthorLine>
        </HeroContent>

        <HeroVisual>
          <VisualContent>
            {ClientIcon && (
              <ClientLogoWrap>
                <ClientIcon
                  fillColor={theme.colors.secondary.text[100]}
                  size={200}
                />
              </ClientLogoWrap>
            )}
            <Separator>x</Separator>
            <TwentyLogoWrap>
              <TwentyLogo>T</TwentyLogo>
            </TwentyLogoWrap>
          </VisualContent>

          {hero.heroImageSrc && (
            <ImageContent>
              <Image
                alt=""
                fill
                sizes="(max-width: 920px) 100vw, 714px"
                src={hero.heroImageSrc}
                style={{ objectFit: 'cover' }}
              />
              <HeroImageOverlay />
            </ImageContent>
          )}
        </HeroVisual>
      </StyledContainer>
    </Section>
  );
}
