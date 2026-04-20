import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { Container, GuideCrosshair } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { SignoffShape } from '@/sections/Signoff/SignoffShape';
import { theme } from '@/theme';

const GUIDE_CROSSHAIR_BY_PAGE: Partial<
  Record<Pages, { crossX: string; crossY: string; lineColor?: string }>
> = {
  [Pages.Partners]: { crossX: 'calc(50% + 334px)', crossY: '198px' },
};

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;

  &[data-page='partners'] {
    position: relative;
  }

  &[data-shaped] {
    isolation: isolate;
    overflow: hidden;
    position: relative;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='partners'][data-center='true'] {
      min-height: 759px;
      overflow: hidden;
      position: relative;
    }

    &[data-page='partners'][data-center='true'] > div {
      justify-content: center;
      min-height: 759px;
      padding-bottom: 0;
      padding-top: 0;
    }
  }
`;

const StyledContainer = styled(Container)`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-bottom: ${theme.spacing(20)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(20)};
  text-align: center;
  position: relative;
  z-index: 10;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(28)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(28)};
  }
`;

type RootPropsSimple = {
  backgroundColor: string;
  centerContent?: boolean;
  children: ReactNode;
  color: string;
  page?: Pages;
  variant?: 'simple';
};

type RootPropsShaped = {
  backgroundColor: string;
  centerContent?: boolean;
  children: ReactNode;
  color: string;
  page?: Pages;
  shapeFillColor: string;
  variant: 'shaped';
};

type RootProps = RootPropsSimple | RootPropsShaped;

export function Root(props: RootProps) {
  const { backgroundColor, centerContent, children, color, page } = props;
  const isShaped = props.variant === 'shaped';
  const shapeFillColor = isShaped ? props.shapeFillColor : undefined;
  const shouldCenterContent = centerContent ?? page === Pages.Partners;

  return (
    <StyledSection
      data-center={shouldCenterContent ? 'true' : undefined}
      data-page={page}
      data-shaped={isShaped ? '' : undefined}
      style={{ backgroundColor, color }}
    >
      {isShaped && shapeFillColor ? (
        <SignoffShape fillColor={shapeFillColor} />
      ) : null}
      {page && GUIDE_CROSSHAIR_BY_PAGE[page] ? (
        <GuideCrosshair
          crossX={GUIDE_CROSSHAIR_BY_PAGE[page]!.crossX}
          crossY={GUIDE_CROSSHAIR_BY_PAGE[page]!.crossY}
          lineColor={GUIDE_CROSSHAIR_BY_PAGE[page]!.lineColor}
        />
      ) : null}
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  );
}
