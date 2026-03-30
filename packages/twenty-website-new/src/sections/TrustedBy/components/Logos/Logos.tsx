import { CLIENT_ICONS } from '@/icons';
import {
  TrustedByClientCountLabelType,
  TrustedByLogosType,
} from '@/sections/TrustedBy/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import React from 'react';
import { ClientCount } from '../ClientCount/ClientCount';
import { Logo } from '../Logo/Logo';

const StyledLogos = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  row-gap: ${theme.spacing(4)};
  justify-content: center;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: row;
    column-gap: ${theme.spacing(14)};
    height: 48px;
  }
`;

type LogosProps = {
  clientCountLabel: TrustedByClientCountLabelType;
  logos: TrustedByLogosType[];
};

export function Logos({ clientCountLabel, logos }: LogosProps) {
  return (
    <StyledLogos>
      {logos.map((logo, index) => {
        const IconComponent = CLIENT_ICONS[logo.icon];
        if (!IconComponent) return null;

        return (
          <React.Fragment key={`${logo.icon}-${index}`}>
            {index === 1 && <ClientCount label={clientCountLabel.text} />}
            <Logo>
              <IconComponent
                fillColor={theme.colors.secondary.background[100]}
                size={115}
              />
            </Logo>
          </React.Fragment>
        );
      })}
    </StyledLogos>
  );
}
