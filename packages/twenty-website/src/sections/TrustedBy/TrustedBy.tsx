import { Container } from '@/design-system/components';
import { PlusIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

export type TrustedByLogosType = {
  fit?: 'contain' | 'cover';
  grayBrightness?: number;
  grayOpacity?: number;
  src: string;
};

const CORNER_SIZE = 14;
const CORNER_OFFSET = '-7px';
const DEFAULT_GRAY_BRIGHTNESS = 1;
const DEFAULT_GRAY_OPACITY = 0.72;

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

const StyledCard = styled.div<{ backgroundColor?: string }>`
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

const SeparatorRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const SeparatorText = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(3)};
  font-family: ${theme.font.family.mono};
  font-weight: ${theme.font.weight.medium};
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0;
  line-height: ${theme.font.size(4)};
`;

const LogoStrip = styled.div`
  align-items: center;
  display: grid;
  gap: ${theme.spacing(4)} ${theme.spacing(4)};
  grid-template-columns: repeat(3, minmax(0, max-content));
  justify-content: center;
  justify-items: center;

  & > :last-child:nth-child(3n + 1) {
    grid-column: 2;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing(8)};
    justify-content: center;
  }
`;

const StyledLogo = styled.div`
  height: 28px;
  flex-shrink: 0;
  overflow: clip;
  position: relative;
  width: 56px;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 32px;
    width: 64px;
  }
`;

const StyledChip = styled.div`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  gap: ${theme.spacing(2)};

  img {
    filter: grayscale(1);
    opacity: 0.72;
  }
`;

const StyledCountText = styled.span`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.02em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
`;

function Logo({
  fit = 'contain',
  grayBrightness = DEFAULT_GRAY_BRIGHTNESS,
  grayOpacity = DEFAULT_GRAY_OPACITY,
  src,
}: TrustedByLogosType) {
  return (
    <StyledLogo aria-hidden="true">
      <NextImage
        alt=""
        fill
        sizes="(min-width: 921px) 80px, 64px"
        src={src}
        unoptimized
        style={{
          filter: `grayscale(1) brightness(${grayBrightness})`,
          objectFit: fit,
          objectPosition: 'center',
          opacity: grayOpacity,
        }}
      />
    </StyledLogo>
  );
}

interface RootProps {
  separator: ReactNode;
  logos: TrustedByLogosType[];
  clientCount: ReactNode;
  compactTop?: boolean;
  compactBottom?: boolean;
  backgroundColor?: string;
  cardBackgroundColor?: string;
}

function Root({
  separator,
  logos,
  clientCount,
  compactTop = false,
  compactBottom = false,
  backgroundColor,
  cardBackgroundColor,
}: RootProps) {
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
          <StyledLabelCell>
            <SeparatorRow>
              <SeparatorText>{separator}</SeparatorText>
            </SeparatorRow>
          </StyledLabelCell>
          <StyledLogosCell>
            <LogoStrip>
              {logos.map((logo, index) => (
                <Logo
                  fit={logo.fit}
                  grayBrightness={logo.grayBrightness}
                  grayOpacity={logo.grayOpacity}
                  key={`${logo.src}-${index}`}
                  src={logo.src}
                />
              ))}
            </LogoStrip>
          </StyledLogosCell>
          <StyledCountCell>
            <StyledChip>
              <NextImage
                alt=""
                height={14}
                src="/images/home/logo-bar/others-icon.svg"
                unoptimized
                width={14}
              />
              <StyledCountText>{clientCount}</StyledCountText>
            </StyledChip>
          </StyledCountCell>
        </StyledCard>
      </StyledContainer>
    </StyledSection>
  );
}

export const TrustedBy = { Root };
