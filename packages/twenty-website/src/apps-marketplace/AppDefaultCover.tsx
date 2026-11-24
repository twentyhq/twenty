import { styled } from '@linaria/react';

import { PlusMark, TwentyLogo } from '@/icons';
import { semanticColor, spacing } from '@/tokens';

import { AppIcon } from './AppIcon';
import { type MarketplaceApp } from './marketplace-app';

// The backdrop twenty-cli draws under the covers it generates.
const BACKDROP_URL = '/images/apps/default-cover.png';

// Fills the box its parent gives it, whatever its ratio.
const Frame = styled.div`
  align-items: center;
  background: url(${BACKDROP_URL}) center / cover no-repeat;
  display: flex;
  gap: ${spacing(4)};
  inset: 0;
  justify-content: center;
  position: absolute;
`;

const Cross = styled.span`
  color: ${semanticColor.inkSubtle};
  display: block;
  transform: rotate(45deg);
`;

type AppDefaultCoverProps = {
  app: MarketplaceApp;
  tilePx: number;
};

// The cover of an app that ships none, drawn like the one twenty-cli
// generates (twenty-cli/src/app/bundles/cover): the app's logo × Twenty's,
// over the halftone backdrop.
export function AppDefaultCover({ app, tilePx }: AppDefaultCoverProps) {
  return (
    <Frame aria-hidden>
      <AppIcon app={app} sizePx={tilePx} />
      <Cross>
        <PlusMark sizePx={Math.round(tilePx / 3)} />
      </Cross>
      <TwentyLogo sizePx={tilePx} />
    </Frame>
  );
}
