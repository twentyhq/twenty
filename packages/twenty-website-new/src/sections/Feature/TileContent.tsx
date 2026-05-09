import { styled } from '@linaria/react';

import { Body, Heading, HeadingPart } from '@/design-system/components';
import { INFORMATIVE_ICONS } from '@/icons';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { theme } from '@/theme';

import type { FeatureTileType } from './Feature';

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  padding: ${theme.spacing(4)};
  row-gap: ${theme.spacing(4)};
`;

const TitleRow = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
`;

const IconSlot = styled.div`
  align-items: center;
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(1)};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const HeadingWrap = styled.div`
  min-width: 0;
`;

const Bullets = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  list-style-type: disc;
  margin: 0;
  padding: 0;
  padding-left: ${theme.spacing(5)};
  row-gap: ${theme.spacing(2)};
`;

const BulletItem = styled.li`
  margin: 0;

  &::marker {
    color: ${theme.colors.primary.text[40]};
  }
`;

type TileContentProps = {
  tile: FeatureTileType;
};

export function TileContent({ tile }: TileContentProps) {
  const i18n = getServerI18n();
  const Icon = INFORMATIVE_ICONS[tile.icon];

  return (
    <Content>
      <TitleRow>
        <IconSlot>
          {Icon ? (
            <Icon color={theme.colors.primary.background[100]} size={16} />
          ) : null}
        </IconSlot>
        <HeadingWrap>
          <Heading as="h3" size="xs" weight="medium">
            <HeadingPart fontFamily="sans">{i18n._(tile.heading)}</HeadingPart>
          </Heading>
        </HeadingWrap>
      </TitleRow>
      <Bullets>
        {tile.bullets.map((bullet, bulletIndex) => (
          <BulletItem key={bulletIndex}>
            <Body as="span" size="sm" weight="regular">
              {i18n._(bullet)}
            </Body>
          </BulletItem>
        ))}
      </Bullets>
    </Content>
  );
}
