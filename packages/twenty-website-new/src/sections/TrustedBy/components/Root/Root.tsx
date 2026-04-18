import { Container } from '@/design-system/components';
import { PlusIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { Children, type ReactNode } from 'react';

const CORNER_OFFSET = '-6px';

const StyledSection = styled.section`
  padding-bottom: ${theme.spacing(12)};
  padding-top: ${theme.spacing(12)};
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(16)};
    padding-top: ${theme.spacing(16)};
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

const StyledCard = styled.div`
  align-items: center;
  background-color: ${theme.colors.primary.background[100]};
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
  height: 12px;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  width: 12px;
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
}

export function Root({ children }: RootProps) {
  const [label, logos, count] = Children.toArray(children);
  return (
    <StyledSection aria-label="Trusted by leading organizations">
      <StyledContainer>
        <StyledCard>
          <CornerTopLeft aria-hidden>
            <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
          </CornerTopLeft>
          <CornerTopRight aria-hidden>
            <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
          </CornerTopRight>
          <CornerBottomLeft aria-hidden>
            <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
          </CornerBottomLeft>
          <CornerBottomRight aria-hidden>
            <PlusIcon size={12} strokeColor={theme.colors.highlight[100]} />
          </CornerBottomRight>
          <StyledLabelCell>{label}</StyledLabelCell>
          <StyledLogosCell>{logos}</StyledLogosCell>
          <StyledCountCell>{count}</StyledCountCell>
        </StyledCard>
      </StyledContainer>
    </StyledSection>
  );
}
