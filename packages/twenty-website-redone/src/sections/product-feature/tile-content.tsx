import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { INFORMATIVE_MARKS } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, fontFamily, fontSize, mediaUp, spacing } from '@/tokens';
import { Body, Heading } from '@/ui';

import { type FeatureTile } from './feature-tiles';

const BULLET_ICON_STROKE_WIDTH = 1.5;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  padding: ${spacing(4)} ${spacing(5)};

  ${mediaUp('md')} {
    padding: ${spacing(5)} ${spacing(6)};
  }

  &[data-spotlight] {
    flex: 1;
    gap: ${spacing(4)};

    ${mediaUp('md')} {
      justify-content: center;
      padding: ${spacing(8)} ${spacing(7)};
    }
  }
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2.5)};
`;

const CategoryDot = styled.span`
  background-color: ${color('blue')};
  border-radius: 2px;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const CategoryLabel = styled.span`
  color: ${color('black-60')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.06em;
  line-height: ${fontSize(4)};
  text-transform: uppercase;
`;

const Counter = styled.span`
  color: ${color('black-20')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.04em;
  margin-left: auto;
  white-space: nowrap;
`;

const CardRule = styled.div`
  border-top: 1px dotted ${color('black-10')};
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
  column-gap: ${spacing(2.5)};
  display: flex;
  padding: ${spacing(2)} 0;

  &:not(:first-child) {
    border-top: 1px solid ${color('black-10')};
  }
`;

const BulletIconSlot = styled.span`
  color: ${color('blue')};
  display: inline-flex;
  flex-shrink: 0;
`;

// Outranks the Body component's data-variant declarations.
const bulletTextClassName = css`
  &&& {
    display: block;
    overflow-wrap: anywhere;
    color: ${color('black-80')};
  }
`;

export function TileContent({
  counter,
  spotlight,
  tile,
}: {
  counter: string;
  spotlight: boolean;
  tile: FeatureTile;
}) {
  const i18n = getServerI18n();
  // Bullets are an authored fixed list: position is identity.
  const bullets = tile.bullets.map((bullet, bulletNumber) => ({
    bullet,
    bulletNumber,
  }));

  return (
    <Content data-spotlight={spotlight ? '' : undefined}>
      <Header>
        <CategoryDot aria-hidden />
        <CategoryLabel>{i18n._(tile.category)}</CategoryLabel>
        <Counter>{counter}</Counter>
      </Header>

      <Heading
        as="h3"
        family="sans"
        size={spotlight ? 'sm' : 'xs'}
        weight="medium"
      >
        {i18n._(tile.heading)}
      </Heading>

      {spotlight ? (
        <Body muted size="sm">
          {i18n._(tile.description)}
        </Body>
      ) : null}

      <CardRule />

      <BulletList>
        {bullets.map(({ bullet, bulletNumber }) => {
          const Mark = INFORMATIVE_MARKS[bullet.icon];

          return (
            <BulletItem key={bulletNumber}>
              <BulletIconSlot aria-hidden>
                <Mark
                  color="currentColor"
                  sizePx={16}
                  strokeWidth={BULLET_ICON_STROKE_WIDTH}
                />
              </BulletIconSlot>
              <Body className={bulletTextClassName} size="sm">
                {i18n._(bullet.text)}
              </Body>
            </BulletItem>
          );
        })}
      </BulletList>
    </Content>
  );
}
