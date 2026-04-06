import { Body, Heading, LazyEmbed, LinkButton } from '@/design-system/components';
import { CLIENT_ICONS } from '@/icons';
import { HelpedCardShape } from '@/sections/Helped/HelpedCardShape';
import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const CardRoot = styled.article`
  display: grid;
  grid-template-columns: 1fr;
  isolation: isolate;
  max-width: 443px;
  min-height: 0;
  min-width: 0;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(2.5)};
  position: relative;
  row-gap: ${theme.spacing(2.5)};
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
  transform-style: preserve-3d;
  perspective: 1200px;

  /* Group hover context to dim other cards */
  &:hover {
    transform: translateY(-16px) scale(1.02) rotateX(2deg) rotateY(-2deg);
    z-index: 10;
  }

  /* Complex hover shadow */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${theme.radius(4)};
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.4);
    opacity: 0;
    transition: opacity 0.6s ease;
    z-index: -1;
    pointer-events: none;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const LogoRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr;
  min-height: ${theme.spacing(8)};
`;

const Rule = styled.div`
  background-color: ${theme.colors.secondary.border[40]};
  height: 1px;
  width: 100%;
`;

const VisualShell = styled.div`
  background-color: ${theme.colors.secondary.background[100]};
  border-radius: ${theme.radius(2)};
  height: 240px;
  overflow: hidden;
  position: relative;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transform-style: preserve-3d;

  ${CardRoot}:hover & {
    transform: translateZ(30px) scale(1.02);
  }
`;

const StyledIframe = styled(LazyEmbed)`
  border: none;
  height: 200%;
  left: 51.5%;
  mix-blend-mode: lighten;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
`;

const HueOverlay = styled.div`
  background-color: ${theme.colors.highlight[100]};
  inset: 0;
  mix-blend-mode: hue;
  pointer-events: none;
  position: absolute;
`;

const CopyBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(2)};
`;

const CardTitleWrap = styled.div`
  color: ${theme.colors.secondary.text[100]};
`;

const CardBodyWrap = styled.div`
  color: ${theme.colors.secondary.text[80]};
`;

const CtaRow = styled.div`
  display: grid;
  grid-template-columns: max-content;
  justify-items: start;
  padding-top: ${theme.spacing(1)};
`;

const LOGO_FILL = theme.colors.secondary.text[100];

type CardProps = {
  card: HeadingCardType;
};

export function Card({ card }: CardProps) {
  const IconComponent = CLIENT_ICONS[card.icon];
  const logoWidth = card.icon === 'evergreen' ? 96 : 104;

  return (
    <CardRoot>
      <HelpedCardShape
        fillColor={theme.colors.secondary.background[100]}
        strokeColor={theme.colors.secondary.border[40]}
      />
      <LogoRow>
        {IconComponent ? (
          <IconComponent fillColor={LOGO_FILL} size={logoWidth} />
        ) : null}
      </LogoRow>
      <Rule aria-hidden="true" />
      <VisualShell>
        <StyledIframe
          allow="clipboard-write; encrypted-media; gyroscope; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          src={card.illustration.src}
          title={card.illustration.title || 'Case illustration'}
        />
        <HueOverlay aria-hidden="true" />
      </VisualShell>
      <Rule aria-hidden="true" />
      <CopyBlock>
        <CardTitleWrap>
          <Heading as="h3" segments={card.heading} size="xs" weight="medium" />
        </CardTitleWrap>
        <CardBodyWrap>
          <Body as="p" body={card.body} size="sm" />
        </CardBodyWrap>
      </CopyBlock>
      <CtaRow>
        <LinkButton
          color="primary"
          href="https://twenty.com"
          label="Read the case"
          type="anchor"
          variant="outlined"
        />
      </CtaRow>
    </CardRoot>
  );
}
