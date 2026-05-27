import { Body, Heading, HeadingPart } from '@/design-system/components';
import { CLIENT_ICONS } from '@/icons';
import { LocalizedLinkButton } from '@/lib/i18n/components/LocalizedLinkButton';
import { WebGlMount } from '@/lib/visual-runtime';
import { theme } from '@/theme';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import type { HeadingCardType } from '../types/heading-card-type';
import { HELPED_VISUALS } from '../utils/helped-visuals-map';

const HELPED_CARD_SHAPE_FILL_PATH =
  'M0 490V4a4 4 0 0 1 4-4h288.23c.932 0 1.856.163 2.731.48l60.814 22.09c.875.318 1.8.48 2.731.48H439a4 4 0 0 1 4 4V490a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4';

const HELPED_CARD_SHAPE_STROKE_PATH =
  'M4 .5h288.23c.874 0 1.74.152 2.561.45l60.813 22.09c.931.338 1.912.51 2.902.51H439a3.5 3.5 0 0 1 3.5 3.5V490a3.5 3.5 0 0 1-3.5 3.5H4A3.5 3.5 0 0 1 .5 490V4A3.5 3.5 0 0 1 4 .5Z';

function HelpedCardShape({
  fillColor,
  strokeColor,
}: {
  fillColor: string;
  strokeColor: string;
}) {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 443 494"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path d={HELPED_CARD_SHAPE_FILL_PATH} fill={fillColor} />
        <path
          d={HELPED_CARD_SHAPE_STROKE_PATH}
          fill="none"
          stroke={strokeColor}
          strokeOpacity={0.2}
        />
      </svg>
    </div>
  );
}

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
  contain: strict;
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
  --color-text-muted: ${theme.colors.secondary.text[80]};
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

export function HelpedCard({ card }: CardProps) {
  const { i18n } = useLingui();
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
          <Heading as="h3" size="xs" weight="medium">
            <HeadingPart fontFamily="sans">{i18n._(card.heading)}</HeadingPart>
          </Heading>
        </CardTitleWrap>
        <CardBodyWrap>
          <Body as="p" size="sm">
            {i18n._(card.body)}
          </Body>
        </CardBodyWrap>
      </CopyBlock>
      <CtaRow>
        <LocalizedLinkButton
          color="primary"
          href={card.href}
          label={i18n._(msg`Read the case`)}
          variant="outlined"
        />
      </CtaRow>
    </CardRoot>
  );
}
