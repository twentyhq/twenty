import type { HeadingType } from '@/design-system/components/Heading';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Heading } from './Heading';
import { Track } from './Track';

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
  children: ReactNode;
};

type HeadingElement = ReactElement<{ segments: HeadingType[] }>;

function findHeadingSlot(children: ReactNode): HeadingElement | null {
  let found: HeadingElement | null = null;
  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      typeof child.type === 'function' &&
      (child.type as { displayName?: string }).displayName ===
        Heading.displayName
    ) {
      found = child as HeadingElement;
    }
  });
  return found;
}

export function Root({ backgroundColor, children, color }: RootProps) {
  const headingSlot = findHeadingSlot(children);

  if (headingSlot === null) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        '<Marquee.Root> requires a <Marquee.Heading segments={...} /> child.',
      );
    }
    return null;
  }

  const segments = headingSlot.props.segments;

  return (
    <StyledSection style={{ backgroundColor, color }}>
      <Viewport>
        <Row>
          <Track heading={segments} reversed={false} />
        </Row>
        <Row>
          <Track heading={segments} reversed />
        </Row>
      </Viewport>
    </StyledSection>
  );
}
