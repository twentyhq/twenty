import { Body, Heading } from '@/design-system/components';
import type { ImageType } from '@/design-system/components/Image/types/Image';
import { INFORMATIVE_ICONS } from '@/icons';
import type { FeatureTileType } from '@/sections/Feature/types/FeatureTile';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

const TileRoot = styled.article`
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

const VisualArea = styled.div`
  background-color: ${theme.colors.primary.border[10]};
  height: 200px;
  overflow: hidden;
  position: relative;
  width: 100%;

  &[data-index='0'] {
    height: 220px;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 240px;

    &[data-index='0'] {
      height: 320px;
    }
  }
`;

const ImageInset = styled.div`
  bottom: 0;
  left: ${theme.spacing(4)};
  position: absolute;
  right: ${theme.spacing(4)};
  top: ${theme.spacing(4)};
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    left: ${theme.spacing(8)};
    right: ${theme.spacing(8)};
    top: ${theme.spacing(8)};

    &[data-index='0'] {
      left: 10%;
      right: 10%;
      top: ${theme.spacing(6)};
    }
    &[data-index='3'] {
      left: 0;
      right: 0;
    }
  }

  img {
    object-fit: contain;
    object-position: bottom center;
  }

  &[data-index='3'] img {
    object-position: bottom left;
  }
`;

const MaskOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  &[data-index='0'] img {
    object-position: center 20%;
  }
  &[data-index='1'] img {
    object-position: left 40%;
  }
  &[data-index='2'] img {
    object-position: right 40%;
  }
  &[data-index='3'] img {
    object-position: left 60%;
  }
  &[data-index='4'] img {
    object-position: right 60%;
  }
  &[data-index='5'] img {
    object-position: left 80%;
  }
  &[data-index='6'] img {
    object-position: right 80%;
  }
`;

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

type TileProps = {
  index: number;
  mask: ImageType;
  tile: FeatureTileType;
};

export function Tile({ index, mask, tile }: TileProps) {
  const Icon = INFORMATIVE_ICONS[tile.icon];

  return (
    <TileRoot>
      <VisualArea data-index={index}>
        <ImageInset data-index={index}>
          <NextImage
            alt={tile.image.alt}
            fill
            sizes="(min-width: 921px) 50vw, 100vw"
            src={tile.image.src}
          />
        </ImageInset>
        <MaskOverlay aria-hidden data-index={index}>
          <NextImage
            alt={mask.alt}
            fill
            sizes="(min-width: 921px) 50vw, 100vw"
            src={mask.src}
          />
        </MaskOverlay>
      </VisualArea>
      <Content>
        <TitleRow>
          <IconSlot>
            {Icon ? (
              <Icon color={theme.colors.primary.background[100]} size={16} />
            ) : null}
          </IconSlot>
          <HeadingWrap>
            <Heading
              as="h3"
              segments={tile.heading}
              size="xs"
              weight="medium"
            />
          </HeadingWrap>
        </TitleRow>
        <Bullets>
          {tile.bullets.map((bullet, bulletIndex) => (
            <BulletItem key={bulletIndex}>
              <Body as="span" body={bullet} size="sm" weight="regular" />
            </BulletItem>
          ))}
        </Bullets>
      </Content>
    </TileRoot>
  );
}
