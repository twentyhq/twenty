import { styled } from '@linaria/react';

import { FooterBackdrop } from './FooterBackdrop';

import { TwentyLogo } from '@/icons';
import { color, mediaUp, spacing } from '@/tokens';
import { Container } from '@/ui';

import { FooterBottom } from './FooterBottom';
import { FooterNav } from './FooterNav';
import { NotchedCardShape } from '@/ui/NotchedCardShape';

const FooterRoot = styled.footer`
  background-color: ${color('black')};
  width: 100%;
`;

// min-height (the old site hardcoded height) keeps the dark stage above the
// card without clipping if content or translations grow.
const StageContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  min-height: 880px;
  padding-bottom: ${spacing(4)};
  /* The stage may never collapse: the notch needs its dark backdrop even
     when the card outgrows the min-height (stacked groups on tablets). */
  padding-top: ${spacing(30)};
  position: relative;

  ${mediaUp('md')} {
    min-height: 920px;
    padding-top: ${spacing(40)};
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
    <FooterRoot data-menu-surface="" data-scheme="dark">
      <StageContainer>
        <FooterBackdrop />
        <Card>
          <NotchedCardShape />
          <TwentyLogo sizePx={40} />
          <FooterNav />
          <FooterBottom />
        </Card>
      </StageContainer>
    </FooterRoot>
  );
}
