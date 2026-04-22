import { type TrustedByLogosType } from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { Logo } from '../Logo/Logo';

const LogoStrip = styled.div`
  align-items: center;
  display: grid;
  gap: ${theme.spacing(4)} ${theme.spacing(4)};
  grid-template-columns: repeat(3, minmax(0, max-content));
  justify-content: center;
  justify-items: center;

  & > :last-child:nth-child(3n + 1) {
    grid-column: 2;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing(8)};
    justify-content: center;
  }
`;

type LogosProps = {
  logos: TrustedByLogosType[];
};

export function Logos({ logos }: LogosProps) {
  return (
    <LogoStrip>
      {logos.map((logo, index) => (
        <Logo
          fit={logo.fit}
          grayBrightness={logo.grayBrightness}
          grayOpacity={logo.grayOpacity}
          key={`${logo.src}-${index}`}
          src={logo.src}
        />
      ))}
    </LogoStrip>
  );
}
