import { styled } from '@linaria/react';
import { IconUsersGroup } from '@tabler/icons-react';
import NextImage from 'next/image';

import { FastPathIcon, LiveDataIcon } from '@/icons';
import { getServerI18n } from '@/platform/i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body } from '@/ui';

import { type FeatureCardRecord } from './feature-cards.data';

const CardContainer = styled.div`
  background-color: ${color('black-5')};
  border: 1px solid ${color('black-20')};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

const CardImage = styled.div`
  box-sizing: border-box;
  padding: ${spacing(2)} ${spacing(2)} 0;
  width: 100%;
`;

// Locked to the scene design box (411x508): the animated product mockup
// that mounts here (with the AppPreview wave) scales from exactly this
// frame; until then its gradient bottom layer fills it.
const CardImageFrame = styled.div`
  aspect-ratio: 411 / 508;
  background-color: ${color('black-10')};
  border-radius: 2px;
  isolation: isolate;
  margin: 0 auto;
  max-width: 411px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  padding: ${spacing(3)} ${spacing(4)} ${spacing(4)};
  row-gap: ${spacing(2)};
`;

const CardTitleRow = styled.div`
  align-items: center;
  column-gap: ${spacing(2)};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
`;

const IconMarker = styled.div`
  align-items: center;
  background: ${color('blue')};
  border-radius: ${radius(1)};
  color: ${color('white')};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const CardHeading = styled.h3`
  ${typeRampDeclarations('headingXs')}
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
  margin: 0;
  min-width: 0;
`;

function FeatureIcon({ icon }: { icon: FeatureCardRecord['icon'] }) {
  if (icon === 'users-group') {
    return <IconUsersGroup aria-hidden size={14} stroke={2} />;
  }
  if (icon === 'fast-path') return <FastPathIcon sizePx={14.667} />;
  return <LiveDataIcon sizePx={14.667} />;
}

export function FeatureCard({ card }: { card: FeatureCardRecord }) {
  const i18n = getServerI18n();

  return (
    <CardContainer>
      <CardImage>
        <CardImageFrame data-illustration={card.illustration}>
          <NextImage
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 411px"
            src={card.backgroundImageSrc}
            style={{ objectFit: 'cover' }}
          />
        </CardImageFrame>
      </CardImage>
      <CardContent>
        <CardTitleRow>
          <IconMarker aria-hidden>
            <FeatureIcon icon={card.icon} />
          </IconMarker>
          <CardHeading>{i18n._(card.heading)}</CardHeading>
        </CardTitleRow>
        <Body size="sm">{i18n._(card.body)}</Body>
      </CardContent>
    </CardContainer>
  );
}
