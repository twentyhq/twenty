import { styled } from '@linaria/react';

import type { HeadingType } from '@/design-system/components/Heading/types/Heading';
import { theme } from '@/theme';

import { Track } from '../Track/Track';

const StyledSection = styled.section`
  min-width: 0;
  overflow: clip;
  padding-bottom: ${theme.spacing(20)};
  padding-top: ${theme.spacing(20)};
  width: 100%;
`;

const Viewport = styled.div`
  display: flex;
  flex-direction: column;
  height: 280px;
  overflow: hidden;
  width: 100%;
`;

const Row = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

type RootProps = {
  backgroundColor: string;
  color: string;
  heading: HeadingType[];
};

export function Root({ backgroundColor, color, heading }: RootProps) {
  return (
    <StyledSection style={{ backgroundColor, color }}>
      <Viewport>
        <Row>
          <Track heading={heading} reversed={false} />
        </Row>
        <Row>
          <Track heading={heading} reversed />
        </Row>
      </Viewport>
    </StyledSection>
  );
}
