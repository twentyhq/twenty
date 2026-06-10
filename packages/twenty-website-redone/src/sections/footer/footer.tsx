import { styled } from '@linaria/react';

import { TwentyLogo } from '@/icons';
import { color, mediaUp, spacing } from '@/tokens';
import { Container } from '@/ui';

import { FooterBottom } from './footer-bottom';
import { FooterNav } from './footer-nav';
import { FooterShape } from './footer-shape';

const FooterRoot = styled.footer`
  background-color: ${color('black')};
  width: 100%;
`;

// min-height (the old site hardcoded height) keeps the dark stage above the
// card without clipping if content or translations grow. The halftone
// visual that fills the stage arrives with the visual-runtime port.
const StageContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  min-height: 880px;
  padding-bottom: ${spacing(4)};
  position: relative;

  ${mediaUp('md')} {
    min-height: 920px;
  }

  ${mediaUp('lg')} {
    min-height: 1080px;
    padding-bottom: ${spacing(10)};
  }
`;

const Card = styled.div`
  margin-top: auto;
  padding: ${spacing(12)} ${spacing(4)};
  position: relative;
  z-index: 1;

  ${mediaUp('md')} {
    padding: ${spacing(20)} ${spacing(20)} ${spacing(12)};
  }
`;

export function Footer() {
  return (
    <FooterRoot>
      <StageContainer>
        <Card>
          <FooterShape />
          <TwentyLogo sizePx={40} />
          <FooterNav />
          <FooterBottom />
        </Card>
      </StageContainer>
    </FooterRoot>
  );
}
