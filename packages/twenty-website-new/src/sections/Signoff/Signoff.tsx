import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import {
  Body as BaseBody,
  Container,
  GuideCrosshair,
  Heading as BaseHeading,
} from '@/design-system/components';
import { type Page, Pages } from '@/lib/pages';
import { theme, type Scheme } from '@/theme';

const SIGNOFF_SHAPE_PATH =
  'M0 4a4 4 0 0 1 4-4h344.32c4.197 0 8.369.66 12.361 1.958l49.5 16.084A40 40 0 0 0 422.542 20h517.7c4.293 0 8.559-.691 12.633-2.047l47.785-15.906A40 40 0 0 1 1013.29 0H1356a4 4 0 0 1 4 4v16H0z';

const GUIDE_CROSSHAIR_BY_PAGE: Partial<
  Record<Page, { crossX: string; crossY: string; lineColor?: string }>
> = {
  [Pages.Partners]: { crossX: 'calc(50% + 334px)', crossY: '198px' },
};

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;

  &[data-scheme='light'] {
    background-color: var(--color-white);
    color: var(--color-text);
  }

  &[data-scheme='muted'] {
    background-color: var(--color-neutral);
    color: var(--color-text);
  }

  &[data-scheme='dark'] {
    background-color: var(--color-black);
    color: var(--color-text);
  }

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

const HeadingWrap = styled.div`
  margin-bottom: ${theme.spacing(2)};
  margin-left: auto;
  margin-right: auto;
  max-width: ${theme.layout.editorial};
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='partners'] {
      white-space: pre-line;
    }
  }
`;

const Subline = styled.div`
  color: var(
    --color-text-muted,
    color-mix(in srgb, currentColor 80%, transparent)
  );
  margin-bottom: ${theme.spacing(6)};
  max-width: 452px;
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='partners'] {
      white-space: pre-line;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: ${theme.spacing(2)};
  justify-content: center;
  row-gap: ${theme.spacing(1)};
`;

function SignoffShape({ fillColor }: { fillColor: string }) {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <svg
        width="100%"
        height="20"
        viewBox="0 0 1360 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path d={SIGNOFF_SHAPE_PATH} fill={fillColor} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 19,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: fillColor,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
    </div>
  );
}

type RootPropsSimple = {
  backgroundColor?: string;
  centerContent?: boolean;
  children: ReactNode;
  color?: string;
  page?: Page;
  scheme?: Scheme;
  variant?: 'simple';
};

type RootPropsShaped = {
  backgroundColor?: string;
  centerContent?: boolean;
  children: ReactNode;
  color?: string;
  page?: Page;
  scheme?: Scheme;
  shapeFillColor: string;
  variant: 'shaped';
};

type RootProps = RootPropsSimple | RootPropsShaped;

function Root(props: RootProps) {
  const { backgroundColor, centerContent, children, color, page, scheme } =
    props;
  const isShaped = props.variant === 'shaped';
  const shapeFillColor = isShaped ? props.shapeFillColor : undefined;
  const shouldCenterContent = centerContent ?? page === Pages.Partners;

  return (
    <StyledSection
      data-center={shouldCenterContent ? 'true' : undefined}
      data-page={page}
      data-scheme={scheme}
      data-shaped={isShaped ? '' : undefined}
      style={scheme ? undefined : { backgroundColor, color }}
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

function Heading({ children, page }: { children: ReactNode; page?: Page }) {
  return (
    <HeadingWrap data-page={page}>
      <BaseHeading as="h2" size="xl" weight="light">
        {children}
      </BaseHeading>
    </HeadingWrap>
  );
}

function Body({ children, page }: { children: ReactNode; page?: Page }) {
  return (
    <Subline data-page={page}>
      <BaseBody as="p" size="sm" weight="regular">
        {children}
      </BaseBody>
    </Subline>
  );
}

function Cta({ children }: { children: ReactNode }) {
  return <Actions>{children}</Actions>;
}

export const Signoff = { Body, Cta, Heading, Root };
