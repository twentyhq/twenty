import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  semanticColor,
} from '@/tokens';

const LogoBlock = styled.span`
  align-items: center;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1.5)};
  color: ${semanticColor.ink};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${fontFamily('serif')};
  font-weight: ${FONT_WEIGHT.light};
  height: var(--app-logo-size);
  justify-content: center;
  overflow: hidden;
  width: var(--app-logo-size);
`;

const LogoImage = styled.img`
  display: block;
  height: 62%;
  object-fit: contain;
  width: 62%;
`;

type AppLogoStyle = CSSProperties & {
  '--app-logo-size': string;
};

type AppLogoProps = {
  name: string;
  logoUrl?: string;
  size?: number;
  loading?: 'lazy' | 'eager';
};

const getInitial = (name: string): string =>
  name.trim().charAt(0).toUpperCase() || '?';

export function AppLogo({
  name,
  logoUrl,
  size = 48,
  loading = 'lazy',
}: AppLogoProps) {
  const style: AppLogoStyle = {
    '--app-logo-size': `${size}px`,
    fontSize: `${Math.round(size * 0.42)}px`,
  };

  return (
    <LogoBlock style={style}>
      {logoUrl !== undefined && logoUrl.length > 0 ? (
        <LogoImage src={logoUrl} alt={`${name} logo`} loading={loading} />
      ) : (
        getInitial(name)
      )}
    </LogoBlock>
  );
}
