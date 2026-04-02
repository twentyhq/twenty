import {
  type TrustedByClientCountLabelType,
  type TrustedByLogosType,
} from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { ClientCount } from '../ClientCount/ClientCount';
import { Logo } from '../Logo/Logo';

const StyledLogos = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(5)};
  justify-content: center;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: row;
    gap: ${theme.spacing(14)};
  }
`;

const LogoStrip = styled.div`
  align-items: center;
  display: grid;
  gap: ${theme.spacing(4)} ${theme.spacing(6)};
  grid-template-columns: repeat(2, minmax(0, max-content));
  justify-items: center;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    gap: ${theme.spacing(14)};
  }
`;

type LogosProps = {
  clientCountLabel: TrustedByClientCountLabelType;
  logos: TrustedByLogosType[];
};

export function Logos({ clientCountLabel, logos }: LogosProps) {
  return (
    <StyledLogos>
      <LogoStrip>
        {logos.map((logo, index) => (
          <Logo fit={logo.fit} key={`${logo.src}-${index}`} src={logo.src} />
        ))}
      </LogoStrip>
      <ClientCount label={clientCountLabel.text} />
    </StyledLogos>
  );
}
