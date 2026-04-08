import { Container } from '@/design-system/components';
import { IllustrationMount, type IllustrationId } from '@/illustrations';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
import { FooterShape } from '../../FooterShape';

const FooterRoot = styled.footer`
  background-color: ${theme.colors.secondary.background[100]};
  width: 100%;
`;

const FooterContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  height: 880px;
  position: relative;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 920px;
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    height: 1080px;
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
`;

type RootProps = {
  children: ReactNode;
  illustration: IllustrationId;
};

export function Root({ children, illustration }: RootProps) {
  return (
    <FooterRoot>
      <FooterContainer>
        <IllustrationMount illustration={illustration} />
        <FooterContent>
          <FooterShape fillColor={theme.colors.primary.background[100]} />
          {children}
        </FooterContent>
      </FooterContainer>
    </FooterRoot>
  );
}
