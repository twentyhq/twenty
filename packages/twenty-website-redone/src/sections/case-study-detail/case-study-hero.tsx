import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { IconArrowLeft, IconClock } from '@tabler/icons-react';
import NextImage from 'next/image';

import {
  type CaseStudyCatalogEntry,
  type CaseStudyStory,
  CLIENT_LOGO_DISPLAY_WIDTHS,
  ClientLogo,
  CustomerCasesCover,
} from '@/case-studies';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/localized-link';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  type PaletteToken,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

const HERO_LOGO_SCALE = 1.6;

const HeroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-top: ${spacing(10)};
  text-align: center;

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    padding-top: ${spacing(16)};
  }
`;

const Badge = styled.span`
  align-items: center;
  background-color: ${color('blue')};
  border-radius: 50px;
  color: ${color('white')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  gap: ${spacing(1)};
  padding: ${spacing(1.25)} ${spacing(3)};
`;

const TitleWrap = styled.div`
  max-width: 900px;
`;

const AuthorAvatar = styled.div`
  background-color: ${color('blue')};
  border-radius: 50%;
  flex-shrink: 0;
  height: 56px;
  margin-top: ${spacing(6)};
  overflow: hidden;
  position: relative;
  width: 56px;

  ${mediaUp('md')} {
    height: 64px;
    margin-top: ${spacing(7)};
    width: 64px;
  }
`;

const AuthorAvatarInitials = styled.span`
  align-items: center;
  color: ${color('white')};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-weight: ${FONT_WEIGHT.medium};
  height: 100%;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 100%;
`;

const AuthorRow = styled.div`
  align-items: center;
  column-gap: ${spacing(3)};
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: ${spacing(0.5)};
  row-gap: ${spacing(2)};
`;

const BackLink = styled(LocalizedLink)`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  gap: ${spacing(1)};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${semanticColor.ink};
  }

  ${mediaUp('md')} {
    display: none;
  }
`;

const AuthorDivider = styled.span`
  background-color: ${semanticColor.line};
  display: inline-block;
  height: 10px;
  width: 1px;

  ${mediaUp('md')} {
    display: none;
  }
`;

const AuthorInfo = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(0.5)};
`;

const AuthorName = styled.p`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const AuthorRole = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
`;

const HeroCover = styled.div`
  align-items: center;
  background-color: ${color('black')};
  display: flex;
  height: 320px;
  justify-content: center;
  margin-top: ${spacing(10)};
  overflow: hidden;
  position: relative;

  ${mediaUp('md')} {
    height: 462px;
    margin-top: ${spacing(14)};
  }
`;

const CoverLayer = styled.div`
  inset: 0;
  position: absolute;
`;

const LogoLayer = styled.div`
  align-items: center;
  color: ${color('white')};
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;
`;

export type CaseStudyHeroProps = {
  accent: PaletteToken;
  entry: CaseStudyCatalogEntry;
  story: CaseStudyStory;
};

export function CaseStudyHero({ accent, entry, story }: CaseStudyHeroProps) {
  const i18n = getServerI18n();
  const initials = entry.author
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const logoWidth =
    CLIENT_LOGO_DISPLAY_WIDTHS[entry.clientIcon] * HERO_LOGO_SCALE;

  return (
    <SectionShell
      ariaLabel={i18n._(msg`Customer story`)}
      rhythm="flush"
      scheme="dark"
    >
      <HeroStack>
        <Badge>
          <IconClock size={16} stroke={1.5} />
          {entry.readingTime}
        </Badge>

        <TitleWrap>
          <Heading as="h1" size="lg" weight="light">
            {i18n._(story.heroTitle)}
          </Heading>
        </TitleWrap>

        <AuthorAvatar>
          {entry.authorAvatarSrc ? (
            <NextImage
              alt=""
              fill
              sizes="64px"
              src={entry.authorAvatarSrc}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <AuthorAvatarInitials>{initials}</AuthorAvatarInitials>
          )}
        </AuthorAvatar>

        <AuthorRow>
          <BackLink href="/customers">
            <IconArrowLeft size={16} stroke={1.5} />
            {i18n._(msg`Back`)}
          </BackLink>
          <AuthorDivider aria-hidden />
          <AuthorInfo>
            <AuthorName>{entry.author}</AuthorName>
            <AuthorRole>{i18n._(entry.authorRole)}</AuthorRole>
          </AuthorInfo>
        </AuthorRow>
      </HeroStack>

      <HeroCover>
        <CoverLayer>
          <CustomerCasesCover accent={accent} imageUrl={entry.coverImageSrc} />
        </CoverLayer>
        <LogoLayer>
          <ClientLogo client={entry.clientIcon} sizePx={logoWidth} />
        </LogoLayer>
      </HeroCover>
    </SectionShell>
  );
}
