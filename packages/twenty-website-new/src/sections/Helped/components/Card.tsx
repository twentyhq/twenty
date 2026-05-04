import { Body, Heading } from '@/design-system/components';
import { CLIENT_ICONS } from '@/icons';
import { LocalizedLinkButton } from '@/lib/i18n/LocalizedLinkButton';
import { WebGlMount } from '@/lib/visual-runtime';
import { HelpedCardShape } from '@/sections/Helped/components/HelpedCardShape';
import type { HeadingCardType } from '@/sections/Helped/types/HeadingCard';
import { HELPED_VISUALS } from '@/sections/Helped/visuals';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
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
  --body-sm-color: currentColor;
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
  renderText: (descriptor: MessageDescriptor) => string;
};

export function Card({ card, renderText }: CardProps) {
  const IconComponent = CLIENT_ICONS[card.icon];
  const Visual = HELPED_VISUALS[card.illustration];
  const logoWidth = 104;

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
        <WebGlMount loading="eager">
          <Visual />
        </WebGlMount>
      </VisualShell>
      <Rule aria-hidden="true" />
      <CopyBlock>
        <CardTitleWrap>
          <Heading
            as="h3"
            renderText={renderText}
            segments={card.heading}
            size="xs"
            weight="medium"
          />
        </CardTitleWrap>
        <CardBodyWrap>
          <Body as="p" body={card.body} renderText={renderText} size="sm" />
        </CardBodyWrap>
      </CopyBlock>
      <CtaRow>
        <LocalizedLinkButton
          color="primary"
          href={card.href}
          label={renderText(msg`Read the case`)}
          variant="outlined"
        />
      </CtaRow>
    </CardRoot>
  );
}
