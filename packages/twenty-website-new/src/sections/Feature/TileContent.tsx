import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { Body, Heading, HeadingPart } from '@/design-system/components';
import { INFORMATIVE_ICONS } from '@/icons';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { theme } from '@/theme';

import type { FeatureTileType } from './Feature';

const DIVIDER_COLOR = theme.colors.primary.border[10];
const ICON_STROKE_WIDTH = 1.5;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  padding: ${theme.spacing(4)} ${theme.spacing(5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${theme.spacing(5)} ${theme.spacing(6)};
  }

  &[data-spotlight='true'] {
    flex: 1;
    gap: ${theme.spacing(4)};

    @media (min-width: ${theme.breakpoints.md}px) {
      justify-content: center;
      padding: ${theme.spacing(8)} ${theme.spacing(7)};
    }
  }
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(2.5)};
`;

const CategoryDot = styled.span`
  background-color: ${theme.colors.highlight[100]};
  border-radius: 2px;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const CategoryLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.06em;
  line-height: ${theme.lineHeight(4)};
  text-transform: uppercase;
`;

const Counter = styled.span`
  color: ${theme.colors.primary.text[20]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.04em;
  margin-left: auto;
  white-space: nowrap;
`;

const descriptionClassName = css`
  color: ${theme.colors.primary.text[60]};
`;

const CardRule = styled.div`
  border-top: 1px dotted ${DIVIDER_COLOR};
  flex-shrink: 0;
  height: 0;
  width: 100%;
`;

const BulletList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BulletItem = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(2.5)};
  display: flex;
  padding: ${theme.spacing(2)} 0;

  &:not(:first-child) {
    border-top: 1px solid ${DIVIDER_COLOR};
  }
`;

const BulletIconSlot = styled.span`
  color: ${theme.colors.highlight[100]};
  display: inline-flex;
  flex-shrink: 0;
`;

const bulletTextClassName = css`
  display: block;
  overflow-wrap: anywhere;
  color: ${theme.colors.primary.text[80]};
`;

type TileContentProps = {
  counter: string;
  spotlight: boolean;
  tile: FeatureTileType;
};

export function TileContent({ counter, spotlight, tile }: TileContentProps) {
  const i18n = getServerI18n();
  return (
    <Content data-spotlight={spotlight}>
      <Header>
        <CategoryDot aria-hidden />
        <CategoryLabel>{i18n._(tile.category)}</CategoryLabel>
        <Counter>{counter}</Counter>
      </Header>

      <Heading as="h3" size={spotlight ? 'sm' : 'xs'} weight="medium">
        <HeadingPart fontFamily="sans">{i18n._(tile.heading)}</HeadingPart>
      </Heading>

      {spotlight ? (
        <Body
          as="p"
          className={descriptionClassName}
          size="sm"
          weight="regular"
        >
          {i18n._(tile.description)}
        </Body>
      ) : null}

      <CardRule />

      <BulletList>
        {tile.bullets.map((bullet, bulletIndex) => {
          const Icon = INFORMATIVE_ICONS[bullet.icon];

          return (
            <BulletItem key={bulletIndex}>
              <BulletIconSlot aria-hidden>
                {Icon ? (
                  <Icon
                    color="currentColor"
                    size={16}
                    strokeWidth={ICON_STROKE_WIDTH}
                  />
                ) : null}
              </BulletIconSlot>
              <Body
                as="span"
                className={bulletTextClassName}
                size="sm"
                weight="regular"
              >
                {i18n._(bullet.text)}
              </Body>
            </BulletItem>
          );
        })}
      </BulletList>
    </Content>
  );
}
