import { Container } from '@/design-system/components';
import { PlusIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ClientCount } from './ClientCount/ClientCount';
import { Logos } from './Logos';
import { Separator } from './Separator';

const CORNER_SIZE = 14;
const CORNER_OFFSET = '-7px';

const StyledSection = styled.section<{
  compactTop: boolean;
  compactBottom: boolean;
  backgroundColor?: string;
}>`
  background-color: ${({ backgroundColor }) =>
    backgroundColor ?? 'transparent'};
  padding-bottom: ${({ compactBottom }) =>
    compactBottom ? '0' : theme.spacing(12)};
  padding-top: ${({ compactTop }) =>
    compactTop ? theme.spacing(4) : theme.spacing(12)};
  position: relative;
  width: 100%;
  z-index: ${({ compactBottom }) => (compactBottom ? 2 : 'auto')};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${({ compactBottom }) =>
      compactBottom ? '0' : theme.spacing(16)};
    padding-top: ${({ compactTop }) =>
      compactTop ? theme.spacing(6) : theme.spacing(16)};
  }
`;

const StyledContainer = styled(Container)`
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const StyledCard = styled.div<{
  backgroundColor?: string;
}>`
  align-items: center;
  background-color: ${({ backgroundColor }) =>
    backgroundColor ?? theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(5)};
  padding: ${theme.spacing(5)} ${theme.spacing(6)};
  position: relative;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: stretch;
    flex-direction: row;
    gap: 0;
    padding: 0 ${theme.spacing(8)};
  }
`;

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${theme.spacing(5)} 0;

    & + & {
      border-left: 1px solid ${theme.colors.primary.border[10]};
    }
  }
`;

const StyledLabelCell = styled(StyledCell)`
  @media (min-width: ${theme.breakpoints.md}px) {
    padding-right: ${theme.spacing(6)};
  }
`;

const StyledLogosCell = styled(StyledCell)`
  flex: 1 1 auto;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(6)};
    padding-right: ${theme.spacing(6)};
  }
`;

const StyledCountCell = styled(StyledCell)`
  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(6)};
  }
`;

const CornerMarker = styled.span`
  align-items: center;
  display: flex;
  height: ${CORNER_SIZE}px;
  justify-content: center;
  line-height: 0;
  pointer-events: none;
  position: absolute;
  width: ${CORNER_SIZE}px;
`;

const CornerTopLeft = styled(CornerMarker)`
  left: ${CORNER_OFFSET};
  top: ${CORNER_OFFSET};
`;

const CornerTopRight = styled(CornerMarker)`
  right: ${CORNER_OFFSET};
  top: ${CORNER_OFFSET};
`;

const CornerBottomLeft = styled(CornerMarker)`
  bottom: ${CORNER_OFFSET};
  left: ${CORNER_OFFSET};
`;

const CornerBottomRight = styled(CornerMarker)`
  bottom: ${CORNER_OFFSET};
  right: ${CORNER_OFFSET};
`;

interface RootProps {
  children: ReactNode;
  compactTop?: boolean;
  compactBottom?: boolean;
  backgroundColor?: string;
  cardBackgroundColor?: string;
}

function findSlot(
  children: ReactNode,
  type: { displayName?: string },
): ReactElement | null {
  let found: ReactElement | null = null;
  let count = 0;
  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      typeof child.type === 'function' &&
      (child.type as { displayName?: string }).displayName === type.displayName
    ) {
      if (found === null) {
        found = child;
      }
      count += 1;
    }
  });
  if (count > 1 && process.env.NODE_ENV !== 'production') {
    throw new Error(
      `<TrustedBy.Root> received ${count} <${type.displayName}> children — exactly one is expected.`,
    );
  }
  return found;
}

export function Root({
  children,
  compactTop = false,
  compactBottom = false,
  backgroundColor,
  cardBackgroundColor,
}: RootProps) {
  const label = findSlot(children, Separator);
  const logos = findSlot(children, Logos);
  const count = findSlot(children, ClientCount);

  if (
    process.env.NODE_ENV !== 'production' &&
    (label === null || logos === null || count === null)
  ) {
    throw new Error(
      '<TrustedBy.Root> requires <TrustedBy.Separator>, <TrustedBy.Logos>, and <TrustedBy.ClientCount> children.',
    );
  }

  return (
    <StyledSection
      aria-label="Trusted by leading organizations"
      backgroundColor={backgroundColor}
      compactTop={compactTop}
      compactBottom={compactBottom}
    >
      <StyledContainer>
        <StyledCard backgroundColor={cardBackgroundColor}>
          <CornerTopLeft aria-hidden>
            <PlusIcon
              size={CORNER_SIZE}
              strokeColor={theme.colors.highlight[100]}
            />
          </CornerTopLeft>
          <CornerTopRight aria-hidden>
            <PlusIcon
              size={CORNER_SIZE}
              strokeColor={theme.colors.highlight[100]}
            />
          </CornerTopRight>
          <CornerBottomLeft aria-hidden>
            <PlusIcon
              size={CORNER_SIZE}
              strokeColor={theme.colors.highlight[100]}
            />
          </CornerBottomLeft>
          <CornerBottomRight aria-hidden>
            <PlusIcon
              size={CORNER_SIZE}
              strokeColor={theme.colors.highlight[100]}
            />
          </CornerBottomRight>
          <StyledLabelCell>{label}</StyledLabelCell>
          <StyledLogosCell>{logos}</StyledLogosCell>
          <StyledCountCell>{count}</StyledCountCell>
        </StyledCard>
      </StyledContainer>
    </StyledSection>
  );
}
