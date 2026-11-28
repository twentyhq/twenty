import { styled } from '@linaria/react';

import { DURATION, EASING, semanticColor } from '@/tokens';
import { TWENTY_MARK_PATH } from './twenty-mark-path';

const LogoSvg = styled.svg`
  rect,
  path {
    transition: fill ${DURATION.md} ${EASING.gentle};
  }
`;

export type TwentyLogoProps = {
  sizePx?: number;
};

export function TwentyLogo({ sizePx = 40 }: TwentyLogoProps) {
  return (
    <LogoSvg
      fill="none"
      height={sizePx}
      viewBox="0 0 40 40"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={semanticColor.ink} height={40} rx={4} width={40} />
      <path d={TWENTY_MARK_PATH} fill={semanticColor.surface} />
    </LogoSvg>
  );
}
