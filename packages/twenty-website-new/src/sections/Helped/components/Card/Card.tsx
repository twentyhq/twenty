import { Body, Heading, LinkButton } from '@/design-system/components';
import { CLIENT_ICONS } from '@/icons';
import { IllustrationMount } from '@/illustrations';
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
  transition:
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.6s ease;
  transform-style: preserve-3d;
  perspective: 1200px;
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
        <IllustrationMount illustration={card.illustration} />
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
