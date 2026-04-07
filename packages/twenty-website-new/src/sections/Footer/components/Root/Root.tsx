import { Container } from '@/design-system/components';
import type { IllustrationType } from '@/design-system/components/Illustration/types/Illustration';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
import { FooterBackground } from '../FooterBackground/FooterBackground';
import { FooterShape } from '../../FooterShape';

const FooterRoot = styled.footer`
  background-color: ${theme.colors.secondary.background[100]};
  width: 100%;
`;

const FooterContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  height: 1280px;
  position: relative;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.lg}px) {
    padding-bottom: ${theme.spacing(10)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const FooterContent = styled.div`
  margin-top: auto;
  padding-bottom: ${theme.spacing(12)};
  padding-top: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(20)};
    padding-right: ${theme.spacing(20)};
    padding-top: ${theme.spacing(20)};
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    padding-left: ${theme.spacing(30)};
    padding-right: ${theme.spacing(30)};
  }
`;

type RootProps = {
  children: ReactNode;
  illustration: IllustrationType;
};

export function Root({ children, illustration }: RootProps) {
  return (
    <FooterRoot>
      <FooterContainer>
        <FooterBackground aria-hidden illustration={illustration} />
        <FooterContent>
          <FooterShape fillColor={theme.colors.primary.background[100]} />
          {children}
        </FooterContent>
      </FooterContainer>
    </FooterRoot>
  );
}
